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
router.get('/stats', getInscripcionesStats);
router.get('/grupos', getGruposDisponibles);
router.get('/equipo/:equipoId', getEquipoById);
router.get('/', getAllInscripciones);
router.get('/:id', getInscripcionById);
router.post('/equipo', createEquipo);
router.post('/', createInscripcion);
// @route   GET /api/inscripciones/stats
// @desc    Obtener estadísticas completas de inscripciones
// @access  Public
// @route   GET /api/inscripciones/grupos
// @desc    Obtener grupos disponibles desde tabla de frecuencias
// @access  Public
// @route   GET /api/inscripciones/equipo/:equipoId
// @desc    Obtener todos los miembros de un equipo específico
// @access  Public
// @route   GET /api/inscripciones
// @desc    Obtener todas las inscripciones (con filtros y paginación)
// @access  Public
// @route   GET /api/inscripciones/:id
// @desc    Obtener inscripción por NRO
// @access  Public
// @route   POST /api/inscripciones/equipo
// @desc    Crear equipo completo con múltiples miembros
// @access  Public
// @route   POST /api/inscripciones
// @desc    Crear nueva inscripción individual (ADMIN)
// @access  Public


// ===============================
// ENDPOINT 1: Enviar código de verificación
// ===============================
router.post('/enviar-codigo', async (req, res) => {
    try {
        const { email, datosInscripcion } = req.body;

        // Generar código de 6 dígitos
        const codigo = Math.floor(100000 + Math.random() * 900000).toString();

        // Guardar para luego verificar
        global.codigosVerificacion.set(email.toLowerCase().trim(), {
            codigo,
            timestamp: Date.now(),
            datosInscripcion,
            intentos: 0,
            expiresAt: Date.now() + (10 * 60 * 1000)
        });

        // Enviar mail con el código
        try {
            await emailService.enviarCodigoVerificacion(email, codigo, datosInscripcion);
            console.log('✅ Email enviado exitosamente');
        } catch (emailError) {
            console.error('⚠️ Error enviando email:', emailError);
            // No fallar el proceso, solo mostrar en debug
        }
        
        // Debug log
        console.log('🔢 CÓDIGO GENERADO (DEBUG):', codigo);
        
        // Devolver respuesta (siempre con código en debug)
        res.json({
            success: true,
            message: 'Código enviado exitosamente',
            debug: { codigo } // Siempre mostrar código mientras arreglamos email
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
        console.log('🔍 Código recibido:', codigo);

        // Validar parámetros
        if (!email || !codigo) {
            return res.status(400).json({
                success: false,
                message: 'Email y código son requeridos'
            });
        }

        // Buscar código almacenado
        const datosVerificacion = global.codigosVerificacion.get(email.toLowerCase().trim());
        
        if (!datosVerificacion) {
            return res.status(400).json({
                success: false,
                message: 'No se encontró código para este email o ya expiró'
            });
        }
        
        // Verificar expiración (10 minutos)
        if (Date.now() > datosVerificacion.expiresAt) {
            global.codigosVerificacion.delete(email.toLowerCase().trim());
            return res.status(400).json({
                success: false,
                message: 'Código expirado. Solicita uno nuevo.'
            });
        }
        
        // Verificar intentos máximos (3 intentos)
        if (datosVerificacion.intentos >= 3) {
            global.codigosVerificacion.delete(email.toLowerCase().trim());
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
        
        try {
            const Inscripcion = require('../models/Inscripcion');
            
            // Validar DNI único antes de crear
            const existeDNI = await Inscripcion.findOne({ 
                dni: datosInscripcion.dni, 
                activo: true 
            });
            if (existeDNI) {
                global.codigosVerificacion.delete(email.toLowerCase().trim());
                return res.status(400).json({
                    success: false,
                    message: `El DNI ${datosInscripcion.dni} ya está registrado en el sistema`
                });
            }

            // Validar email único antes de crear
            const existeEmail = await Inscripcion.findOne({ 
                email: datosInscripcion.email, 
                activo: true 
            });
            if (existeEmail) {
                global.codigosVerificacion.delete(email.toLowerCase().trim());
                return res.status(400).json({
                    success: false,
                    message: `El email ${datosInscripcion.email} ya está registrado en el sistema`
                });
            }
            
            // Crear nueva inscripción
            const nuevaInscripcion = new Inscripcion(datosInscripcion);
            const inscripcionGuardada = await nuevaInscripcion.save();
            
            console.log('✅ Inscripción guardada en DB:', inscripcionGuardada.NRO);
            
            // Enviar email de confirmación
            try {
                await emailService.enviarConfirmacionInscripcion(email, inscripcionGuardada);
                console.log('✅ Email de confirmación enviado');
            } catch (emailError) {
                console.error('⚠️ Error enviando confirmación:', emailError);
            }

            // Limpiar código usado
            global.codigosVerificacion.delete(email.toLowerCase().trim());
            
            res.json({
                success: true,
                message: 'Código verificado e inscripción guardada exitosamente',
                data: inscripcionGuardada.toPublicJSON ? inscripcionGuardada.toPublicJSON() : inscripcionGuardada
            });
            
        } catch (dbError) {
            console.error('❌ Error guardando en base de datos:', dbError);
            
            // Manejo de errores de duplicados
            if (dbError.code === 11000) {
                global.codigosVerificacion.delete(email.toLowerCase().trim());
                
                if (dbError.keyPattern?.dni) {
                    return res.status(400).json({
                        success: false,
                        message: `El DNI ${dbError.keyValue.dni} ya está registrado en el sistema`
                    });
                }
                if (dbError.keyPattern?.email) {
                    return res.status(400).json({
                        success: false,
                        message: `El email ${dbError.keyValue.email} ya está registrado en el sistema`
                    });
                }
            }
            
            // Manejo de errores de validación
            if (dbError.name === 'ValidationError') {
                const errores = Object.values(dbError.errors).map(err => err.message);
                return res.status(400).json({
                    success: false,
                    message: 'Error de validación',
                    errors: errores
                });
            }
            
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

// @route   PUT /api/inscripciones/:id
// @desc    Actualizar inscripción completa
// @access  Public
router.put('/:id', updateInscripcion);

// @route   DELETE /api/inscripciones/:id
// @desc    Eliminar inscripción (soft delete por defecto, hard delete con ?hard=true)
// @access  Public
router.delete('/:id', deleteInscripcion);

// ===============================
// ENDPOINT: Test de email
// ===============================
router.get('/test-email', async (req, res) => {
    const email = req.query.email || 'test@ejemplo.com';
    const codigo = '123456';

    const datosInscripcion = {
        nombres: 'Test',
        apellidos: 'Usuario',
        tripulante: 'piloto',
        grupo: 'Test Group',
        tipoVehiculo: 'moto',
        marca: 'Test',
        modelo: 'Test',
        diaLlegada: 'viernes'
    };

    try {
        await emailService.enviarCodigoVerificacion(email, codigo, datosInscripcion);
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
            error: error.message
        });
    }
});

// ===============================
// FUNCIÓN AUXILIAR: Limpiar códigos expirados
// ===============================
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

module.exports = router;