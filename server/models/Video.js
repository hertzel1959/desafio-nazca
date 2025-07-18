// models/Video.js - Versión que maneja acentos
const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    description: {
        type: String,
        default: '',
        maxlength: 1000
    },
    category: {
        type: String,
        required: true,
        enum: [
            'evento', 
            'entrenamiento', 
            'documental', 
            'entrevista', 
            'preparación',        // ← CON tilde
            'preparacion',        // ← SIN tilde  
            'competencia',        
            'aventura',           
            'educativo',          
            'promocional',
            'capacitación',       // ← Otras variantes útiles
            'capacitacion',
            'demostración',
            'demostracion',
            'instrucción',
            'instruccion',
            'otro'
        ]
    },
    status: {
        type: String,
        enum: ['draft', 'published'],
        default: 'draft'
    },
    featured: {
        type: Boolean,
        default: false
    },
    duration: {
        type: String,
        default: '0:00'
    },
    views: {
        type: Number,
        default: 0
    },
    filename: {
        type: String,
        default: null
    },
    url: {
        type: String,
        default: null
    },
    size: {
        type: Number,
        default: 0
    },
    tags: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

// Índices para mejorar rendimiento
videoSchema.index({ status: 1 });
videoSchema.index({ featured: 1 });
videoSchema.index({ category: 1 });
videoSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Video', videoSchema);