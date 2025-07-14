const Frecuencia = require('../models/Frecuencia');

// GET ALL - Obtener todas las frecuencias
// GET ALL - Obtener todas las frecuencias
const getAllFrecuencias = async (req, res) => {
  try {
    console.log('📊 GET /api/frecuencias - Obteniendo todas las frecuencias');
    
    const { grupo, frecuencia, limit } = req.query;
    
    // Filtros opcionales
    const filter = {};
    if (grupo) filter.grupo = new RegExp(grupo, 'i');
    if (frecuencia) filter.frecuencia = parseFloat(frecuencia);
    
    // Consulta SIN paginación (devolver TODAS las frecuencias)
    let query = Frecuencia.find(filter).sort({ NRO: 1 });
    
    // Solo aplicar limit si se especifica explícitamente en la URL
    if (limit && !isNaN(limit)) {
      query = query.limit(parseInt(limit));
    }
    
    const frecuencias = await query;
    
    console.log(`✅ Encontradas ${frecuencias.length} frecuencias`);
    
    // Respuesta simple - array directo (como antes)
    res.status(200).json(frecuencias.map(f => f.toPublicJSON()));
    
  } catch (error) {
    console.error('❌ Error en getAllFrecuencias:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// GET BY ID - Obtener frecuencia por NRO
const getFrecuenciaById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔍 GET /api/frecuencias-new/${id} - Buscando frecuencia`);
    
    const frecuencia = await Frecuencia.findOne({ NRO: parseInt(id) });
    
    if (!frecuencia) {
      console.log(`❌ Frecuencia con NRO ${id} no encontrada`);
      return res.status(404).json({
        success: false,
        message: 'Frecuencia no encontrada'
      });
    }
    
    console.log(`✅ Frecuencia encontrada: ${frecuencia.contacto}`);
    
    res.status(200).json(frecuencia.toPublicJSON());
    
  } catch (error) {
    console.error('❌ Error en getFrecuenciaById:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// POST - Crear nueva frecuencia
const createFrecuencia = async (req, res) => {
  try {
    console.log('📝 POST /api/frecuencias-new - Creando nueva frecuencia');
    console.log('Datos recibidos:', req.body);
    
    const frecuencia = new Frecuencia(req.body);
    const savedFrecuencia = await frecuencia.save();
    
    console.log(`✅ Frecuencia creada con NRO: ${savedFrecuencia.NRO}`);
    
    res.status(201).json({
      success: true,
      message: 'Frecuencia creada exitosamente',
      data: savedFrecuencia.toPublicJSON()
    });
    
  } catch (error) {
    console.error('❌ Error en createFrecuencia:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe una frecuencia con estos datos'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// PUT - Actualizar frecuencia
const updateFrecuencia = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📝 PUT /api/frecuencias-new/${id} - Actualizando frecuencia`);
    console.log('Datos recibidos:', req.body);
    
    const frecuencia = await Frecuencia.findOne({ NRO: parseInt(id) });
    
    if (!frecuencia) {
      console.log(`❌ Frecuencia con NRO ${id} no encontrada`);
      return res.status(404).json({
        success: false,
        message: 'Frecuencia no encontrada'
      });
    }
    
    // Actualizar campos
    Object.keys(req.body).forEach(key => {
      if (key !== 'NRO') { // No permitir cambiar el NRO
        frecuencia[key] = req.body[key];
      }
    });
    
    const updatedFrecuencia = await frecuencia.save();
    
    console.log(`✅ Frecuencia actualizada: ${updatedFrecuencia.NRO}`);
    
    res.status(200).json({
      success: true,
      message: 'Frecuencia actualizada exitosamente',
      data: updatedFrecuencia.toPublicJSON()
    });
    
  } catch (error) {
    console.error('❌ Error en updateFrecuencia:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// DELETE - Eliminar frecuencia
const deleteFrecuencia = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ DELETE /api/frecuencias-new/${id} - Eliminando frecuencia`);
    
    const frecuencia = await Frecuencia.findOneAndDelete({ NRO: parseInt(id) });
    
    if (!frecuencia) {
      console.log(`❌ Frecuencia con NRO ${id} no encontrada`);
      return res.status(404).json({
        success: false,
        message: 'Frecuencia no encontrada'
      });
    }
    
    console.log(`✅ Frecuencia eliminada: ${frecuencia.contacto}`);
    
    res.status(200).json({
      success: true,
      message: 'Frecuencia eliminada exitosamente',
      data: frecuencia.toPublicJSON()
    });
    
  } catch (error) {
    console.error('❌ Error en deleteFrecuencia:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getAllFrecuencias,
  getFrecuenciaById,
  createFrecuencia,
  updateFrecuencia,
  deleteFrecuencia
};