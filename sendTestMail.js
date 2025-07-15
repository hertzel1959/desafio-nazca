require('dotenv').config(); // para cargar tu .env
const emailService = require('./server/services/emailService'); // ajusta la ruta si está diferente

(async () => {
  try {
    // datos de prueba adaptados a tu plantilla
    const email = 'mmolina@icresil.com';
    const datosInscripcion = {
      nombres: 'Mabel',
      apellidos: 'Molina',
      tripulante: 'Piloto',
      grupo: 'ChelEROS',
      tipoVehiculo: 'Moto',
      marca: 'Suzuki',
      modelo: '1250',
      diaLlegada: 'Viernes',
      N_equipo: 999,
      frecuencia: 150.00,
      estado: 'CONFIRMADO'
    };

    await emailService.enviarCodigoVerificacion(email, '123456', datosInscripcion);
    console.log(`✅ Email de prueba enviado exitosamente a ${email}`);
    process.exit(0);

  } catch (error) {
    console.error('❌ Error enviando email:', error);
    process.exit(1);
  }
})();
