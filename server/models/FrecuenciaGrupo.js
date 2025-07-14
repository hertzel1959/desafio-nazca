const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const frecuenciaGrupoSchema = new mongoose.Schema({
  id: { type: Number },  // ← AGREGAR ESTE CAMPO
  grupo: { type: String, required: true },
  frecuencia: { type: Number },
  contacto: { type: String },
  email: { type: String },
  telefono: { type: String },
  activo: { type: Boolean, default: true }
}, { timestamps: true });

// Campo autoincremental personalizado como 'id'
frecuenciaGrupoSchema.plugin(AutoIncrement, { inc_field: 'id' });

module.exports = mongoose.model('FrecuenciaGrupo', frecuenciaGrupoSchema, 'frecuencias');
