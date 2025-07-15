const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Ruta de salud del servidor
router.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        service: 'Desafío Dunas de Nazca API'
    });
});

// Información básica del API
router.get('/', (req, res) => {
    res.json({
        message: 'Desafío Dunas de Nazca API',
        version: '1.0.0',
        endpoints: {
            registrations: '/api/registration',
            admin: '/api/admin'
        }
    });
});
//const jwt = require('jsonwebtoken');

// Debug endpoint para probar JWT
router.get('/debug/jwt', (req, res) => {
  try {
    const payload = { email: 'test@desafio.com' };
    const secret = process.env.JWT_SECRET;
    const expire = process.env.JWT_EXPIRE || '1h';

    // Generar el token
    const token = jwt.sign(payload, secret, { expiresIn: expire });

    // Verificar el token
    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        console.error('Error al verificar token:', err);
        return res.status(400).json({ ok: false, error: 'Token inválido', details: err });
      }
      return res.json({
        ok: true,
        message: 'Token generado y verificado correctamente',
        token,
        decoded
      });
    });

  } catch (error) {
    console.error('Error general en /debug/jwt:', error);
    res.status(500).json({ ok: false, error: 'Error interno' });
  }
});

module.exports = router;