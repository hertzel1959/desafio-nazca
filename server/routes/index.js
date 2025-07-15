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
//const express = require('express');
//const router = express.Router();
const Frequency = require('../models/Frecuencia');
const Registration = require('../models/Inscripcion');

router.get('/debug/db', async (req, res) => {
  try {
    const freqCount = await Frequency.countDocuments();
    const regCount = await Registration.countDocuments();
    const frequencies = await Frequency.find({}, { _id: 0, id: 1, grupo: 1 }).limit(5);
    const registrations = await Registration.find({}, { _id: 0, nombre: 1, email: 1 }).limit(5);

    res.json({
      status: 'ok',
      frequencies: {
        count: freqCount,
        sample: frequencies
      },
      registrations: {
        count: regCount,
        sample: registrations
      }
    });
  } catch (err) {
    console.error('Error al hacer debug DB:', err);
    res.status(500).json({ error: 'Error al consultar la base de datos' });
  }
});

module.exports = router;
