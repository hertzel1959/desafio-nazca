const mongoose = require('mongoose');
const counterService = require('../services/counterService');

const frecuenciaSchema = new mongoose.Schema({
  NRO: {
    type: Number,
    unique: true
  },
  grupo: {
    type: String,
    required: [true, 'El grupo es obligatorio'],
    trim: true
  },
  frecuencia: {
    type: Number,
    required: [true, 'La frecuencia es obligatoria']
  },
  contacto: {
    type: String,
    trim: true,
    default: ""
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    default: "",
    validate: {
      validator: function(v) {
        return v === "" || /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: 'Email inválido'
    }
  },
  telefono: {
    type: String,
    trim: true,
    default: ""
  },
  activo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true, // Agrega createdAt y updatedAt automáticamente
  versionKey: false, // Elimina el campo __v
  collection: 'frecuencias' // Apunta a la colección existente
});

// NO crear índices - ya existen en la BD
// frecuenciaSchema.index({ NRO: 1 }, { unique: true });
// frecuenciaSchema.index({ email: 1 });
// frecuenciaSchema.index({ grupo: 1 });
// frecuenciaSchema.index({ frecuencia: 1 });

// Método para obtener datos públicos
frecuenciaSchema.methods.toPublicJSON = function() {
  return {
    id: this.NRO,        // ← Frontend espera "id", mapeamos NRO
    NRO: this.NRO,       // ← Mantenemos NRO también
    grupo: this.grupo,
    frecuencia: this.frecuencia,
    contacto: this.contacto,
    email: this.email,
    telefono: this.telefono,
    activo: this.activo,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

// Middleware pre-save para generar NRO autoincremental y validaciones
frecuenciaSchema.pre('save', async function(next) {
  try {  console.log(`🔄 Pre-save ejecutándose - isNew: ${this.isNew}, NRO actual: ${this.NRO}`);
    // Generar NRO autoincremental solo para documentos nuevos
    if (this.isNew && !this.NRO) {
      // Usar estrategia eficiente: MAX + incremento en memoria
     // this.NRO = counterService.getNextValue('frecuencias', 'NRO');
     this.NRO = counterService.getNextValue('frecuencias', 'NRO');
     console.log(`🔢 Asignando NRO: ${this.NRO} - Documento nuevo: ${this.isNew}`);
    }

    // Validar que el email no esté duplicado para el mismo grupo (solo si tiene email)
    if (this.email && this.email !== "" && (this.isModified('email') || this.isModified('grupo'))) {
      const existingFrecuencia = await this.constructor.findOne({
        email: this.email,
        grupo: this.grupo,
        _id: { $ne: this._id }
      });
      
      if (existingFrecuencia) {
        const error = new Error('Ya existe una inscripción con este email para el grupo seleccionado');
        error.name = 'ValidationError';
        throw error;
      }
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

const Frecuencia = mongoose.model('Frecuencia', frecuenciaSchema);

module.exports = Frecuencia;