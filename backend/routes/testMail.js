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
      modelo: '125G',
    };

    await emailService.sendInscripcionEmail(email, datosInscripcion);
    res.json({ message: 'Correo de prueba enviado con éxito!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error enviando el correo' });
  }
});

module.exports = router;
