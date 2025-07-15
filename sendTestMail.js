const express = require('express');
const router = express.Router();
const emailService = require('./server/services/emailService');

router.get('/test-mail', async (req, res) => {
    try {
        console.log('🚀 INICIANDO ENVÍO DE CÓDIGO DE PRUEBA');
        
        const email = 'mmolina@icresil.com';
        const datosInscripcion = {
            modelo: '125cc',
            marca: 'Suzuki',
            dial_llegada: 'Viernes',
            N_equipo: 999,
            frecuencia: 150.00,
            estado: 'CONFIRMADO'
        };

        await emailService.enviarCodigoVerificacion(email, '123456', datosInscripcion);
        
        console.log('✅ Email de prueba enviado exitosamente a', email);
        
        res.status(200).json({
            success: true,
            message: `Email de prueba enviado exitosamente a ${email}`,
            codigo: '123456'
        });
        
    } catch (error) {
        console.error('❌ Error enviando email:', error);
        
        res.status(500).json({
            success: false,
            message: 'Error enviando email de prueba',
            error: error.message
        });
    }
});

module.exports = router;