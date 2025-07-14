// models/Inscripcion.js
const mongoose = require('mongoose');

const inscripcionSchema = new mongoose.Schema({
    // Información del participante
    tripulante: {
        type: String,
        required: [true, 'El tipo de tripulante es obligatorio'],
        enum: ['PILOTO', 'COPILOTO', 'ACOMPAÑANTE 1', 'ACOMPAÑANTE 2', 'ACOMPAÑANTE 3'],
        trim: true
    },
    nombres: {
        type: String,
        required: [true, 'Los nombres son obligatorios'],
        trim: true,
        maxlength: [100, 'Los nombres no pueden exceder 100 caracteres']
    },
    apellidos: {
        type: String,
        required: [true, 'Los apellidos son obligatorios'],
        trim: true,
        maxlength: [100, 'Los apellidos no pueden exceder 100 caracteres']
    },
    edad: {
        type: Number,
        required: [true, 'La edad es obligatoria'],
        min: [1, 'La edad debe ser mayor a 0'],
        max: [120, 'La edad debe ser menor a 120']
    },
    experiencia: {
        type: String,
        required: [true, 'La experiencia es obligatoria'],
        enum: ['EXPERTO', 'INTERMEDIO', 'PRINCIPIANTE'],
        trim: true
    },
    grupoSanguineo: {
        type: String,
        required: [true, 'El grupo sanguíneo es obligatorio'],
        trim: true,
        uppercase: true,
        maxlength: [5, 'El grupo sanguíneo no puede exceder 5 caracteres']
    },
    dni: {
        type: String,
        required: [true, 'El DNI es obligatorio'],
        unique: true,
        trim: true,
        minlength: [8, 'El DNI debe tener 8 dígitos'],
        maxlength: [8, 'El DNI debe tener 8 dígitos'],
        validate: {
            validator: function(v) {
                return /^\d{8}$/.test(v);
            },
            message: 'El DNI debe contener exactamente 8 dígitos'
        }
    },
    email: {
        type: String,
        required: [true, 'El email es obligatorio'],
        unique: true,
        trim: true,
        lowercase: true,
        validate: {
            validator: function(v) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: 'El email debe tener un formato válido'
        }
    },
    celular: {
        type: String,
        required: [true, 'El celular es obligatorio'],
        trim: true,
        minlength: [9, 'El celular debe tener 9 dígitos'],
        maxlength: [9, 'El celular debe tener 9 dígitos'],
        validate: {
            validator: function(v) {
                return /^\d{9}$/.test(v);
            },
            message: 'El celular debe contener exactamente 9 dígitos'
        }
    },

    // Información de contacto de emergencia
    personaContacto: {
        type: String,
        required: [true, 'La persona de contacto es obligatoria'],
        trim: true,
        maxlength: [150, 'El nombre de contacto no puede exceder 150 caracteres']
    },
    celularContacto: {
        type: String,
        required: [true, 'El celular de contacto es obligatorio'],
        trim: true,
        minlength: [9, 'El celular de contacto debe tener 9 dígitos'],
        maxlength: [9, 'El celular de contacto debe tener 9 dígitos'],
        validate: {
            validator: function(v) {
                return /^\d{9}$/.test(v);
            },
            message: 'El celular de contacto debe contener exactamente 9 dígitos'
        }
    },

    // Información del grupo (adaptado a tu modelo FrecuenciaGrupo)
    grupo: {
        type: String,
        required: [true, 'El nombre del grupo es obligatorio'],
        trim: true,
        maxlength: [100, 'El nombre del grupo no puede exceder 100 caracteres']
    },
    contacto: {
        type: String,
        required: [true, 'El contacto del grupo es obligatorio'],
        trim: true,
        maxlength: [150, 'El nombre del contacto no puede exceder 150 caracteres']
    },
    numeroGrupo: {
        type: Number,
        required: [true, 'El número de grupo es obligatorio'],
        min: [1, 'El número de grupo debe ser mayor a 0']
    },
    frecuencia: {
        type: Number,
        required: [true, 'La frecuencia de radio es obligatoria'],
        min: [144.0, 'La frecuencia debe estar entre 144.000 y 148.000 MHz'],
        max: [148.0, 'La frecuencia debe estar entre 144.000 y 148.000 MHz']
    },

    // Información del vehículo
    tipoVehiculo: {
        type: String,
        required: [true, 'El tipo de vehículo es obligatorio'],
        enum: ['MOTO', 'CUATRIMOTO', 'UTV', 'ARENERO', 'CAMIONETA'],
        trim: true
    },
    marca: {
        type: String,
        required: [true, 'La marca del vehículo es obligatoria'],
        trim: true,
        maxlength: [50, 'La marca no puede exceder 50 caracteres']
    },
    modelo: {
        type: String,
        required: [true, 'El modelo del vehículo es obligatorio'],
        trim: true,
        maxlength: [50, 'El modelo no puede exceder 50 caracteres']
    },
    año: {
        type: Number,
        required: [true, 'El año del vehículo es obligatorio'],
        min: [1900, 'El año debe ser mayor a 1900'],
        max: [new Date().getFullYear() + 1, 'El año no puede ser mayor al próximo año']
    },

    // Información del evento
    diaLlegada: {
        type: String,
        required: [true, 'El día de llegada es obligatorio'],
        enum: ['JUEVES', 'VIERNES', 'SABADO'],
        trim: true
    },

    // Metadata
    activo: {
        type: Boolean,
        default: true
    }
}, { 
    timestamps: true,
    versionKey: false 
});

// Índices para optimizar consultas
inscripcionSchema.index({ dni: 1 }, { unique: true });
inscripcionSchema.index({ email: 1 }, { unique: true });
inscripcionSchema.index({ activo: 1 });
inscripcionSchema.index({ grupo: 1 });
inscripcionSchema.index({ createdAt: -1 });

// Método virtual para nombre completo
inscripcionSchema.virtual('nombreCompleto').get(function() {
    return `${this.nombres} ${this.apellidos}`;
});

// Método virtual para información del vehículo
inscripcionSchema.virtual('vehiculoCompleto').get(function() {
    return `${this.marca} ${this.modelo} (${this.año})`;
});

module.exports = mongoose.model('Inscripcion', inscripcionSchema);