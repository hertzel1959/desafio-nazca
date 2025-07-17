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
    required:false,
    trim: true,
    validate: {
        validator: function(v) {
            // Validación más permisiva: solo números, espacios y guiones
            return !v || /^[\+]?[0-9\s\-\(\)]{7,20}$/.test(v);
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
      values: ['miercoles','jueves', 'viernes', 'sabado'],
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

// ✅ MIDDLEWARE PRE-SAVE CON RELACIÓN CORRECTA
inscripcionSchema.pre('save', async function(next) {
  try {
    console.log(`🔄 Pre-save Inscripción - isNew: ${this.isNew}, NRO actual: ${this.NRO}`);
    
    // ✅ 1. GENERAR NRO SECUENCIAL (solo para inscripciones)
    if (this.isNew && !this.NRO) {
      try {
        // Verificar si el contador está inicializado
        let currentNRO = counterService.getCurrentValue('inscripciones', 'NRO');
        
        // Si no está inicializado, inicializarlo
        if (currentNRO === 0) {
          console.log('🔧 Inicializando contador NRO...');
          await counterService.initCounter('inscripciones', 'NRO');
        }
        
        // Obtener siguiente valor secuencial
        this.NRO = counterService.getNextValue('inscripciones', 'NRO');
        console.log(`🔢 Asignando NRO secuencial: ${this.NRO}`);
        
      } catch (counterError) {
        console.error('❌ Error obteniendo NRO:', counterError);
        // ✅ FALLBACK: contar documentos existentes
        const count = await this.constructor.countDocuments({ activo: true });
        this.NRO = count + 1;
        console.log(`🔢 Fallback NRO: ${this.NRO}`);
      }
    }

    // ✅ 2. ASIGNAR N_EQUIPO BASADO EN EL GRUPO SELECCIONADO
    if (this.isModified('grupo') && this.grupo) {
      try {
        const Frecuencia = mongoose.model('Frecuencia');
        const frecuencia = await Frecuencia.findOne({ grupo: this.grupo });
        
        if (frecuencia) {
          // 🎯 N_EQUIPO = NRO DEL GRUPO (no secuencial independiente)
          this.N_equipo = frecuencia.NRO;
          this.frecuencia = frecuencia.frecuencia;
          this.frecuenciaGrupo = frecuencia.grupo;
          this.liderGrupo = frecuencia.contacto || '';
          
          console.log(`👥 N_equipo asignado: ${this.N_equipo} (NRO del grupo "${this.grupo}")`);
          console.log(`📻 Frecuencia asignada: ${frecuencia.frecuencia} MHz`);
        } else {
          console.warn(`⚠️ No se encontró frecuencia para grupo: ${this.grupo}`);
          throw new Error(`Grupo "${this.grupo}" no existe en la tabla de frecuencias`);
        }
      } catch (frecError) {
        console.error('❌ Error obteniendo datos del grupo:', frecError.message);
        throw frecError; // Bloquear guardado si no existe el grupo
      }
    }

    // ✅ 3. SI ES NUEVO Y NO SE MODIFICÓ EL GRUPO, PERO YA TIENE GRUPO
    if (this.isNew && !this.N_equipo && this.grupo) {
      try {
        const Frecuencia = mongoose.model('Frecuencia');
        const frecuencia = await Frecuencia.findOne({ grupo: this.grupo });
        
        if (frecuencia) {
          this.N_equipo = frecuencia.NRO;
          this.frecuencia = frecuencia.frecuencia;
          this.frecuenciaGrupo = frecuencia.grupo;
          this.liderGrupo = frecuencia.contacto || '';
          
          console.log(`👥 N_equipo asignado (nuevo): ${this.N_equipo}`);
        }
      } catch (error) {
        console.error('❌ Error asignando N_equipo para nuevo documento:', error);
      }
    }

    // ✅ 4. NORMALIZAR DATOS
    if (this.email) {
      this.email = this.email.toLowerCase().trim();
    }
    
    if (this.dni) {
      this.dni = this.dni.trim();
    }

    console.log(`✅ Pre-save completado: NRO=${this.NRO}, N_equipo=${this.N_equipo}, grupo=${this.grupo}`);
    next();
    
  } catch (error) {
    console.error('❌ Error crítico en pre-save:', error);
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