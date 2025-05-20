const jwt = require('jsonwebtoken');
const axios = require('axios');

/**
 * Middleware para autenticar usuarios mediante JWT
 * Utiliza un servicio de autenticación externo
 */
exports.authenticate = async (req, res, next) => {
  // Obtener token del header
  const authHeader = req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Acceso denegado. No se proporcionó token de autenticación'
    });
  }

  try {
    // Extraer el token
    const token = authHeader.split(' ')[1];
    
    // URL del servicio de autenticación
    const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://auth-api:3010';
    
    // Verificar el token con el servicio de autenticación
    const response = await axios.post(
      `${authServiceUrl}/api/auth/verify-token`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    if (response.status !== 200 || !response.data.success) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido o expirado'
      });
    }
    
    // Si el token es válido, extraer la información del usuario
    req.user = response.data.user;
    
    next();
  } catch (error) {
    console.error('Error de autenticación:', error.message);
    
    // Error de conexión con el servicio de autenticación
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        message: 'Servicio de autenticación no disponible'
      });
    }
    
    // Respuesta de error del servicio de autenticación
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || 'Error de autenticación';
      
      return res.status(status).json({
        success: false,
        message
      });
    }
    
    // Error desconocido
    res.status(500).json({
      success: false,
      message: 'Error en la autenticación'
    });
  }
};