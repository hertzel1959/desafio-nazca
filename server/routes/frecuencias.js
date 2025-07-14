const express = require('express');
const router = express.Router();
const {
  getAllFrecuencias,
  getFrecuenciaById,
  createFrecuencia,
  updateFrecuencia,
  deleteFrecuencia
} = require('../controllers/frecuenciaController');

// Middleware para logging de rutas
router.use((req, res, next) => {
  console.log(`🛣️ ${req.method} ${req.originalUrl} - ${new Date().toISOString()}`);
  next();
});

// @route   GET /api/frecuencias-new
// @desc    Obtener todas las frecuencias (con filtros y paginación)
// @access  Public
// @query   ?page=1&limit=10&grupo=viciosos&frecuencia=144.45
router.get('/', getAllFrecuencias);

// @route   GET /api/frecuencias-new/:id
// @desc    Obtener frecuencia por NRO
// @access  Public
router.get('/:id', getFrecuenciaById);

// @route   POST /api/frecuencias-new
// @desc    Crear nueva frecuencia
// @access  Public
// @body    { grupo, frecuencia, contacto?, email?, telefono?, activo? }
router.post('/', createFrecuencia);

// @route   PUT /api/frecuencias-new/:id
// @desc    Actualizar frecuencia completa
// @access  Public
// @body    { grupo?, frecuencia?, contacto?, email?, telefono?, activo? }
router.put('/:id', updateFrecuencia);

// @route   DELETE /api/frecuencias-new/:id
// @desc    Eliminar frecuencia
// @access  Public
router.delete('/:id', deleteFrecuencia);

module.exports = router;