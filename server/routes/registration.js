/**
 * RUTAS DE REGISTRO
 * Endpoints para manejo de registros de participantes
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const Registration = require('../models/registration');
const router = express.Router();

/**
 * VALIDACIONES
 */
const registerValidation = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Email no válido'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Contraseña debe tener al menos 6 caracteres'),
    body('phone')
        .matches(/^(\+51|51)?[9][0-9]{8}$/)
        .withMessage('Teléfono no válido'),
    body('group')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Nombre del grupo debe tener entre 2 y 100 caracteres'),
    body('leader')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Nombre del líder debe tener entre 2 y 100 caracteres')
];

const loginValidation = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Email no válido'),
    body('password')
        .notEmpty()
        .withMessage('Contraseña es requerida')
];

/**
 * MIDDLEWARE DE VALIDACIÓN
 */
function handleValidationErrors(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Errores de validación',
            errors: errors.array()
        });
    }
    next();
}

/**
 * RUTAS
 */

/**
 * POST /api/registration/register
 * Registrar nuevo participante
 */
router.post('/register', registerValidation, handleValidationErrors, async (req, res) => {
    try {
        const {
            email,
            password,
            phone,
            group,
            frequency,
            leader,
            'second-leader': secondLeader
        } = req.body;

        // Verificar si el email ya existe
        const existingRegistration = await Registration.findByEmail(email);
        if (existingRegistration) {
            return res.status(409).json({
                success: false,
                message: 'Ya existe un registro con este email'
            });
        }

        // Hash de la contraseña
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Crear nuevo registro
        const registration = new Registration({
            email,
            password: hashedPassword,
            phone,
            groupName: group,
            frequency,
            leader: {
                name: leader
            },
            secondLeader: secondLeader ? {
                name: secondLeader
            } : undefined,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
            source: 'web'
        });

        await registration.save();

        // Enviar email de confirmación (implementar)
        // await sendConfirmationEmail(registration);

        res.status(201).json({
            success: true,
            message: 'Registro exitoso. Te contactaremos pronto para confirmar tu participación.',
            data: {
                id: registration._id,
                email: registration.email,
                groupName: registration.groupName,
                status: registration.status
            }
        });

    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

/**
 * POST /api/registration/login
 * Iniciar sesión de participante
 */
router.post('/login', loginValidation, handleValidationErrors, async (req, res) => {
    try {
        const { email, password } = req.body;

        // Buscar registro
        const registration = await Registration.findByEmail(email);
        if (!registration) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales incorrectas'
            });
        }

        // Verificar contraseña
        const isValidPassword = await bcrypt.compare(password, registration.password);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales incorrectas'
            });
        }

        // Verificar si está activo
        if (!registration.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Registro desactivado. Contacta al administrador.'
            });
        }

        res.json({
            success: true,
            message: 'Inicio de sesión exitoso',
            data: {
                id: registration._id,
                email: registration.email,
                groupName: registration.groupName,
                status: registration.status,
                completionPercentage: registration.completionPercentage
            }
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

/**
 * GET /api/registration/profile/:id
 * Obtener perfil de registro
 */
router.get('/profile/:id', async (req, res) => {
    try {
        const registration = await Registration.findById(req.params.id);
        
        if (!registration) {
            return res.status(404).json({
                success: false,
                message: 'Registro no encontrado'
            });
        }

        res.json({
            success: true,
            data: registration
        });

    } catch (error) {
        console.error('Error obteniendo perfil:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

/**
 * PUT /api/registration/profile/:id
 * Actualizar perfil de registro
 */
router.put('/profile/:id', async (req, res) => {
    try {
        const registration = await Registration.findById(req.params.id);
        
        if (!registration) {
            return res.status(404).json({
                success: false,
                message: 'Registro no encontrado'
            });
        }

        // Campos permitidos para actualizar
        const allowedFields = [
            'phone', 'frequency', 'leader', 'secondLeader', 'members',
            'vehicle', 'preferences', 'notes'
        ];

        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                registration[field] = req.body[field];
            }
        });

        await registration.save();

        res.json({
            success: true,
            message: 'Perfil actualizado exitosamente',
            data: registration
        });

    } catch (error) {
        console.error('Error actualizando perfil:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

/**
 * POST /api/registration/member/:id
 * Agregar miembro al equipo
 */
router.post('/member/:id', async (req, res) => {
    try {
        const registration = await Registration.findById(req.params.id);
        
        if (!registration) {
            return res.status(404).json({
                success: false,
                message: 'Registro no encontrado'
            });
        }

        // Validar datos del miembro
        const { name, dni, phone, email, role } = req.body;
        
        if (!name || name.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Nombre del miembro es requerido'
            });
        }

        const memberData = {
            name: name.trim(),
            dni: dni ? dni.trim() : undefined,
            phone: phone ? phone.trim() : undefined,
            email: email ? email.toLowerCase().trim() : undefined,
            role: role || 'support'
        };

        await registration.addMember(memberData);

        res.json({
            success: true,
            message: 'Miembro agregado exitosamente',
            data: registration
        });

    } catch (error) {
        console.error('Error agregando miembro:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

/**
 * DELETE /api/registration/member/:id/:memberId
 * Eliminar miembro del equipo
 */
router.delete('/member/:id/:memberId', async (req, res) => {
    try {
        const registration = await Registration.findById(req.params.id);
        
        if (!registration) {
            return res.status(404).json({
                success: false,
                message: 'Registro no encontrado'
            });
        }

        await registration.removeMember(req.params.memberId);

        res.json({
            success: true,
            message: 'Miembro eliminado exitosamente',
            data: registration
        });

    } catch (error) {
        console.error('Error eliminando miembro:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

/**
 * POST /api/registration/document/:id
 * Subir documento
 */
router.post('/document/:id', async (req, res) => {
    try {
        // Implementar upload de archivos con multer
        // Esta es una implementación básica
        
        const registration = await Registration.findById(req.params.id);
        
        if (!registration) {
            return res.status(404).json({
                success: false,
                message: 'Registro no encontrado'
            });
        }

        const { docType, filename } = req.body;
        
        if (!['vehicleRegistration', 'soat', 'driverLicense', 'medicalCertificate'].includes(docType)) {
            return res.status(400).json({
                success: false,
                message: 'Tipo de documento no válido'
            });
        }

        await registration.updateDocument(docType, {
            uploaded: true,
            filename: filename,
            verified: false
        });

        res.json({
            success: true,
            message: 'Documento subido exitosamente',
            data: registration
        });

    } catch (error) {
        console.error('Error subiendo documento:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

/**
 * GET /api/registration/stats
 * Obtener estadísticas públicas
 */
router.get('/stats', async (req, res) => {
    try {
        const stats = await Registration.getStats();
        
        // Solo estadísticas públicas
        const publicStats = {
            totalRegistrations: stats.general.total,
            approvedRegistrations: stats.general.approved,
            totalParticipants: stats.general.totalMembers,
            categoriesCount: stats.byCategory
        };

        res.json({
            success: true,
            data: publicStats
        });

    } catch (error) {
        console.error('Error obteniendo estadísticas:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

/**
 * POST /api/registration/forgot-password
 * Recuperar contraseña
 */
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email es requerido'
            });
        }

        const registration = await Registration.findByEmail(email);
        
        if (!registration) {
            // Por seguridad, no revelar si el email existe o no
            return res.json({
                success: true,
                message: 'Si el email existe, recibirás instrucciones para recuperar tu contraseña'
            });
        }

        // TODO: Implementar envío de email con token de recuperación
        // const resetToken = generateResetToken();
        // await sendPasswordResetEmail(registration.email, resetToken);

        res.json({
            success: true,
            message: 'Si el email existe, recibirás instrucciones para recuperar tu contraseña'
        });

    } catch (error) {
        console.error('Error en recuperación de contraseña:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

module.exports = router;