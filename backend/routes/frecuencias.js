const express = require('express');
const router = express.Router();
const FrecuenciaGrupo = require('../models/FrecuenciaGrupo');
const authMiddleware = require('../middleware/auth');

// Obtener todas las frecuencias
router.get('/', async (req, res) => {
  try {
    const frecuencias = await FrecuenciaGrupo.find();
    res.status(200).json(frecuencias);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener frecuencias' });
  }
});

// Crear nueva frecuencia (requiere token)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const nuevaFrecuencia = new FrecuenciaGrupo(req.body);
    const guardado = await nuevaFrecuencia.save();
    res.status(201).json(guardado);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Editar frecuencia (requiere token)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const actualizada = await FrecuenciaGrupo.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(actualizada);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Eliminar frecuencia (requiere token)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await FrecuenciaGrupo.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
