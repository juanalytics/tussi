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

// Middleware
app.use(helmet()); // Seguridad HTTP
app.use(cors()); // Habilitar CORS
app.use(express.json()); // Parsear JSON
app.use(morgan('dev')); // Logging de peticiones


app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});




app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to Cart API'
  });
});

app.get('/api/cart/test', (req, res) => {
  res.status(200).json({ message: 'Ruta de prueba accesible' });
});

// Endpoint de salud (health check)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    service: 'cart-api',
    timestamp: new Date().toISOString()
  });
});


const cartRoutes = require('./routes/cartRoutes');

// Configurar rutas
app.use('/api/cart', cartRoutes);



app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.originalUrl}`,
    availableEndpoints: [
      'GET /',
      'GET /health',
      'GET /api/cart',
      'POST /api/cart/items',
      'PUT /api/cart/items/:productId',
      'DELETE /api/cart/items/:productId',
      'DELETE /api/cart'
    ]
  });
});

// Middleware para manejo de errores
app.use((err, req, res, next) => {
  console.error(`Error: ${err.message}`);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Error interno del servidor'
  });
});

// Configurar el puerto
const PORT = process.env.PORT || 8002;

// Iniciar servidor
const server = app.listen(PORT, () => {
  console.log(`Servidor iniciado en modo ${process.env.NODE_ENV} en el puerto ${PORT}`);
});

// Manejar errores no capturados
process.on('unhandledRejection', (err) => {
  console.error(`Error no controlado: ${err.message}`);
  // Cerrar servidor y salir
  server.close(() => process.exit(1));
});