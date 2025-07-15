const express = require('express');
const router = express.Router();
const emailService = require('../server/services/emailService');

router.get('/test-mail', async (req, res) => {
  try {
    const email = 'mmolina@icresil.com';
    const datosInscripcion = {
      nombres: 'Mabel',
      apellidos: 'Molina',
      tripulante: 'Piloto',
      grupo: 'ChelEROS',
      tipoVehiculo: 'Moto',
      marca: 'Suzuki',
      modelo: '125cc',
      telefono: '999888777',
    };

    await emailService.sendInscriptionEmail(email, datosInscripcion);
    res.json({ ok: true, message: 'Correo de prueba enviado exitosamente' });
  } catch (error) {
    console.error('Error enviando correo:', error);
    res.status(500).json({ error: 'No se pudo enviar el correo' });
  }
});

module.exports = router;
