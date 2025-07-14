const mongoose = require('mongoose');

const frecuenciaGrupoSchema = new mongoose.Schema({
  numero: Number,
  grupo: { type: String, required: true },
  frecuencia: { type: Number },
  contacto: { type: String },
  email: { type: String },
  telefono: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('FrecuenciaGrupo', frecuenciaGrupoSchema);
