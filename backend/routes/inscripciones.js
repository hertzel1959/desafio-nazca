// routes/inscripciones.js

const express = require('express');
const router = express.Router();
const Inscripcion = require('../models/Inscripcion');
const FrecuenciaGrupo = require('../models/FrecuenciaGrupo');
const emailService = require('../../server/services/emailService');
global.codigosVerificacion = global.codigosVerificacion || new Map();

// GET /api/inscripciones - Obtener todas las inscripciones
router.get('/', async (req, res) => {
    try {
        const inscripciones = await Inscripcion.find({ activo: true })
            .sort({ createdAt: -1 });
        
        res.json(inscripciones);
    } catch (error) {
        console.error('Error obteniendo inscripciones:', error);
        res.status(500).json({ 
            message: 'Error obteniendo inscripciones', 
            error: error.message 
        });
    }
});

// GET /api/inscripciones/:id - Obtener una inscripción específica
router.get('/:id', async (req, res) => {
    try {
        const inscripcion = await Inscripcion.findById(req.params.id);
        
        if (!inscripcion) {
            return res.status(404).json({ message: 'Inscripción no encontrada' });
        }
        
        res.json(inscripcion);
    } catch (error) {
        console.error('Error obteniendo inscripción:', error);
        res.status(500).json({ 
            message: 'Error obteniendo inscripción', 
            error: error.message 
        });
    }
});

// ===============================
// 🎯 POST /api/inscripciones - ADMIN: Grabado DIRECTO sin verificación
// ===============================
router.post('/', async (req, res) => {
    try {
        console.log('📝 ADMIN: Creando inscripción directa sin verificación');
        
        const {
            tripulante, nombres, apellidos, edad, experiencia, grupoSanguineo,
            dni, email, celular, personaContacto, celularContacto,
            grupo, contacto, frecuencia,
            tipoVehiculo, marca, modelo, año, diaLlegada
        } = req.body;

        // Validaciones básicas
        if (!tripulante || !nombres || !apellidos || !edad || !experiencia || 
            !grupoSanguineo || !dni || !email || !celular || !personaContacto || 
            !celularContacto || !grupo || !contacto || !frecuencia || 
            !tipoVehiculo || !marca || !modelo || !año || !diaLlegada) {
            return res.status(400).json({ 
                message: 'Todos los campos obligatorios deben ser completados' 
            });
        }

        // Validar DNI único
        const existeDNI = await Inscripcion.findOne({ dni, activo: true });
        if (existeDNI) {
            return res.status(400).json({ 
                message: 'Ya existe una inscripción con este DNI' 
            });
        }

        // Validar email único
        const existeEmail = await Inscripcion.findOne({ email, activo: true });
        if (existeEmail) {
            return res.status(400).json({ 
                message: 'Ya existe una inscripción con este email' 
            });
        }

        // Generar número de grupo automáticamente
        const totalInscripciones = await Inscripcion.countDocuments({ activo: true });
        const numeroGrupo = totalInscripciones + 1;

        // 🎯 CREAR INSCRIPCIÓN DIRECTAMENTE (ADMIN)
        const nuevaInscripcion = new Inscripcion({
            tripulante,
            nombres: nombres.trim(),
            apellidos: apellidos.trim(),
            edad: parseInt(edad),
            experiencia,
            grupoSanguineo: grupoSanguineo.trim().toUpperCase(),
            dni: dni.trim(),
            email: email.trim().toLowerCase(),
            celular: celular.trim(),
            personaContacto: personaContacto.trim(),
            celularContacto: celularContacto.trim(),
            grupo: grupo.trim(),
            contacto: contacto.trim(),
            numeroGrupo,
            frecuencia: parseFloat(frecuencia),
            tipoVehiculo,
            marca: marca.trim(),
            modelo: modelo.trim(),
            año: parseInt(año),
            diaLlegada,
            activo: true
        });

        const inscripcionGuardada = await nuevaInscripcion.save();
        
        console.log('✅ ADMIN: Inscripción creada directamente:', inscripcionGuardada.N_equipo || inscripcionGuardada.NRO);
        
        res.status(201).json({
            message: 'Inscripción creada exitosamente desde Admin',
            inscripcion: inscripcionGuardada,
            data: inscripcionGuardada
        });

    } catch (error) {
        console.error('❌ Error creando inscripción directa:', error);
        
        // Manejar errores de validación de Mongoose
        if (error.name === 'ValidationError') {
            const errores = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ 
                message: 'Error de validación', 
                errores 
            });
        }
        
        res.status(500).json({ 
            message: 'Error interno del servidor', 
            error: error.message 
        });
    }
});

// PUT /api/inscripciones/:id - Actualizar inscripción
router.put('/:id', async (req, res) => {
    try {
        const {
            tripulante, nombres, apellidos, edad, experiencia, grupoSanguineo,
            dni, email, celular, personaContacto, celularContacto,
            grupo, contacto, frecuencia,
            tipoVehiculo, marca, modelo, año, diaLlegada
        } = req.body;

        // Validar que la inscripción existe
        const inscripcionExistente = await Inscripcion.findById(req.params.id);
        if (!inscripcionExistente) {
            return res.status(404).json({ message: 'Inscripción no encontrada' });
        }

        // Validar DNI único (excluyendo el registro actual)
        const existeDNI = await Inscripcion.findOne({ 
            dni, 
            activo: true, 
            _id: { $ne: req.params.id } 
        });
        if (existeDNI) {
            return res.status(400).json({ 
                message: 'Ya existe otra inscripción con este DNI' 
            });
        }

        // Validar email único (excluyendo el registro actual)
        const existeEmail = await Inscripcion.findOne({ 
            email, 
            activo: true, 
            _id: { $ne: req.params.id } 
        });
        if (existeEmail) {
            return res.status(400).json({ 
                message: 'Ya existe otra inscripción con este email' 
            });
        }

        // Actualizar inscripción
        const inscripcionActualizada = await Inscripcion.findByIdAndUpdate(
            req.params.id,
            {
                tripulante,
                nombres: nombres.trim(),
                apellidos: apellidos.trim(),
                edad: parseInt(edad),
                experiencia,
                grupoSanguineo: grupoSanguineo.trim().toUpperCase(),
                dni: dni.trim(),
                email: email.trim().toLowerCase(),
                celular: celular.trim(),
                personaContacto: personaContacto.trim(),
                celularContacto: celularContacto.trim(),
                grupo: grupo.trim(),
                contacto: contacto.trim(),
                frecuencia: parseFloat(frecuencia),
                tipoVehiculo,
                marca: marca.trim(),
                modelo: modelo.trim(),
                año: parseInt(año),
                diaLlegada
            },
            { new: true, runValidators: true }
        );

        res.json({
            message: 'Inscripción actualizada exitosamente',
            inscripcion: inscripcionActualizada
        });

    } catch (error) {
        console.error('Error actualizando inscripción:', error);
        
        if (error.name === 'ValidationError') {
            const errores = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ 
                message: 'Error de validación', 
                errores 
            });
        }
        
        res.status(500).json({ 
            message: 'Error interno del servidor', 
            error: error.message 
        });
    }
});

// DELETE /api/inscripciones/:id - Eliminar inscripción (soft delete)
router.delete('/:id', async (req, res) => {
    try {
        const inscripcion = await Inscripcion.findById(req.params.id);
        
        if (!inscripcion) {
            return res.status(404).json({ message: 'Inscripción no encontrada' });
        }

        // Soft delete - marcar como inactivo
        await Inscripcion.findByIdAndUpdate(
            req.params.id,
            { activo: false }
        );

        res.json({ message: 'Inscripción eliminada exitosamente' });

    } catch (error) {
        console.error('Error eliminando inscripción:', error);
        res.status(500).json({ 
            message: 'Error interno del servidor', 
            error: error.message 
        });
    }
});

// GET /api/inscripciones/estadisticas/resumen - Obtener estadísticas
router.get('/estadisticas/resumen', async (req, res) => {
    try {
        const totalInscripciones = await Inscripcion.countDocuments({ activo: true });
        
        const pilotos = await Inscripcion.countDocuments({ 
            tripulante: 'PILOTO', 
            activo: true 
        });
        
        const gruposUnicos = await Inscripcion.distinct('grupo', { activo: true });
        
        res.json({
            totalInscripciones,
            totalPilotos: pilotos,
            totalGrupos: gruposUnicos.length
        });

    } catch (error) {
        console.error('Error obteniendo estadísticas:', error);
        res.status(500).json({ 
            message: 'Error obteniendo estadísticas', 
            error: error.message 
        });
    }
});

// ===============================
// 🌐 PÚBLICO: Endpoints para verificación por email
// ===============================

// ===============================
// ENDPOINT: Enviar código de verificación (SOLO PÚBLICO)
// ===============================
router.post('/enviar-codigo', async (req, res) => {
    try {
        const { email, datosInscripcion } = req.body;
        
        console.log('📧 PÚBLICO: Enviando código de verificación a:', email);
        
        // Validar datos básicos
        if (!email || !datosInscripcion) {
            return res.status(400).json({
                success: false,
                message: 'Email y datos de inscripción son requeridos'
            });
        }
        
        // Generar código de 6 dígitos
        const codigo = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Guardar código temporalmente (10 minutos de expiración)
        global.codigosVerificacion.set(email, {
            codigo,
            timestamp: Date.now(),
            datosInscripcion,
            intentos: 0,
            expiresAt: Date.now() + (10 * 60 * 1000) // 10 minutos
        });
        
        // Enviar email con el código
        await emailService.enviarCodigoVerificacion(email, codigo, datosInscripcion);
        
        console.log('✅ PÚBLICO: Código enviado exitosamente a:', email);
        
        res.json({
            success: true,
            message: 'Código enviado exitosamente',
            // Solo en desarrollo, mostrar el código en la respuesta
            debug: process.env.NODE_ENV === 'development' ? { codigo } : undefined
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
// ENDPOINT: Verificar código y guardar inscripción (SOLO PÚBLICO)
// ===============================
router.post('/verificar-codigo', async (req, res) => {
    try {
        const { email, codigo, datosInscripcion } = req.body;
        
        console.log('🔍 PÚBLICO: Verificando código para:', email);
        
        // Validar parámetros
        if (!email || !codigo || !datosInscripcion) {
            return res.status(400).json({
                success: false,
                message: 'Email, código y datos de inscripción son requeridos'
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
        
        console.log('✅ PÚBLICO: Código verificado correctamente');
        
        // 🎯 CÓDIGO CORRECTO - GUARDAR INSCRIPCIÓN EN LA BASE DE DATOS
        try {
            // Validar DNI único antes de crear
            const existeDNI = await Inscripcion.findOne({ 
                dni: datosInscripcion.dni, 
                activo: true 
            });
            if (existeDNI) {
                global.codigosVerificacion.delete(email);
                return res.status(400).json({
                    success: false,
                    message: 'Ya existe una inscripción con este DNI'
                });
            }

            // Validar email único antes de crear
            const existeEmail = await Inscripcion.findOne({ 
                email: datosInscripcion.email, 
                activo: true 
            });
            if (existeEmail) {
                global.codigosVerificacion.delete(email);
                return res.status(400).json({
                    success: false,
                    message: 'Ya existe una inscripción con este email'
                });
            }
            
            // Generar número de equipo automáticamente
            const totalInscripciones = await Inscripcion.countDocuments({ activo: true });
            const numeroEquipo = totalInscripciones + 1;
            
            // Preparar datos para la inscripción con numero generado
            const datosCompletos = {
                ...datosInscripcion,
                N_equipo: numeroEquipo,
                numeroGrupo: numeroEquipo,
                activo: true
            };
            
            const nuevaInscripcion = new Inscripcion(datosCompletos);
            await nuevaInscripcion.save();
            
            console.log('✅ PÚBLICO: Inscripción guardada en BD:', nuevaInscripcion.N_equipo || nuevaInscripcion.NRO);
            
            // 🎯 ENVIAR EMAIL DE CONFIRMACIÓN (segundo email)
            try {
                await emailService.enviarConfirmacionInscripcion(email, nuevaInscripcion);
                console.log('✅ Email de confirmación enviado');
            } catch (emailError) {
                console.error('⚠️ Error enviando confirmación (inscripción ya guardada):', emailError);
                // No fallar el proceso si el email de confirmación falla
            }
            
            // Limpiar código usado
            global.codigosVerificacion.delete(email);
            
            res.json({
                success: true,
                message: 'Código verificado e inscripción guardada exitosamente',
                data: nuevaInscripcion.toPublicJSON ? nuevaInscripcion.toPublicJSON() : nuevaInscripcion
            });
            
        } catch (dbError) {
            console.error('❌ Error guardando en base de datos:', dbError);
            
            // Manejar errores específicos de la base de datos
            if (dbError.name === 'ValidationError') {
                const errores = Object.values(dbError.errors).map(err => err.message);
                return res.status(400).json({
                    success: false,
                    message: 'Error de validación',
                    errors: errores
                });
            }
            
            // Error genérico de base de datos
            return res.status(500).json({
                success: false,
                message: 'Error guardando inscripción en la base de datos',
                error: dbError.message
            });
        }
        
    } catch (error) {
        console.error('❌ Error verificando código:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
});

// ===============================
// ENDPOINT: Obtener estadísticas (si no lo tienes ya)
// ===============================
router.get('/stats', async (req, res) => {
    try {
        const total = await Inscripcion.countDocuments({ activo: { $ne: false } });
        const confirmados = await Inscripcion.countDocuments({ 
            estado: 'CONFIRMADO', 
            activo: { $ne: false } 
        });
        const pendientes = await Inscripcion.countDocuments({ 
            estado: 'PENDIENTE', 
            activo: { $ne: false } 
        });
        
        const stats = {
            total,
            confirmados,
            pendientes,
            porTipo: await Inscripcion.aggregate([
                { $match: { activo: { $ne: false } } },
                { $group: { _id: '$tripulante', count: { $sum: 1 } } }
            ])
        };
        
        res.json({
            success: true,
            data: stats
        });
        
    } catch (error) {
        console.error('❌ Error obteniendo estadísticas:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo estadísticas',
            error: error.message
        });
    }
});

// ===============================
// ENDPOINT: Obtener equipo completo
// ===============================
router.get('/equipo/:N_equipo', async (req, res) => {
    try {
        const { N_equipo } = req.params;
        
        const miembros = await Inscripcion.find({ 
            N_equipo: parseInt(N_equipo),
            activo: { $ne: false }
        }).sort({ tripulante: 1 });
        
        if (miembros.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Equipo no encontrado'
            });
        }
        
        // Tomar datos del grupo del primer miembro
        const primerMiembro = miembros[0];
        
        const equipo = {
            N_equipo: parseInt(N_equipo),
            grupo: primerMiembro.grupo,
            frecuencia: primerMiembro.frecuencia,
            liderGrupo: primerMiembro.liderGrupo,
            totalMiembros: miembros.length,
            miembros: miembros.map(m => ({
                id: m._id || m.id,
                tripulante: m.tripulante,
                nombreCompleto: m.nombreCompleto || `${m.nombres} ${m.apellidos}`,
                email: m.email,
                celular: m.celular,
                edad: m.edad,
                experiencia: m.experiencia,
                grupoSanguineo: m.grupoSanguineo,
                vehiculoCompleto: m.vehiculoCompleto || `${m.marca} ${m.modelo} ${m.año}`,
                diaLlegada: m.diaLlegada,
                estado: m.estado
            }))
        };
        
        res.json({
            success: true,
            data: equipo
        });
        
    } catch (error) {
        console.error('❌ Error obteniendo equipo:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo datos del equipo',
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