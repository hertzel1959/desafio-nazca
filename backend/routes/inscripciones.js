
const express = require('express');
const router = express.Router();
const emailService = require('../services/emailService');

router.post('/send-email', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email requerido' });

    try {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        await emailService.enviarCodigoVerificacion(email, code);
        console.log(`✅ Código ${code} enviado a ${email}`);
        res.json({ success: true, code });
    } catch (err) {
        console.error('Error enviando correo:', err);
        res.status(500).json({ success: false, message: 'Error enviando correo' });
    }
});

router.post('/', async (req, res) => {
    try {
        const inscripcion = new (require('../models/Participant'))(req.body);
        await inscripcion.save();
        res.status(201).json({ success: true, data: inscripcion });
    } catch (err) {
        console.error('Error guardando inscripción:', err);
        res.status(500).json({ success: false, message: 'Error interno' });
    }
});

module.exports = router;
