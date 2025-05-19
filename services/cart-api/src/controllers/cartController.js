const Cart = require('../models/Cart');
const { validateCartItem, validateQuantityUpdate } = require('../utils/validation');

/**
 * @desc    Obtener carrito de un usuario
 * @route   GET /api/cart/:userId
 * @access  Private
 */
exports.getCart = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Verificar autorización (el usuario solo puede acceder a su propio carrito)
    // El servicio de autenticación ya ha validado el token y proporcionado la info del usuario
    if (req.user && req.user.id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para acceder a este carrito'
      });
    }
    
    // Buscar carrito del usuario
    let cart = await Cart.findOne({ userId });
    
    // Si no existe, crear uno nuevo
    if (!cart) {
      cart = await Cart.create({
        userId,
        items: []
      });
    }
    
    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (error) {
    console.error('Error al obtener carrito:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor al obtener el carrito'
    });
  }
};

/**
 * @desc    Añadir producto al carrito
 * @route   POST /api/cart/:userId/items
 * @access  Private
 */
exports.addItem = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Verificar autorización usando la información del usuario proporcionada
    // por el servicio de autenticación
    if (req.user && req.user.id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para modificar este carrito'
      });
    }
    
    // Validar datos del producto
    const { error, value } = validateCartItem(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }
    
    // Buscar carrito del usuario
    let cart = await Cart.findOne({ userId });
    
    // Si no existe, crear uno nuevo
    if (!cart) {
      cart = await Cart.create({
        userId,
        items: [value]
      });
      
      return res.status(201).json({
        success: true,
        data: cart
      });
    }
    
    // Comprobar si el producto ya está en el carrito
    const itemIndex = cart.items.findIndex(item => item.productId === value.productId);
    
    if (itemIndex > -1) {
      // Si existe, actualizar cantidad
      cart.items[itemIndex].quantity += value.quantity;
    } else {
      // Si no existe, añadir al carrito
      cart.items.push(value);
    }
    
    // Guardar cambios
    await cart.save();
    
    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (error) {
    console.error('Error al añadir producto al carrito:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor al añadir producto'
    });
  }
};

/**
 * @desc    Actualizar cantidad de un producto en el carrito
 * @route   PUT /api/cart/:userId/items/:productId
 * @access  Private
 */
exports.updateItemQuantity = async (req, res) => {
  try {
    const { userId, productId } = req.params;
    
    // Verificar autorización con la información del usuario proporcionada
    // por el servicio de autenticación
    if (req.user && req.user.id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para modificar este carrito'
      });
    }
    
    // Validar datos de cantidad
    const { error, value } = validateQuantityUpdate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }
    
    // Buscar carrito
    const cart = await Cart.findOne({ userId });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Carrito no encontrado'
      });
    }
    
    // Buscar el producto en el carrito
    const itemIndex = cart.items.findIndex(item => item.productId === productId);
    
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado en el carrito'
      });
    }
    
    // Actualizar cantidad
    cart.items[itemIndex].quantity = value.quantity;
    
    // Guardar cambios
    await cart.save();
    
    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (error) {
    console.error('Error al actualizar cantidad:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor al actualizar cantidad'
    });
  }
};

/**
 * @desc    Eliminar un producto del carrito
 * @route   DELETE /api/cart/:userId/items/:productId
 * @access  Private
 */
exports.removeItem = async (req, res) => {
  try {
    const { userId, productId } = req.params;
    
    // Verificar autorización con la información del usuario proporcionada
    // por el servicio de autenticación
    if (req.user && req.user.id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para modificar este carrito'
      });
    }
    
    // Buscar carrito
    const cart = await Cart.findOne({ userId });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Carrito no encontrado'
      });
    }
    
    // Filtrar items para eliminar el producto
    cart.items = cart.items.filter(item => item.productId !== productId);
    
    // Guardar cambios
    await cart.save();
    
    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (error) {
    console.error('Error al eliminar producto del carrito:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor al eliminar producto'
    });
  }
};

/**
 * @desc    Vaciar el carrito
 * @route   DELETE /api/cart/:userId
 * @access  Private
 */
exports.clearCart = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Verificar autorización con la información del usuario proporcionada
    // por el servicio de autenticación
    if (req.user && req.user.id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para modificar este carrito'
      });
    }
    
    // Buscar carrito
    const cart = await Cart.findOne({ userId });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Carrito no encontrado'
      });
    }
    
    // Vaciar items
    cart.items = [];
    
    // Guardar cambios
    await cart.save();
    
    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (error) {
    console.error('Error al vaciar carrito:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor al vaciar carrito'
    });
  }
};