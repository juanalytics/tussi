const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const helmet = require('helmet');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 9000;

// Middleware de seguridad
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Rate limiting más específico por tipo de operación
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  message: { error: 'Demasiadas peticiones. Intenta de nuevo en 15 minutos.' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Solo 5 intentos de login por IP cada 15 minutos
  message: { error: 'Demasiados intentos de autenticación. Intenta de nuevo en 15 minutos.' }
});

// Configuración de microservicios (URLs internas del contenedor)
const SERVICES = {
  AUTH_SERVICE: process.env.AUTH_SERVICE_URL || 'http://auth-service:8000',
  PRODUCTS_SERVICE: process.env.PRODUCTS_SERVICE_URL || 'http://products-api:8000',
  CART_SERVICE: process.env.CART_SERVICE_URL || 'http://cart-api:8000'
};

// JWT Secret (debe ser el mismo que usan los servicios)
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// Middleware de autenticación
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      error: 'Token de acceso requerido',
      code: 'MISSING_TOKEN' 
    });
  }

  try {
    // Verificar token localmente
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Validar token con el servicio de auth (opcional, para mayor seguridad)
    try {
      const authResponse = await axios.get(`${SERVICES.AUTH_SERVICE}/verify`, {
        headers: { 'Authorization': `Bearer ${token}` },
        timeout: 5000
      });
      
      req.user = {
        ...decoded,
        ...authResponse.data.user
      };
    } catch (authError) {
      // Si el servicio de auth no responde, usar solo la verificación local
      console.warn('Auth service verification failed, using local JWT verification');
      req.user = decoded;
    }
    
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
  const userInfo = req.user ? `User: ${req.user.id}` : 'Anonymous';
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl} - ${req.ip} - ${userInfo}`);
  next();
};

app.use(requestLogger);

// Health check del Gateway
app.get('/health', async (req, res) => {
  const serviceChecks = {};
  
  // Verificar estado de cada microservicio
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
  
  res.status(allServicesUp ? 200 : 503).json({
    gateway: 'UP',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: serviceChecks
  });
});

// ===== SERVICIO DE AUTENTICACIÓN =====
// Aplicar rate limiting especial para rutas de autenticación
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

app.use('/api/auth', generalLimiter, createProxyMiddleware({
  target: SERVICES.AUTH_SERVICE,
  changeOrigin: true,
  pathRewrite: {
    '^/api/auth': '/' // Remueve /api/auth del path
  },
  onProxyReq: (proxyReq, req, res) => {
    // Agregar headers de contexto
    proxyReq.setHeader('x-gateway-request-id', req.headers['x-request-id'] || 'unknown');
    proxyReq.setHeader('x-client-ip', req.ip);
    proxyReq.setHeader('x-forwarded-for', req.get('X-Forwarded-For') || req.ip);
  },
  onProxyRes: (proxyRes, req, res) => {
    // Agregar headers de respuesta
    proxyRes.headers['x-service'] = 'auth-service';
  },
  onError: (err, req, res) => {
    console.error('Error en Auth Service:', err.message);
    res.status(503).json({ 
      error: 'Servicio de autenticación temporalmente no disponible',
      code: 'AUTH_SERVICE_DOWN',
      timestamp: new Date().toISOString()
    });
  }
}));

// ===== SERVICIO DE PRODUCTOS =====
// GET productos es público, POST/PUT/DELETE requieren autenticación
app.use('/api/products', generalLimiter, (req, res, next) => {
  // Rutas públicas para productos
  const publicMethods = ['GET'];
  const publicPaths = ['/api/products', '/api/products/search', '/api/products/categories'];
  
  const isPublicPath = publicPaths.some(path => req.path.startsWith(path.replace('/api/products', '')));
  
  if (publicMethods.includes(req.method) && isPublicPath) {
    return next();
  }
  
  // Otras operaciones requieren autenticación
  return authenticateToken(req, res, next);
}, createProxyMiddleware({
  target: SERVICES.PRODUCTS_SERVICE,
  changeOrigin: true,
  pathRewrite: {
    '^/api/products': '/'
  },
  onProxyReq: (proxyReq, req, res) => {
    // Agregar información del usuario si está autenticado
    if (req.user) {
      proxyReq.setHeader('x-user-id', req.user.id);
      proxyReq.setHeader('x-user-email', req.user.email);
      proxyReq.setHeader('x-user-role', req.user.role || 'user');
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
}));

// ===== SERVICIO DE CARRITO =====
// Todas las operaciones del carrito requieren autenticación
app.use('/api/cart', generalLimiter, authenticateToken, createProxyMiddleware({
  target: SERVICES.CART_SERVICE,
  changeOrigin: true,
  pathRewrite: {
    '^/api/cart': '/'
  },
  onProxyReq: (proxyReq, req, res) => {
    // El carrito siempre necesita saber qué usuario está haciendo la petición
    proxyReq.setHeader('x-user-id', req.user.id);
    proxyReq.setHeader('x-user-email', req.user.email);
    proxyReq.setHeader('x-client-ip', req.ip);
    
    // Para operaciones del carrito, también podemos pasar el token completo
    const authHeader = req.headers['authorization'];
    if (authHeader) {
      proxyReq.setHeader('authorization', authHeader);
    }
  },
  onProxyRes: (proxyRes, req, res) => {
    proxyRes.headers['x-service'] = 'cart-service';
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

// ===== ENDPOINTS ESPECIALES DEL GATEWAY =====

// Endpoint para obtener información del usuario actual
app.get('/api/me', authenticateToken, (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role,
      // No incluir información sensible
    },
    timestamp: new Date().toISOString()
  });
});

// Endpoint para logout (invalidar token del lado del cliente)
app.post('/api/logout', authenticateToken, (req, res) => {
  // En una implementación más avanzada, podrías mantener una blacklist de tokens
  res.json({
    message: 'Logout exitoso',
    timestamp: new Date().toISOString()
  });
});

// Endpoint agregado: buscar productos y verificar disponibilidad en carrito
app.get('/api/search', authenticateToken, async (req, res) => {
  try {
    const { query } = req.query;
    
    // Buscar productos
    const productsResponse = await axios.get(`${SERVICES.PRODUCTS_SERVICE}/search`, {
      params: { query },
      timeout: 5000
    });
    
    // Obtener carrito del usuario
    const cartResponse = await axios.get(`${SERVICES.CART_SERVICE}/`, {
      headers: { 
        'x-user-id': req.user.id,
        'authorization': req.headers['authorization']
      },
      timeout: 5000
    });
    
    // Combinar información
    const products = productsResponse.data;
    const cartItems = cartResponse.data.items || [];
    
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

// Middleware para rutas no encontradas
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
      'GET /api/auth/verify',
      'GET /api/products',
      'POST /api/products (auth required)',
      'GET /api/cart (auth required)',
      'POST /api/cart (auth required)',
      'GET /api/me (auth required)',
      'POST /api/logout (auth required)',
      'GET /api/search (auth required)'
    ]
  });
});

// Middleware de manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error global en API Gateway:', err);
  res.status(500).json({
    error: 'Error interno del servidor',
    code: 'INTERNAL_ERROR',
    timestamp: new Date().toISOString(),
    requestId: req.headers['x-request-id']
  });
});

// Circuit Breaker simple para monitorear servicios
class ServiceMonitor {
  constructor() {
    this.services = {};
    this.checkInterval = 30000; // 30 segundos
    this.startMonitoring();
  }

  startMonitoring() {
    setInterval(async () => {
      for (const [serviceName, serviceUrl] of Object.entries(SERVICES)) {
        try {
          const start = Date.now();
          await axios.get(`${serviceUrl}/health`, { timeout: 5000 });
          const responseTime = Date.now() - start;
          
          this.services[serviceName] = {
            status: 'UP',
            lastCheck: new Date().toISOString(),
            responseTime: `${responseTime}ms`
          };
        } catch (error) {
          this.services[serviceName] = {
            status: 'DOWN',
            lastCheck: new Date().toISOString(),
            error: error.message
          };
          console.warn(`⚠️  Servicio ${serviceName} no responde: ${error.message}`);
        }
      }
    }, this.checkInterval);
  }

  getStatus() {
    return this.services;
  }
}

const serviceMonitor = new ServiceMonitor();

// Endpoint para monitoreo detallado
app.get('/api/status', (req, res) => {
  res.json({
    gateway: {
      status: 'UP',
      version: '1.0.0',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString()
    },
    services: serviceMonitor.getStatus()
  });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log('🚀 =================================');
  console.log(`🚀 API Gateway iniciado en puerto ${PORT}`);
  console.log('🚀 =================================');
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔍 Status: http://localhost:${PORT}/api/status`);
  console.log('\n📋 Endpoints disponibles:');
  console.log('  🔐 Autenticación:');
  console.log('    POST /api/auth/login');
  console.log('    POST /api/auth/register');
  console.log('    GET  /api/auth/verify');
  console.log('  📦 Productos:');
  console.log('    GET  /api/products (público)');
  console.log('    POST /api/products (requiere auth)');
  console.log('  🛒 Carrito:');
  console.log('    GET  /api/cart (requiere auth)');
  console.log('    POST /api/cart (requiere auth)');
  console.log('  👤 Usuario:');
  console.log('    GET  /api/me (requiere auth)');
  console.log('    POST /api/logout (requiere auth)');
  console.log('  🔍 Búsqueda:');
  console.log('    GET  /api/search (requiere auth)');
  console.log('\n🔗 Servicios backend:');
  console.log(`  Auth: ${SERVICES.AUTH_SERVICE}`);
  console.log(`  Products: ${SERVICES.PRODUCTS_SERVICE}`);
  console.log(`  Cart: ${SERVICES.CART_SERVICE}`);
});

module.exports = app;