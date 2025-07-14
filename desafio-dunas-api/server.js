// server.js
// Servidor backend con CRUD completo para frecuencias

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 🔗 REEMPLAZA CON TU STRING DE CONEXIÓN REAL
const MONGODB_URI = 'mongodb+srv://mmolina:y7PvbObCzvpcqSwM@desafio-nazca.08bcyv0.mongodb.net/?retryWrites=true&w=majority&appName=desafio-nazca'


// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Esquema de Frecuencia (mismo que usaste para la carga)
const frecuenciaSchema = new mongoose.Schema({
    id: {
        type: Number,
        unique: true,
        required: true
    },
    grupo: {
        type: String,
        required: true,
        trim: true
    },
    frecuencia: {
        type: Number,
        required: true
    },
    email: {
        type: String,
        trim: true
    },
    contacto: {
        type: String,
        trim: true
    },
    telefono: {
        type: String,
        trim: true
    },
    activo: {
        type: Boolean,
        default: true
    }
}, { 
    timestamps: true 
});

const Frecuencia = mongoose.model('Frecuencia', frecuenciaSchema);

// Esquema para contador de IDs
const counterSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    sequence_value: { type: Number, default: 0 }
});

const Counter = mongoose.model('Counter', counterSchema);

// Función para obtener siguiente ID
async function getNextSequenceValue() {
    const counter = await Counter.findByIdAndUpdate(
        'frecuencia_id',
        { $inc: { sequence_value: 1 } },
        { new: true, upsert: true }
    );
    return counter.sequence_value;
}

// ==============================
// RUTAS DEL CRUD DE FRECUENCIAS
// ==============================

// 📻 GET /api/frecuencias - Obtener todas las frecuencias
app.get('/api/frecuencias', async (req, res) => {
    try {
        const frecuencias = await Frecuencia.find({ activo: true })
            .sort({ id: 1 });
        
        res.json(frecuencias);
    } catch (error) {
        console.error('Error obteniendo frecuencias:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// 📻 GET /api/frecuencias/:id - Obtener una frecuencia específica
app.get('/api/frecuencias/:id', async (req, res) => {
    try {
        const frecuencia = await Frecuencia.findOne({ 
            id: parseInt(req.params.id),
            activo: true 
        });
        
        if (!frecuencia) {
            return res.status(404).json({ error: 'Frecuencia no encontrada' });
        }
        
        res.json(frecuencia);
    } catch (error) {
        console.error('Error obteniendo frecuencia:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// 📻 POST /api/frecuencias - Crear nueva frecuencia
app.post('/api/frecuencias', async (req, res) => {
    try {
        const { grupo, frecuencia, email, contacto, telefono } = req.body;
        
        // Validaciones
        if (!grupo || !frecuencia) {
            return res.status(400).json({ 
                error: 'Grupo y frecuencia son campos requeridos' 
            });
        }
        
        // Obtener siguiente ID
        const nuevoId = await getNextSequenceValue();
        
        // Crear nueva frecuencia
        const nuevaFrecuencia = new Frecuencia({
            id: nuevoId,
            grupo: grupo.trim(),
            frecuencia: parseFloat(frecuencia),
            email: email?.trim() || '',
            contacto: contacto?.trim() || '',
            telefono: telefono?.trim() || ''
        });
        
        const frecuenciaGuardada = await nuevaFrecuencia.save();
        
        res.status(201).json({
            message: 'Frecuencia creada exitosamente',
            frecuencia: frecuenciaGuardada
        });
        
    } catch (error) {
        console.error('Error creando frecuencia:', error);
        
        if (error.code === 11000) {
            return res.status(400).json({ 
                error: 'Ya existe una frecuencia con esos datos' 
            });
        }
        
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// 📻 PUT /api/frecuencias/:id - Actualizar frecuencia
app.put('/api/frecuencias/:id', async (req, res) => {
    try {
        const idFrecuencia = parseInt(req.params.id);
        const { grupo, frecuencia, email, contacto, telefono } = req.body;
        
        // Validaciones
        if (!grupo || !frecuencia) {
            return res.status(400).json({ 
                error: 'Grupo y frecuencia son campos requeridos' 
            });
        }
        
        const frecuenciaActualizada = await Frecuencia.findOneAndUpdate(
            { id: idFrecuencia, activo: true },
            {
                grupo: grupo.trim(),
                frecuencia: parseFloat(frecuencia),
                email: email?.trim() || '',
                contacto: contacto?.trim() || '',
                telefono: telefono?.trim() || '',
                updatedAt: new Date()
            },
            { new: true, runValidators: true }
        );
        
        if (!frecuenciaActualizada) {
            return res.status(404).json({ error: 'Frecuencia no encontrada' });
        }
        
        res.json({
            message: 'Frecuencia actualizada exitosamente',
            frecuencia: frecuenciaActualizada
        });
        
    } catch (error) {
        console.error('Error actualizando frecuencia:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// 📻 DELETE /api/frecuencias/:id - Eliminar frecuencia (soft delete)
app.delete('/api/frecuencias/:id', async (req, res) => {
    try {
        const idFrecuencia = parseInt(req.params.id);
        
        const frecuenciaEliminada = await Frecuencia.findOneAndUpdate(
            { id: idFrecuencia, activo: true },
            { 
                activo: false,
                updatedAt: new Date()
            },
            { new: true }
        );
        
        if (!frecuenciaEliminada) {
            return res.status(404).json({ error: 'Frecuencia no encontrada' });
        }
        
        res.json({
            message: 'Frecuencia eliminada exitosamente',
            frecuencia: frecuenciaEliminada
        });
        
    } catch (error) {
        console.error('Error eliminando frecuencia:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// 📻 DELETE /api/frecuencias/:id/hard - Eliminar frecuencia permanentemente
app.delete('/api/frecuencias/:id/hard', async (req, res) => {
    try {
        const idFrecuencia = parseInt(req.params.id);
        
        const frecuenciaEliminada = await Frecuencia.findOneAndDelete({
            id: idFrecuencia
        });
        
        if (!frecuenciaEliminada) {
            return res.status(404).json({ error: 'Frecuencia no encontrada' });
        }
        
        res.json({
            message: 'Frecuencia eliminada permanentemente'
        });
        
    } catch (error) {
        console.error('Error eliminando frecuencia permanentemente:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// 📻 GET /api/frecuencias/buscar/:termino - Buscar frecuencias
app.get('/api/frecuencias/buscar/:termino', async (req, res) => {
    try {
        const termino = req.params.termino;
        
        const frecuencias = await Frecuencia.find({
            activo: true,
            $or: [
                { grupo: { $regex: termino, $options: 'i' } },
                { contacto: { $regex: termino, $options: 'i' } },
                { email: { $regex: termino, $options: 'i' } }
            ]
        }).sort({ id: 1 });
        
        res.json(frecuencias);
        
    } catch (error) {
        console.error('Error buscando frecuencias:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// 📻 GET /api/frecuencias/rango/:min/:max - Buscar por rango de frecuencia
app.get('/api/frecuencias/rango/:min/:max', async (req, res) => {
    try {
        const min = parseFloat(req.params.min);
        const max = parseFloat(req.params.max);
        
        const frecuencias = await Frecuencia.find({
            activo: true,
            frecuencia: { $gte: min, $lte: max }
        }).sort({ frecuencia: 1 });
        
        res.json(frecuencias);
        
    } catch (error) {
        console.error('Error buscando por rango:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// 📻 GET /api/frecuencias/estadisticas - Obtener estadísticas
app.get('/api/frecuencias/estadisticas', async (req, res) => {
    try {
        const total = await Frecuencia.countDocuments({ activo: true });
        const conEmail = await Frecuencia.countDocuments({ 
            activo: true, 
            email: { $ne: '', $exists: true } 
        });
        const conContacto = await Frecuencia.countDocuments({ 
            activo: true, 
            contacto: { $ne: '', $exists: true } 
        });
        
        // Frecuencias duplicadas
        const duplicadas = await Frecuencia.aggregate([
            { $match: { activo: true } },
            { $group: { _id: "$frecuencia", count: { $sum: 1 } } },
            { $match: { count: { $gt: 1 } } }
        ]);
        
        // Rangos de frecuencia
        const rangos = await Frecuencia.aggregate([
            { $match: { activo: true } },
            {
                $group: {
                    _id: {
                        $switch: {
                            branches: [
                                { case: { $and: [{ $gte: ["$frecuencia", 144] }, { $lt: ["$frecuencia", 145] }] }, then: "144-145 MHz" },
                                { case: { $and: [{ $gte: ["$frecuencia", 145] }, { $lt: ["$frecuencia", 146] }] }, then: "145-146 MHz" },
                                { case: { $and: [{ $gte: ["$frecuencia", 146] }, { $lt: ["$frecuencia", 147] }] }, then: "146-147 MHz" },
                                { case: { $and: [{ $gte: ["$frecuencia", 147] }, { $lt: ["$frecuencia", 148] }] }, then: "147-148 MHz" },
                                { case: { $gte: ["$frecuencia", 148] }, then: "148+ MHz" }
                            ],
                            default: "Otros"
                        }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);
        
        res.json({
            total,
            conEmail,
            conContacto,
            frecuenciasDuplicadas: duplicadas.length,
            distribucionPorRangos: rangos
        });
        
    } catch (error) {
        console.error('Error obteniendo estadísticas:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ==============================
// RUTAS PARA INSCRIPCIONES (SIMULADAS)
// ==============================

app.get('/api/inscripciones', (req, res) => {
    // Datos simulados para el dashboard
    const inscripcionesSimuladas = [
        {
            _id: '1',
            createdAt: new Date(),
            nombres: 'Juan Carlos',
            apellidos: 'Pérez García',
            email: 'juan@example.com',
            nombreGrupo: 'Aventureros 4x4',
            tipoInscripcion: 'PILOTO'
        },
        {
            _id: '2',
            createdAt: new Date(Date.now() - 86400000),
            nombres: 'María Elena',
            apellidos: 'Rodríguez López',
            email: 'maria@example.com',
            nombreGrupo: 'Desert Warriors',
            tipoInscripcion: 'COPILOTO'
        }
    ];
    
    res.json(inscripcionesSimuladas);
});

// ==============================
// RUTAS ESTÁTICAS
// ==============================

// Servir admin.html
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// Ruta principal
app.get('/', (req, res) => {
    res.json({
        message: 'API Desafío Dunas de Nazca',
        version: '1.0.0',
        endpoints: {
            frecuencias: '/api/frecuencias',
            admin: '/admin'
        }
    });
});

// ==============================
// MANEJO DE ERRORES
// ==============================

// Error 404
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

// Error handler global
app.use((error, req, res, next) => {
    console.error('Error no manejado:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
});

// ==============================
// INICIALIZACIÓN DEL SERVIDOR
// ==============================

async function startServer() {
    try {
        console.log('🚀 Iniciando servidor...\n');
        
        // Conectar a MongoDB
        console.log('📡 Conectando a MongoDB Atlas...');
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Conectado a MongoDB Atlas');
        
        // Verificar datos existentes
        const totalFrecuencias = await Frecuencia.countDocuments({ activo: true });
        console.log(`📊 Frecuencias en BD: ${totalFrecuencias}`);
        
        // Iniciar servidor
        app.listen(PORT, () => {
            console.log(`\n🌐 Servidor corriendo en http://localhost:${PORT}`);
            console.log(`🔧 Admin Panel: http://localhost:${PORT}/admin`);
            console.log(`📻 API Frecuencias: http://localhost:${PORT}/api/frecuencias`);
            console.log('\n📋 Endpoints disponibles:');
            console.log('  GET    /api/frecuencias           - Listar todas');
            console.log('  GET    /api/frecuencias/:id       - Obtener una');
            console.log('  POST   /api/frecuencias           - Crear nueva');
            console.log('  PUT    /api/frecuencias/:id       - Actualizar');
            console.log('  DELETE /api/frecuencias/:id       - Eliminar (soft)');
            console.log('  GET    /api/frecuencias/buscar/:termino - Buscar');
            console.log('  GET    /api/frecuencias/estadisticas    - Estadísticas');
            console.log('\n✅ Servidor listo para recibir peticiones');
        });
        
    } catch (error) {
        console.error('❌ Error iniciando servidor:', error.message);
        
        if (error.message.includes('authentication')) {
            console.log('💡 Verifica usuario y contraseña en MONGODB_URI');
        } else if (error.message.includes('ENOTFOUND')) {
            console.log('💡 Verifica la URL de conexión a Atlas');
        }
        
        process.exit(1);
    }
}

// Manejo de cierre del servidor
process.on('SIGINT', async () => {
    console.log('\n🔌 Cerrando conexiones...');
    await mongoose.disconnect();
    console.log('✅ Servidor cerrado correctamente');
    process.exit(0);
});

// Iniciar servidor
startServer();

module.exports = app;