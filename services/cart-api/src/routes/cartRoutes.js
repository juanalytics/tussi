const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { authenticate } = require('../middleware/auth');

// Aplicar middleware de autenticación a todas las rutas
//router.use(authenticate);

// Obtener carrito de un usuario
router.get('/:userId', cartController.getCart);

// Añadir producto al carrito
router.post('/:userId/items', cartController.addItem);

// Actualizar cantidad de un producto
router.put('/:userId/items/:productId', cartController.updateItemQuantity);

// Eliminar un producto del carrito
router.delete('/:userId/items/:productId', cartController.removeItem);

// Vaciar el carrito
router.delete('/:userId', cartController.clearCart);

module.exports = router;