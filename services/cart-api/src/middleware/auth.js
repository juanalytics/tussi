const jwt = require('jsonwebtoken');
const axios = require('axios');

exports.authenticate = async (req, res, next) => {  
  console.log('=== MIDDLEWARE AUTH INICIADO ===');
  
  // Excluir rutas públicas
  if (req.originalUrl === '/health' || req.originalUrl === '/' || req.originalUrl === '/api/cart/test') {
    console.log('Ruta pública, omitiendo autenticación');
    return next();
  }

  const authHeader = req.header('Authorization');
  console.log('Token recibido:', authHeader);
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('Error: Falta token de autenticación');
    return res.status(401).json({
      success: false,
      message: 'Acceso denegado. No se proporcionó token de autenticación'
    });
  }

  try {
    const token = authHeader.split(' ')[1];
    console.log('Verificando token con servicio de autenticación...');
    
    const response = await axios.get(`${process.env.AUTH_SERVICE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (response.status !== 200 || !response.data) {
      console.log('Token inválido o expirado');
      return res.status(401).json({
        success: false,
        message: 'Token inválido o expirado'
      });
    }

    req.user = {
      id: response.data.id.toString(),
      email: response.data.email
    };
    
    console.log('Autenticación exitosa para usuario:', req.user.id);
    next();
  } catch (error) {
    console.error('Error de autenticación:', error);
    
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        message: 'Servicio de autenticación no disponible'
      });
    }
    
    if (error.response) {
      const message = error.response.data?.detail || 'Error de autenticación';
      return res.status(error.response.status).json({
        success: false,
        message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error en la autenticación'
    });
  }
};