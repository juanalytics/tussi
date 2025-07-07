const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');

// Cargar variables de entorno
dotenv.config();

// Inicializar Express
const app = express();

// Conectar a MongoDB
connectDB();

// Middleware básico
app.use(helmet()); // Seguridad HTTP
app.use(cors()); // Habilitar CORS
app.use(express.json()); // Parsear JSON
app.use(morgan('dev')); // Logging de peticiones

// ⭐ MIDDLEWARE GLOBAL DE LOGGING
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// ⭐ MIDDLEWARE DE AUTENTICACIÓN PARA RUTAS QUE LO NECESITAN
const authMiddleware = (req, res, next) => {
  console.log(`[CART-API] ${req.method} ${req.path}`);
  console.log(`[CART-API] Headers:`, Object.keys(req.headers));
  
  const userId = req.headers['x-user-id'];
  if (userId) {
    req.user = {
      id: userId
    };
    console.log(`[CART-API] User ID from header: ${userId}`);
    next();
  } else {
    console.log(`[CART-API] No x-user-id header found`);
    return res.status(401).json({
      success: false,
      message: 'Usuario no autenticado correctamente'
    });
  }
};

// ===== RUTAS PÚBLICAS (SIN AUTENTICACIÓN) =====

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to Cart API',
    service: 'cart-api',
    version: '1.0.0'
  });
});

// Endpoint de salud (health check)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    service: 'cart-api',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/cart/test', (req, res) => {
  res.status(200).json({ 
    message: 'Ruta de prueba accesible',
    timestamp: new Date().toISOString()
  });
});

// ===== RUTAS PROTEGIDAS (CON AUTENTICACIÓN) =====

// ⭐ IMPORTAR RUTAS DEL CARRITO
const cartRoutes = require('./routes/cartRoutes');

// ⭐ APLICAR AUTENTICACIÓN SOLO A LAS RUTAS DEL CARRITO
// Esto mapea:
// GET /api/cart → GET / (en cartRoutes) → getCart
// POST /api/cart/items → POST /items (en cartRoutes) → addItem  
// PUT /api/cart/items/:id → PUT /items/:id (en cartRoutes) → updateItemQuantity
// DELETE /api/cart/items/:id → DELETE /items/:id (en cartRoutes) → removeItem
// DELETE /api/cart → DELETE / (en cartRoutes) → clearCart
app.use('/api/cart', authMiddleware, cartRoutes);

// ===== MANEJADOR DE RUTAS NO ENCONTRADAS =====
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.originalUrl}`,
    availableEndpoints: [
      'GET / - Welcome message',
      'GET /health - Health check',
      'GET /api/cart/test - Test endpoint',
      'GET /api/cart - Get user cart (auth required)',
      'POST /api/cart/items - Add item to cart (auth required)',
      'PUT /api/cart/items/:productId - Update item quantity (auth required)',
      'DELETE /api/cart/items/:productId - Remove item (auth required)',
      'DELETE /api/cart - Clear cart (auth required)'
    ]
  });
});

// ===== MIDDLEWARE DE MANEJO DE ERRORES =====
app.use((err, req, res, next) => {
  console.error(`[CART-API ERROR] ${err.message}`);
  console.error(`[CART-API ERROR] Stack:`, err.stack);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ===== CONFIGURACIÓN DEL SERVIDOR =====
const PORT = process.env.PORT || 8000; // ⭐ Cambiar a 8000 para consistencia

// Iniciar servidor
const server = app.listen(PORT, () => {
  console.log(`🛒 Cart API iniciado en modo ${process.env.NODE_ENV} en el puerto ${PORT}`);
  console.log(`🛒 Endpoints disponibles:`);
  console.log(`   - GET http://localhost:${PORT}/health`);
  console.log(`   - GET http://localhost:${PORT}/api/cart (requiere auth)`);
  console.log(`   - POST http://localhost:${PORT}/api/cart/items (requiere auth)`);
});

// Manejar errores no capturados
process.on('unhandledRejection', (err) => {
  console.error(`[CART-API] Error no controlado: ${err.message}`);
  // Cerrar servidor y salir
  server.close(() => process.exit(1));
});

module.exports = app;