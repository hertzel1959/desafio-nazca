const express = require('express');
const router = express.Router();
const {
  getAllInscripciones,
  getInscripcionById,
  getEquipoById,
  createInscripcion,
  createEquipo,
  updateInscripcion,
  deleteInscripcion,
  getInscripcionesStats,
  getGruposDisponibles
} = require('../controllers/inscripcionController');
const emailService = require('../services/emailService');

// Mapa temporal para códigos de verificación
global.codigosVerificacion = global.codigosVerificacion || new Map();

// Middleware para logging de rutas
router.use((req, res, next) => {
  console.log(`🛣️ ${req.method} ${req.originalUrl} - ${new Date().toISOString()}`);
  next();
});

// @route   GET /api/inscripciones/stats
// @desc    Obtener estadísticas completas de inscripciones
// @access  Public
// @return  { total, totalEquipos, porTripulante, porEstado, porTipoVehiculo, etc. }
router.get('/stats', getInscripcionesStats);

// @route   GET /api/inscripciones/grupos
// @desc    Obtener grupos disponibles desde tabla de frecuencias
// @access  Public
// @return  [{ nombre, frecuencia, lider }]
router.get('/grupos', getGruposDisponibles);

// @route   GET /api/inscripciones/equipo/:equipoId
// @desc    Obtener todos los miembros de un equipo específico
// @access  Public
// @param   equipoId - Número de equipo
// @return  { N_equipo, miembros[], totalMiembros, grupo, frecuencia, liderGrupo }
router.get('/equipo/:equipoId', getEquipoById);

// @route   GET /api/inscripciones
// @desc    Obtener todas las inscripciones (con filtros y paginación)
// @access  Public
// @query   ?page=1&limit=50&tripulante=piloto&estado=CONFIRMADO&grupo=Fugitivos&tipoVehiculo=moto&diaLlegada=viernes&experiencia=Experto&search=juan&N_equipo=5
router.get('/', getAllInscripciones);

// @route   GET /api/inscripciones/:id
// @desc    Obtener inscripción por NRO
// @access  Public
router.get('/:id', getInscripcionById);

// @route   POST /api/inscripciones/equipo
// @desc    Crear equipo completo con múltiples miembros
// @access  Public
// @body    { miembros: [{ tripulante, nombres, apellidos, ... }, { ... }] }
router.post('/equipo', createEquipo);

// @route   POST /api/inscripciones
// @desc    Crear nueva inscripción individual
// @access  Public
// @body    { 
//            N_equipo?, tripulante, grupo, nombres, apellidos, edad, experiencia,
//            grupoSanguineo, dni, email, celular, personaContacto, celularContacto,
//            tipoVehiculo, marca, modelo, año, diaLlegada, observaciones?
//          }
router.post('/', createInscripcion);

// @route   PUT /api/inscripciones/:id
// @desc    Actualizar inscripción completa
// @access  Public
// @body    { 
//            tripulante?, grupo?, nombres?, apellidos?, edad?, experiencia?,
//            grupoSanguineo?, dni?, email?, celular?, personaContacto?, celularContacto?,
//            tipoVehiculo?, marca?, modelo?, año?, diaLlegada?, estado?, observaciones?, activo?
//          }
router.post('/enviar-codigo', async (req, res) => {
    try {
        const { email, datosInscripcion } = req.body;

        // 🔥 Generar SOLO AQUÍ el código
        const codigo = Math.floor(100000 + Math.random() * 900000).toString(); // ✅ DESCOMENTA ESTA LÍNEA

        // Guardar para luego verificar
        global.codigosVerificacion.set(email, {
            codigo,
            timestamp: Date.now(),
            datosInscripcion,
            intentos: 0,
            expiresAt: Date.now() + (10 * 60 * 1000)
        });
        // Enviar mail con el MISMO código
        await emailService.enviarCodigoVerificacion(email, codigo, datosInscripcion);
        // Devolver el MISMO código en la respuesta
        res.json({
            success: true,
            message: 'Código enviado exitosamente',
            //debug: process.env.NODE_ENV === 'development' ? { codigo } : undefined 
            debug: process.env.NODE_ENV === 'production' ? { codigo } : undefined
        });

    } catch (error) {
        console.error('❌ Error enviando código:', error);
        res.status(500).json({
            success: false,
            message: 'Error enviando código de verificación',
            error: error.message
        });
    }
});

// ===============================
// ENDPOINT 2: Verificar código y guardar inscripción
// ===============================
router.post('/verificar-codigo', async (req, res) => {
    try {
        const { email, codigo } = req.body;
        
        console.log('🔍 Verificando código para:', email);
        
        // Validar parámetros
        if (!email || !codigo) {
            return res.status(400).json({
                success: false,
                message: 'Email y código son requeridos'
            });
        }
        
        // Buscar código almacenado
        const datosVerificacion = global.codigosVerificacion.get(email);
        
        if (!datosVerificacion) {
            return res.status(400).json({
                success: false,
                message: 'No se encontró código para este email o ya expiró'
            });
        }
        
        // Verificar expiración (10 minutos)
        if (Date.now() > datosVerificacion.expiresAt) {
            global.codigosVerificacion.delete(email);
            return res.status(400).json({
                success: false,
                message: 'Código expirado. Solicita uno nuevo.'
            });
        }
        
        // Verificar intentos máximos (3 intentos)
        if (datosVerificacion.intentos >= 3) {
            global.codigosVerificacion.delete(email);
            return res.status(400).json({
                success: false,
                message: 'Demasiados intentos fallidos. Solicita un código nuevo.'
            });
        }
        
        // Verificar código
        if (codigo.trim() !== datosVerificacion.codigo) {
            datosVerificacion.intentos++;
            return res.status(400).json({
                success: false,
                message: `Código incorrecto. Intentos restantes: ${3 - datosVerificacion.intentos}`
            });
        }
        
        console.log('✅ Código verificado correctamente');
        
        // Código correcto - proceder a guardar inscripción
        const datosInscripcion = datosVerificacion.datosInscripcion;
        
        // ⚠️ IMPORTANTE: Aquí necesitas usar tu lógica existente para guardar
        // Ajusta esto según tu modelo de datos actual
        
        try {
            // Ejemplo usando tu modelo existente (ajustar según tu implementación):
            const Inscripcion = require('../models/Inscripcion'); // Ajustar ruta si es diferente
            
            // Crear nueva inscripción
            const nuevaInscripcion = new Inscripcion(datosInscripcion);
            const inscripcionGuardada = await nuevaInscripcion.save();
            
            console.log('✅ Inscripción guardada en DB:', inscripcionGuardada.N_equipo || inscripcionGuardada._id);
            
            // Enviar email de confirmación (no bloquear el proceso si falla)
            try {
                await emailService.enviarConfirmacionInscripcion(email, inscripcionGuardada);
                console.log('✅ Email de confirmación enviado');
            } catch (emailError) {
                console.error('⚠️ Error enviando confirmación (inscripción ya guardada):', emailError);
            }

            
            // Limpiar código usado
            global.codigosVerificacion.delete(email);
            
            res.json({
                success: true,
                message: 'Código verificado e inscripción guardada exitosamente',
                data: inscripcionGuardada
            });
            
        } catch (dbError) {
            console.error('❌ Error guardando en base de datos:', dbError);
            res.status(500).json({
                success: false,
                message: 'Error guardando inscripción en base de datos',
                error: dbError.message
            });
        }
        
    } catch (error) {
        console.error('❌ Error verificando código:', error);
        res.status(500).json({
            success: false,
            message: 'Error verificando código',
            error: error.message
        });
    }
});
router.put('/:id', updateInscripcion);

// @route   DELETE /api/inscripciones/:id
// @desc    Eliminar inscripción (soft delete por defecto, hard delete con ?hard=true)
// @access  Public
// @query   ?hard=true (opcional, para eliminación física)
router.delete('/:id', deleteInscripcion);

// ===============================
// AL FINAL DEL ARCHIVO (antes de module.exports):
// ===============================

// Función auxiliar: Limpiar códigos expirados
function limpiarCodigosExpirados() {
    const ahora = Date.now();
    for (const [email, datos] of global.codigosVerificacion.entries()) {
        if (ahora > datos.expiresAt) {
            global.codigosVerificacion.delete(email);
            console.log('🧹 Código expirado limpiado para:', email);
        }
    }
}

// Limpiar códigos expirados cada 5 minutos
setInterval(limpiarCodigosExpirados, 5 * 60 * 1000);
// ===============================
// TEST DE ENVÍO DE EMAIL DETALLADO
// ===============================
router.get('/test-email', async (req, res) => {
    const email = req.query.email || 'tucorreo@ejemplo.com';

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

    try {
        await emailService.enviarCodigoVerificacion(email, codigo, datosInscripcion);
        console.log(`✅ Email de prueba enviado a ${email}`);
        res.json({
            success: true,
            message: `Email de prueba enviado a ${email}`,
            datosInscripcion
        });
    } catch (error) {
        console.error('❌ Error enviando email de prueba:', error);
        res.status(500).json({
            success: false,
            message: 'Error enviando email de prueba',
            error: error.message,
            datosInscripcion
        });
    }
});

module.exports = router;