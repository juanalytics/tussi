const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const helmet = require('helmet');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 9000;


app.set('trust proxy', 1);
// Middleware de seguridad
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Demasiadas peticiones. Intenta de nuevo en 15 minutos.' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Demasiados intentos de autenticación. Intenta de nuevo en 15 minutos.' }
});

// Configuración de microservicios
const SERVICES = {
  AUTH_SERVICE: process.env.AUTH_SERVICE_URL || 'http://auth-service:8000',
  PRODUCTS_SERVICE: process.env.PRODUCTS_SERVICE_URL || 'http://products-api:8000',
  CART_SERVICE: process.env.CART_SERVICE_URL || 'http://cart-api:8000'
};

// JWT Secret (debe coincidir con tu auth service)
const JWT_SECRET = process.env.JWT_SECRET || 'CHANGE_ME';

// Middleware de autenticación
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      error: 'User not authenticated. Please log in to access this resource.',
      code: 'MISSING_TOKEN'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
    
    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < currentTime) {
      return res.status(403).json({
        error: 'Token inválido o expirado',
        code: 'INVALID_TOKEN'
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification error:', error.message);
    return res.status(403).json({
      error: 'Token inválido o expirado',
      code: 'INVALID_TOKEN'
    });
  }
};

// Middleware de logging
const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const userInfo = req.user ? `User: ${req.user.sub}` : 'Anonymous';
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl} - ${req.ip} - ${userInfo}`);
  next();
};

app.use(requestLogger);

// Health check
app.get('/health', async (req, res) => {
  const serviceChecks = {};
  
  for (const [serviceName, serviceUrl] of Object.entries(SERVICES)) {
    try {
      const response = await axios.get(`${serviceUrl}/health`, { timeout: 3000 });
      serviceChecks[serviceName] = {
        status: 'UP',
        responseTime: response.headers['x-response-time'] || 'N/A'
      };
    } catch (error) {
      serviceChecks[serviceName] = {
        status: 'DOWN',
        error: error.message
      };
    }
  }

  const allServicesUp = Object.values(serviceChecks).every(check => check.status === 'UP');

  // Always return 200 for gateway health - it's running if it can respond
  res.status(200).json({
    gateway: 'UP',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: serviceChecks,
    overall: allServicesUp ? 'HEALTHY' : 'DEGRADED'
  });
});

// Simple health check that doesn't depend on backend services
app.get('/health/simple', (req, res) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    service: 'api-gateway'
  });
});

// ===== SERVICIO DE AUTENTICACIÓN =====
//app.use('/api/auth/login', authLimiter);
//app.use('/api/auth/register', authLimiter);

// ===== SERVICIO DE AUTENTICACIÓN - CON DEBUGGING =====
// ===== SERVICIO DE AUTENTICACIÓN =====
app.use('/api/auth', 
  // Rate limiter condicional
  (req, res, next) => {
    if (req.path === '/login' || req.path === '/register') {
      return authLimiter(req, res, next);
    }
    return generalLimiter(req, res, next);
  },
  
  // Proxy manual
  async (req, res) => {
    const startTime = Date.now();
    
    try {
      const targetUrl = `${SERVICES.AUTH_SERVICE}/auth${req.path}`;
      console.log(`📤 [AUTH] ${req.method} ${req.originalUrl} → ${targetUrl}`);
      
      const config = {
        method: req.method,
        url: targetUrl,
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000,
        validateStatus: () => true
      };

      if (req.body && Object.keys(req.body).length > 0) {
        config.data = req.body;
      }

      if (req.query && Object.keys(req.query).length > 0) {
        config.params = req.query;
      }

      const response = await axios(config);
      const duration = Date.now() - startTime;
      
      console.log(`📥 [AUTH] ${response.status} (${duration}ms)`);
      
      res.status(response.status)
         .set('x-service', 'auth-service')
         .json(response.data);
         
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ [AUTH] Error (${duration}ms):`, error.message);
      
      if (error.response) {
        res.status(error.response.status).json(error.response.data);
      } else {
        res.status(503).json({
          error: 'Servicio de autenticación temporalmente no disponible',
          code: 'AUTH_SERVICE_DOWN',
          timestamp: new Date().toISOString()
        });
      }
    }
  }
);


// ===== SERVICIO DE PRODUCTOS =====
app.use('/api/products',
  // 1. Aplicar el limitador de tasa a TODOS los requests que lleguen a /api/products
  generalLimiter,

  // 2. Middleware condicional para la autenticación:
  // Solo los métodos que no sean GET requieren autenticación.
  (req, res, next) => {
    if (req.method === 'GET') {
      // Para requests GET, simplemente pasamos al siguiente middleware (el proxy)
      return next();
    }
    // Para otros métodos (POST, PUT, DELETE, etc.), aplicar authenticateToken
    return authenticateToken(req, res, next);
  },

  // 3. El middleware de proxy:
  // Este middleware ahora será alcanzado por TODOS los requests (GET y no-GET)
  // que pasaron las etapas anteriores, asegurando que pathRewrite siempre se aplique.
  createProxyMiddleware({
    target: SERVICES.PRODUCTS_SERVICE,
    changeOrigin: true,
    // Esta configuración reescribe '/api/products' a '/' en el servicio de destino.
    // Por ejemplo:
    //   - Request a gateway.com/api/products -> products-service.com/
    //   - Request a gateway.com/api/products/123 -> products-service.com/123
    pathRewrite: {
      '^/api/products': ''
    },
    onProxyReq: (proxyReq, req, res) => {
      // Si el usuario está autenticado (de authenticateToken), se añade el header
      if (req.user) {
        proxyReq.setHeader('x-user-id', req.user.sub);
      }
      proxyReq.setHeader('x-client-ip', req.ip);
    },
    onProxyRes: (proxyRes, req, res) => {
      proxyRes.headers['x-service'] = 'products-service';
    },
    onError: (err, req, res) => {
      console.error('Error en Products Service:', err.message);
      res.status(503).json({
        error: 'Servicio de productos temporalmente no disponible',
        code: 'PRODUCTS_SERVICE_DOWN',
        timestamp: new Date().toISOString()
      });
    }
  })
);
// ===== SERVICIO DE CARRITO ===== 
// Todas las rutas del carrito requieren autenticación
app.use('/api/cart', generalLimiter, authenticateToken, createProxyMiddleware({
  target: SERVICES.CART_SERVICE,
  changeOrigin: true,
  pathRewrite: {
    '^/api/cart': '/'
  },
  onProxyReq: (proxyReq, req, res) => {
    // Pasar el token de autorización completo
    const authHeader = req.headers['authorization'];
    if (authHeader) {
      proxyReq.setHeader('authorization', authHeader);
    }
    
    // Pasar información del usuario
    if (req.user) {
      proxyReq.setHeader('x-user-id', req.user.sub);
    }
    
    // Headers adicionales para el contexto
    proxyReq.setHeader('x-client-ip', req.ip);
    proxyReq.setHeader('x-gateway-request-id', req.headers['x-request-id'] || 'unknown');
  },
  onProxyRes: (proxyRes, req, res) => {
    // Solo agregar headers informativos, NO modificar el body
    proxyRes.headers['x-service'] = 'cart-service';
    proxyRes.headers['x-proxied-by'] = 'api-gateway';
  },
  onError: (err, req, res) => {
    console.error('Error en Cart Service:', err.message);
    res.status(503).json({
      error: 'Servicio de carrito temporalmente no disponible',
      code: 'CART_SERVICE_DOWN',
      timestamp: new Date().toISOString()
    });
  }
}));

// ===== ENDPOINTS PROPIOS DEL GATEWAY =====

// Información del usuario actual (endpoint propio del gateway)
app.get('/api/me', authenticateToken, (req, res) => {
  res.json({
    user: {
      id: req.user.sub,
      // Solo información básica del token JWT
    },
    timestamp: new Date().toISOString()
  });
});

// Logout (endpoint propio del gateway)
app.post('/api/logout', authenticateToken, (req, res) => {
  res.json({
    message: 'Logout exitoso',
    timestamp: new Date().toISOString()
  });
});

// Endpoint agregado para búsqueda con información del carrito
app.get('/api/search', authenticateToken, async (req, res) => {
  try {
    const { query } = req.query;
    
    // Búsqueda en productos
    const productsResponse = await axios.get(`${SERVICES.PRODUCTS_SERVICE}/search`, {
      params: { query },
      timeout: 5000
    });
    
    // Obtener carrito del usuario
    const cartResponse = await axios.get(`${SERVICES.CART_SERVICE}/`, {
      headers: {
        'x-user-id': req.user.sub,
        'authorization': req.headers['authorization']
      },
      timeout: 5000
    });
    
    // Combinar información (este sí es un endpoint propio del gateway)
    const products = productsResponse.data;
    const cartData = cartResponse.data;
    
    // La estructura del carrito depende de cómo lo devuelva tu cart service
    const cartItems = cartData.data?.items || cartData.items || cartData || [];
    
    const enrichedProducts = products.map(product => ({
      ...product,
      inCart: cartItems.some(item => item.productId === product.id),
      cartQuantity: cartItems.find(item => item.productId === product.id)?.quantity || 0
    }));
    
    res.json({
      products: enrichedProducts,
      totalFound: enrichedProducts.length
    });
    
  } catch (error) {
    console.error('Error en búsqueda agregada:', error.message);
    res.status(500).json({
      error: 'Error interno en la búsqueda',
      code: 'SEARCH_ERROR'
    });
  }
});

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint no encontrado',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
    availableEndpoints: [
      'GET /health',
      'POST /api/auth/login',
      'POST /api/auth/register',
      'GET /api/auth/me',
      'GET /api/products',
      'GET /api/cart (auth required)',
      'POST /api/cart/items (auth required)',
      'PUT /api/cart/items/:productId (auth required)',
      'DELETE /api/cart/items/:productId (auth required)',
      'DELETE /api/cart (auth required)',
      'GET /api/me (auth required)',
      'POST /api/logout (auth required)',
      'GET /api/search (auth required)'
    ]
  });
});

// Error handler global
app.use((err, req, res, next) => {
  console.error('Error global en API Gateway:', err);
  res.status(500).json({
    error: 'Error interno del servidor',
    code: 'INTERNAL_ERROR',
    timestamp: new Date().toISOString()
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log('🚀 =================================');
  console.log(`🚀 API Gateway iniciado en puerto ${PORT}`);
  console.log('🚀 =================================');
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log('\n📋 Endpoints (proxy transparente):');
  console.log('  🔐 Autenticación:');
  console.log('    POST /api/auth/login -> /auth/login');
  console.log('    POST /api/auth/register -> /auth/register');
  console.log('    GET  /api/auth/me -> /auth/me');
  console.log('  📦 Productos:');
  console.log('    GET  /api/products -> / (público)');
  console.log('    POST /api/products -> / (auth)');
  console.log('  🛒 Carrito (todos requieren auth):');
  console.log('    GET    /api/cart -> GET /');
  console.log('    POST   /api/cart/items -> POST /items');
  console.log('    PUT    /api/cart/items/:id -> PUT /items/:id');
  console.log('    DELETE /api/cart/items/:id -> DELETE /items/:id');
  console.log('    DELETE /api/cart -> DELETE /');
  console.log('  🔍 Gateway endpoints:');
  console.log('    GET  /api/me (info del token)');
  console.log('    POST /api/logout');
  console.log('    GET  /api/search (productos + carrito)');
  console.log('\n🔗 Servicios backend:');
  console.log(`  Auth: ${SERVICES.AUTH_SERVICE}`);
  console.log(`  Products: ${SERVICES.PRODUCTS_SERVICE}`);
  console.log(`  Cart: ${SERVICES.CART_SERVICE}`);
  console.log('\n💡 Las respuestas son manejadas por cada microservicio');
});

module.exports = app;