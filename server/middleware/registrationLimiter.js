const rateLimit = require('express-rate-limit');

const registrationLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // Limitar a 5 solicitudes por IP
    message: 'Demasiados intentos de registro desde esta IP, por favor inténtalo de nuevo más tarde.',
});

module.exports = registrationLimiter;
