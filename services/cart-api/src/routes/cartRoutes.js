const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { authenticate } = require('../middleware/auth');


router.use((req, res, next) => {
    console.log('=== MIDDLEWARE DIAGNÓSTICO ===');
    console.log('Ruta solicitada:', req.originalUrl);
    console.log('Headers recibidos:', req.headers);
    console.log('Token recibido:', req.headers.authorization);
    next(); // IMPORTANTE: Llama a next() para continuar
  });
  
  router.use((req, res, next) => {
    console.log('Antes de authenticate');
    next();
  });
  

// Aplicar middleware de autenticación a todas las rutas
router.use(authenticate);

// Obtener carrito de un usuario
router.get('/', cartController.getCart);

// Añadir producto al carrito
router.post('/items', cartController.addItem);  // Faltaba la barra diagonal

// Actualizar cantidad de un producto
router.put('/items/:productId', cartController.updateItemQuantity);  // Faltaba la barra diagonal

// Eliminar un producto del carrito
router.delete('/items/:productId', cartController.removeItem);

// Vaciar el carrito
router.delete('/', cartController.clearCart);

module.exports = router;