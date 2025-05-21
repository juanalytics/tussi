const Cart = require('../models/Cart');
const { validateCartItem, validateQuantityUpdate } = require('../utils/validation');

/**
 * @desc    Obtener carrito del usuario autenticado
 * @route   GET /api/cart
 * @access  Public
 */
exports.getCart = async (req, res) => {
  try {
// Verificar que req.user existe y tiene id
if (!req.user || !req.user.id) {
  return res.status(400).json({
    success: false,
    message: 'Usuario no autenticado correctamente'
  });
}

    // Usamos el ID del usuario autenticado (proveniente del middleware)
    const userId = req.user.id;
    
    // Buscar carrito del usuario, creando uno nuevo si no existe
    const cart = await Cart.findOneAndUpdate(
      { userId },
      { $setOnInsert: { userId, items: [] } },
      { new: true, upsert: true }
    );
    
    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (error) {
    console.error('Error al obtener carrito:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor al obtener el carrito',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Añadir producto al carrito
 * @route   POST /api/cart/items
 * @access  Private
 */
exports.addItem = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Validar datos del producto
    const { error, value } = validateCartItem(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Datos del producto inválidos',
        details: error.details.map(d => d.message)
      });
    }

    const productId = value.productId;
    const quantityToAdd = value.quantity || 1; // Cantidad a añadir, por defecto 1

    // Intenta encontrar el carrito del usuario Y el ítem específico.
    // Si lo encuentra, incrementa la cantidad.
    let cart = await Cart.findOneAndUpdate(
      { 
        userId, 
        'items.productId': productId 
      },
      { 
        $inc: { 'items.$.quantity': quantityToAdd } // Incrementa la cantidad existente
      },
      { new: true } // Devuelve el documento actualizado
    );

    // Si el producto no existía en el carrito (cart es null después del intento de $inc)
    if (!cart) {
      // Ahora, intenta añadir el producto como un nuevo ítem.
      // Si el carrito no existe para el userId, upsert: true lo creará.
      cart = await Cart.findOneAndUpdate(
        { userId }, // Busca el carrito del usuario
        { 
          // Solo $push el nuevo ítem. 
          // MongoDB inicializará 'items' como un array si es un documento nuevo.
          // El $setOnInsert para 'items: []' entra en conflicto con $push 'items'
          // si el documento se crea en la misma operación.
          $push: { items: { ...value, quantity: quantityToAdd } } 
          // Opcional: Si tienes otros campos que DEBEN inicializarse con $setOnInsert en un nuevo carrito,
          // podrías agregarlos aquí, siempre y cuando no sean 'items'.
          // Por ejemplo: $setOnInsert: { userId: userId, active: true } // Pero userId ya está en el filtro
        },
        { new: true, upsert: true } // new: true devuelve el doc modificado; upsert: true crea si no existe
      );
    }
    
    // Si 'cart' sigue siendo null aquí, algo salió muy mal.
    if (!cart) {
        return res.status(500).json({
            success: false,
            message: 'No se pudo actualizar o añadir el producto al carrito después de varios intentos.'
        });
    }

    res.status(200).json({
      success: true,
      data: cart // Retorna el carrito actualizado
    });

  } catch (error) {
    console.error('Error al añadir producto al carrito:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor al añadir producto',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Actualizar cantidad de un producto en el carrito
 * @route   PUT /api/cart/items/:productId
 * @access  Private
 */
exports.updateItemQuantity = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;
    
    // Validar datos de cantidad
    const { error, value } = validateQuantityUpdate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Datos de cantidad inválidos',
        details: error.details.map(d => d.message)
      });
    }
    
    // Actualizar cantidad en una sola operación
    const cart = await Cart.findOneAndUpdate(
      { 
        userId,
        'items.productId': productId 
      },
      { $set: { 'items.$.quantity': value.quantity } },
      { new: true }
    );
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado en el carrito'
      });
    }
    
    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (error) {
    console.error('Error al actualizar cantidad:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor al actualizar cantidad',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Eliminar un producto del carrito
 * @route   DELETE /api/cart/items/:productId
 * @access  Private
 */
exports.removeItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;
    
    // Eliminar el item en una sola operación
    const cart = await Cart.findOneAndUpdate(
      { userId },
      { $pull: { items: { productId } } },
      { new: true }
    );
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Carrito no encontrado'
      });
    }
    
    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (error) {
    console.error('Error al eliminar producto del carrito:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor al eliminar producto',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Vaciar el carrito
 * @route   DELETE /api/cart
 * @access  Private
 */
exports.clearCart = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const cart = await Cart.findOneAndUpdate(
      { userId },
      { $set: { items: [] } },
      { new: true }
    );
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Carrito no encontrado'
      });
    }
    
    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (error) {
    console.error('Error al vaciar carrito:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor al vaciar carrito',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};