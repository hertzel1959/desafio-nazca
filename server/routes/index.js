const express = require('express');
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

module.exports = router;