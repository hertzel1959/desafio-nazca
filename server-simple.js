// server-simple.js
// Servidor simple y limpio para desafio-nazca

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3001;

// 🔗 CAMBIAR POR TU STRING REAL - CONECTAR A BASE DE DATOS 'test'
const MONGODB_URI = 'mongodb+srv://mmolina:y7PvbObCzvpcqSwM@desafio-nazca.08bcyv0.mongodb.net/?retryWrites=true&w=majority&appName=desafio-nazca'
//'mongodb+srv://mmolina:TU_PASSWORD@desafio-nazca.xxxxx.mongodb.net/test?retryWrites=true&w=majority';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Servir archivos estáticos desde carpeta 'public'

// ==============================
// DEBUG ROUTE
// ==============================
app.get('/api/debug', async (req, res) => {
    try {
        console.log('=== DEBUG INFO ===');
        
        const db = mongoose.connection.db;
        const collection = db.collection('frecuencias');
        const total = await collection.countDocuments();
        
        console.log('Base de datos:', mongoose.connection.name);
        console.log('Total frecuencias:', total);
        
        if (total > 0) {
            const samples = await collection.find().limit(3).toArray();
            console.log('Muestras:');
            samples.forEach((doc, i) => {
                console.log(`  ${i + 1}: ID=${doc.id}, Grupo="${doc.grupo}"`);
            });
        }
        
        const result = {
            database: mongoose.connection.name,
            collection: 'frecuencias',
            total: total,
            connected: mongoose.connection.readyState === 1,
            samples: total > 0 ? await collection.find().limit(3).toArray() : []
        };
        
        res.json(result);
        
    } catch (error) {
        console.error('Error debug:', error);
        res.status(500).json({ error: error.message });
    }
});

// ==============================
// FRECUENCIAS API
// ==============================
app.get('/api/frecuencias', async (req, res) => {
    try {
        console.log('GET /api/frecuencias');
        
        const db = mongoose.connection.db;
        const collection = db.collection('frecuencias');
        const frecuencias = await collection.find().sort({ id: 1 }).toArray();
        
        console.log(`Encontradas ${frecuencias.length} frecuencias`);
        res.json(frecuencias);
        
    } catch (error) {
        console.error('Error GET frecuencias:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.get('/api/frecuencias/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const db = mongoose.connection.db;
        const frecuencia = await db.collection('frecuencias').findOne({ id: id });
        
        if (!frecuencia) {
            return res.status(404).json({ error: 'Frecuencia no encontrada' });
        }
        
        res.json(frecuencia);
        
    } catch (error) {
        console.error('Error GET frecuencia by ID:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.post('/api/frecuencias', async (req, res) => {
    try {
        const data = req.body;
        
        if (!data.grupo || !data.frecuencia) {
            return res.status(400).json({ error: 'Grupo y frecuencia requeridos' });
        }
        
        const db = mongoose.connection.db;
        const collection = db.collection('frecuencias');
        
        // Obtener siguiente ID
        const lastDoc = await collection.findOne({}, { sort: { id: -1 } });
        const newId = lastDoc ? lastDoc.id + 1 : 1;
        
        const newFrecuencia = {
            id: newId,
            grupo: data.grupo.trim(),
            frecuencia: parseFloat(data.frecuencia),
            email: data.email || '',
            contacto: data.contacto || '',
            telefono: data.telefono || '',
            activo: true,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        
        await collection.insertOne(newFrecuencia);
        
        console.log(`Nueva frecuencia creada: ID ${newId}`);
        res.status(201).json({ 
            message: 'Frecuencia creada',
            frecuencia: newFrecuencia 
        });
        
    } catch (error) {
        console.error('Error POST frecuencia:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.put('/api/frecuencias/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const data = req.body;
        
        if (!data.grupo || !data.frecuencia) {
            return res.status(400).json({ error: 'Grupo y frecuencia requeridos' });
        }
        
        const db = mongoose.connection.db;
        const collection = db.collection('frecuencias');
        
        const updateData = {
            grupo: data.grupo.trim(),
            frecuencia: parseFloat(data.frecuencia),
            email: data.email || '',
            contacto: data.contacto || '',
            telefono: data.telefono || '',
            updatedAt: new Date()
        };
        
        const result = await collection.updateOne(
            { id: id },
            { $set: updateData }
        );
        
        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Frecuencia no encontrada' });
        }
        
        const updated = await collection.findOne({ id: id });
        
        console.log(`Frecuencia actualizada: ID ${id}`);
        res.json({ 
            message: 'Frecuencia actualizada',
            frecuencia: updated 
        });
        
    } catch (error) {
        console.error('Error PUT frecuencia:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.delete('/api/frecuencias/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const db = mongoose.connection.db;
        const collection = db.collection('frecuencias');
        
        const result = await collection.updateOne(
            { id: id },
            { 
                $set: { 
                    activo: false,
                    updatedAt: new Date()
                }
            }
        );
        
        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Frecuencia no encontrada' });
        }
        
        console.log(`Frecuencia eliminada: ID ${id}`);
        res.json({ message: 'Frecuencia eliminada' });
        
    } catch (error) {
        console.error('Error DELETE frecuencia:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ==============================
// OTHER ROUTES
// ==============================
app.get('/api/inscripciones', (req, res) => {
    res.json([]);
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/admin.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html')); // Servir admin como página principal
});

// ==============================
// SERVER START
// ==============================
async function startServer() {
    try {
        console.log('🚀 Iniciando servidor...');
        
        if (MONGODB_URI.includes('TU_PASSWORD')) {
            console.error('❌ Cambiar TU_PASSWORD por tu contraseña real');
            process.exit(1);
        }
        
        console.log('📡 Conectando a MongoDB Atlas...');
        await mongoose.connect(MONGODB_URI);
        
        console.log('✅ Conectado a:', mongoose.connection.name);
        
        app.listen(PORT, () => {
            console.log(`\n🌐 Servidor: http://localhost:${PORT}`);
            console.log(`🔧 Admin: http://localhost:${PORT}/admin`);
            console.log(`🔍 Debug: http://localhost:${PORT}/api/debug`);
            console.log(`📻 API: http://localhost:${PORT}/api/frecuencias`);
        });
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

process.on('SIGINT', async () => {
    console.log('\n🔌 Cerrando...');
    await mongoose.disconnect();
    process.exit(0);
});

startServer();