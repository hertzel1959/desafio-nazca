const mongoose = require('mongoose');
const counterService = require('../services/counterService');

const inscripcionSchema = new mongoose.Schema({
  NRO: {
    type: Number
  },
  N_equipo: {
    type: Number
    // ❌ QUITAR required: true porque se asigna automáticamente
    // required: [true, 'El número de equipo es obligatorio'],
    //index: true
  },
  tripulante: {
    type: String,
    required: [true, 'El tipo de tripulante es obligatorio'],
    enum: {
      values: ['piloto', 'copiloto', 'acompañante1', 'acompañante2', 'acompañante3'],
      message: 'Tripulante debe ser: piloto, copiloto, acompañante1, acompañante2 o acompañante3'
    },
    default: 'piloto' // Piloto como default
  },
  grupo: {
    type: String,
    required: [true, 'El grupo es obligatorio'],
    trim: true,
    validate: {
      validator: async function(v) {
        if (!v) return false;
        const Frecuencia = mongoose.model('Frecuencia');
        const frecuencia = await Frecuencia.findOne({ grupo: v });
        return !!frecuencia;
      },
      message: 'El grupo especificado no existe en la tabla de frecuencias'
    }
  },
  liderGrupo: {
    type: String,
    trim: true,
    default: ""
  },
  nombres: {
    type: String,
    required: [true, 'Los nombres son obligatorios'],
    trim: true,
    minlength: [2, 'Los nombres deben tener al menos 2 caracteres'],
    maxlength: [50, 'Los nombres no pueden exceder 50 caracteres']
  },
  apellidos: {
    type: String,
    required: [true, 'Los apellidos son obligatorios'],
    trim: true,
    minlength: [2, 'Los apellidos deben tener al menos 2 caracteres'],
    maxlength: [50, 'Los apellidos no pueden exceder 50 caracteres']
  },
  edad: {
    type: Number,
    required: [true, 'La edad es obligatoria'],
    min: [16, 'Debe ser mayor de 16 años para participar'],
    max: [80, 'Edad máxima permitida es 80 años']
  },
  experiencia: {
    type: String,
    required: [true, 'La experiencia es obligatoria'],
    enum: {
      values: ['Experto', 'Intermedio', 'Principiante'],
      message: 'Experiencia debe ser: Experto, Intermedio o Principiante'
    },
    default: 'Intermedio' // Intermedio como default más común
  },
  grupoSanguineo: {
    type: String,
    required: [true, 'El grupo sanguíneo es obligatorio'],
    enum: {
      values: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      message: 'Grupo sanguíneo debe ser: A+, A-, B+, B-, AB+, AB-, O+ u O-'
    },
    default: 'O+' // Donante universal como default
  },
  dni: {
    type: String,
    required: [true, 'El DNI es obligatorio'],
    trim: true,
    validate: {
      validator: function(v) {
        return /^[0-9]{8}$/.test(v); // DNI peruano: 8 dígitos
      },
      message: 'DNI debe tener 8 dígitos'
    }
  },
  email: {
    type: String,
    required: [true, 'El email es obligatorio'],
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: 'Email inválido'
    }
  },
  celular: {
    type: String,
    required: [true, 'El celular es obligatorio'],
    trim: true,
    validate: {
      validator: function(v) {
        return /^[\+]?[0-9\s\-\(\)]{9,15}$/.test(v);
      },
      message: 'Formato de celular inválido'
    }
  },
  personaContacto: {
    type: String,
    required: [true, 'La persona de contacto es obligatoria'],
    trim: true,
    maxlength: [100, 'Persona de contacto no puede exceder 100 caracteres']
  },
  celularContacto: {
    type: String,
    //required: [true, 'El celular de contacto es obligatorio'],
    required:false,
    trim: true,
    validate: {
      validator: function(v) {
        return /^[\+]?[0-9\s\-\(\)]{9,15}$/.test(v);
      },
      message: 'Formato de celular de contacto inválido'
    }
  },
  tipoVehiculo: {
    type: String,
    required: [true, 'El tipo de vehículo es obligatorio'],
    enum: {
      values: ['moto', 'cuatrimoto', 'UTV', 'arenero', 'camioneta'],
      message: 'Tipo de vehículo debe ser: moto, cuatrimoto, UTV, arenero o camioneta'
    },
    default: 'moto' // Moto como default más común en eventos de aventura
  },
  marca: {
    type: String,
    required: [true, 'La marca del vehículo es obligatoria'],
    trim: true,
    maxlength: [30, 'La marca no puede exceder 30 caracteres']
  },
  modelo: {
    type: String,
    required: [true, 'El modelo del vehículo es obligatorio'],
    trim: true,
    maxlength: [30, 'El modelo no puede exceder 30 caracteres']
  },
  año: {
    type: Number,
    required: [true, 'El año del vehículo es obligatorio'],
    min: [1990, 'Año mínimo del vehículo: 1990'],
    max: [new Date().getFullYear() + 1, 'Año no puede ser futuro']
  },
  frecuencia: {
    type: Number,
    default: null
  },
  frecuenciaGrupo: {
    type: String,
    default: ""
  },
  diaLlegada: {
    type: String,
    required: [true, 'El día de llegada es obligatorio'],
    enum: {
      values: ['jueves', 'viernes', 'sabado'],
      message: 'Día de llegada debe ser: jueves, viernes o sabado'
    },
    default: 'viernes' // Viernes como default más común
  },
  estado: {
    type: String,
    enum: ['PENDIENTE', 'CONFIRMADO', 'CANCELADO'],
    default: 'PENDIENTE'
  },
  observaciones: {
    type: String,
    trim: true,
    maxlength: [500, 'Las observaciones no pueden exceder 500 caracteres'],
    default: ""
  },
  fechaInscripcion: {
    type: Date,
    default: Date.now
  },
  activo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  versionKey: false,
  collection: 'inscripciones'
});

// Índices para optimizar consultas (SIN DUPLICADOS)
inscripcionSchema.index({ email: 1 }, { unique: true });
inscripcionSchema.index({ dni: 1 }, { unique: true });
inscripcionSchema.index({ NRO: 1 }, { unique: true });
inscripcionSchema.index({ N_equipo: 1 });
inscripcionSchema.index({ tripulante: 1 });
inscripcionSchema.index({ grupo: 1 });
inscripcionSchema.index({ estado: 1 });
inscripcionSchema.index({ tipoVehiculo: 1 });
inscripcionSchema.index({ diaLlegada: 1 });
inscripcionSchema.index({ fechaInscripcion: -1 });

// Índice compuesto para asegurar un solo tripulante por equipo
inscripcionSchema.index(
  { N_equipo: 1, tripulante: 1 }, 
  { unique: true, partialFilterExpression: { activo: true } }
);
// Método para obtener datos públicos
inscripcionSchema.methods.toPublicJSON = function() {
  return {
    id: this.NRO,
    NRO: this.NRO,
    N_equipo: this.N_equipo,
    tripulante: this.tripulante,
    grupo: this.grupo,
    liderGrupo: this.liderGrupo,
    nombres: this.nombres,
    apellidos: this.apellidos,
    nombreCompleto: `${this.nombres} ${this.apellidos}`,
    edad: this.edad,
    experiencia: this.experiencia,
    grupoSanguineo: this.grupoSanguineo,
    dni: this.dni,
    email: this.email,
    celular: this.celular,
    personaContacto: this.personaContacto,
    celularContacto: this.celularContacto,
    tipoVehiculo: this.tipoVehiculo,
    marca: this.marca,
    modelo: this.modelo,
    año: this.año,
    vehiculoCompleto: `${this.marca} ${this.modelo} (${this.año})`,
    frecuencia: this.frecuencia,
    frecuenciaGrupo: this.frecuenciaGrupo,
    diaLlegada: this.diaLlegada,
    estado: this.estado,
    observaciones: this.observaciones,
    fechaInscripcion: this.fechaInscripcion,
    activo: this.activo,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

// Método para datos de admin (sin ocultar información sensible)
inscripcionSchema.methods.toAdminJSON = function() {
  return this.toPublicJSON();
};

// ✅ MIDDLEWARE PRE-SAVE CORREGIDO
inscripcionSchema.pre('save', async function(next) {
  try {
    console.log(`🔄 Pre-save Inscripción - isNew: ${this.isNew}, NRO actual: ${this.NRO}`);
    
    // Generar NRO autoincremental solo para documentos nuevos
    if (this.isNew && !this.NRO) {
      try {
        // ✅ CORRECCIÓN: Usar await con getNextSequence
        this.NRO = await counterService.getNextSequence('inscripciones', 'NRO');
        console.log(`🔢 Asignando NRO de inscripción: ${this.NRO}`);
      } catch (counterError) {
        console.error('❌ Error obteniendo NRO:', counterError);
        // Fallback: usar timestamp si falla el counter
        this.NRO = Date.now() % 100000;
        console.log(`🔢 Fallback NRO: ${this.NRO}`);
      }
    }

    // Generar N_equipo autoincremental para nuevos equipos
    if (this.isNew && !this.N_equipo) {
      try {
        // ✅ CORRECCIÓN: Usar await con getNextSequence
        this.N_equipo = await counterService.getNextSequence('inscripciones', 'N_equipo');
        console.log(`👥 Asignando N_equipo: ${this.N_equipo}`);
      } catch (counterError) {
        console.error('❌ Error obteniendo N_equipo:', counterError);
        // Fallback: usar timestamp si falla el counter
        this.N_equipo = Date.now() % 10000;
        console.log(`👥 Fallback N_equipo: ${this.N_equipo}`);
      }
    }

    // Validar email único (case insensitive)
    if (this.isModified('email')) {
      const existingEmail = await this.constructor.findOne({
        email: this.email.toLowerCase(),
        _id: { $ne: this._id },
        activo: true
      });
      
      if (existingEmail) {
        const error = new Error('Ya existe una inscripción con este email');
        error.name = 'ValidationError';
        throw error;
      }
    }

    // Validar DNI único
    if (this.isModified('dni')) {
      const existingDni = await this.constructor.findOne({
        dni: this.dni,
        _id: { $ne: this._id },
        activo: true
      });
      
      if (existingDni) {
        const error = new Error('Ya existe una inscripción con este DNI');
        error.name = 'ValidationError';
        throw error;
      }
    }

    // Validar que solo hay un tripulante de cada tipo por equipo
    if (this.isModified('N_equipo') || this.isModified('tripulante')) {
      const existingTripulante = await this.constructor.findOne({
        N_equipo: this.N_equipo,
        tripulante: this.tripulante,
        _id: { $ne: this._id },
        activo: true
      });
      
      if (existingTripulante) {
        const error = new Error(`Ya existe un ${this.tripulante} para el equipo ${this.N_equipo}`);
        error.name = 'ValidationError';
        throw error;
      }
    }

    // Auto-asignar datos del grupo desde frecuencias
    if (this.isModified('grupo') && this.grupo) {
      try {
        const Frecuencia = mongoose.model('Frecuencia');
        const frecuencia = await Frecuencia.findOne({ grupo: this.grupo });
        
        if (frecuencia) {
          this.frecuencia = frecuencia.frecuencia;
          this.frecuenciaGrupo = frecuencia.grupo;
          this.liderGrupo = frecuencia.contacto || '';
          console.log(`📻 Datos de frecuencia auto-asignados: ${frecuencia.frecuencia} MHz para grupo ${this.grupo}`);
        }
      } catch (frecError) {
        console.warn('⚠️ Error obteniendo datos de frecuencia:', frecError.message);
        // No bloquear el guardado si falla la frecuencia
      }
    }

    next();
  } catch (error) {
    console.error('❌ Error en pre-save:', error);
    next(error);
  }
});

// Middleware post-save para logging
inscripcionSchema.post('save', function(doc) {
  console.log(`✅ Inscripción guardada: ${doc.nombres} ${doc.apellidos} (Equipo: ${doc.N_equipo}, ${doc.tripulante}, NRO: ${doc.NRO})`);
});

// Método estático para obtener el siguiente número de equipo
inscripcionSchema.statics.getNextEquipoNumber = async function() {
  try {
    return await counterService.getNextSequence('inscripciones', 'N_equipo');
  } catch (error) {
    console.error('❌ Error obteniendo siguiente número de equipo:', error);
    return Date.now() % 10000; // Fallback
  }
};

// Método estático para obtener miembros de un equipo
inscripcionSchema.statics.getEquipoMembers = function(N_equipo) {
  return this.find({ N_equipo, activo: true }).sort({ tripulante: 1 });
};

const Inscripcion = mongoose.model('Inscripcion', inscripcionSchema);

module.exports = Inscripcion;