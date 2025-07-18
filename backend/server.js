// server.js - Sistema completo para Desafío Dunas de Nazca
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));


// Esquema de Frecuencias (tabla principal)
const frequencySchema = new mongoose.Schema({
    numero: { type: Number, required: true, unique: true },
    grupo: { type: String, required: true },
    frecuencias: { type: Number, required: true },
    contacto: { type: String, default: '' },
    email: { type: String, default: '' },
    telefono: { type: String, default: '' },
    activo: { type: Boolean, default: true },
    fechaCreacion: { type: Date, default: Date.now },
    fechaActualizacion: { type: Date, default: Date.now }
});

const Frequency = mongoose.model('Frequency', frequencySchema);

// Esquema de Participantes (actualizado)
const participantSchema = new mongoose.Schema({
    // Identificación del participante
    quienSeInscribe: {
        type: String,
        required: true,
        enum: ['PILOTO', 'COPILOTO', 'ACOMPAÑANTE1', 'ACOMPAÑANTE2', 'ACOMPAÑANTE3']
    },
    grupoId: { type: Number, required: true },
    grupoNombre: { type: String, required: true },
    grupoContacto: { type: String, required: true },
    grupoFrecuencia: { type: Number, required: true },
    
    // Datos personales
    nombres: { type: String, required: true },
    apellidos: { type: String, required: true },
    edad: { type: Number, required: true, min: 18, max: 80 },
    experiencia: {
        type: String,
        required: true,
        enum: ['PRINCIPIANTE', 'INTERMEDIO', 'EXPERTO']
    },
    grupoSanguineo: {
        type: String,
        required: true,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    },
    dni: { 
        type: String, 
        required: true, 
        unique: true,
        validate: {
            validator: function(v) {
                return /^\d{8}$/.test(v);
            },
            message: 'DNI debe tener 8 dígitos'
        }
    },
    
    // Contacto
    email: { 
        type: String, 
        required: true,
        validate: {
            validator: function(v) {
                return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
            },
            message: 'Email inválido'
        }
    },
    celular: { type: String, required: true },
    personaContacto: { type: String, required: true },
    celularContacto: { type: String, required: true },
    
    // Vehículo
    tipoVehiculo: {
        type: String,
        required: true,
        enum: ['CUATRIMOTO', 'UTV', 'ARENERO', 'CAMIONETA']
    },
    marca: { type: String, required: true },
    modelo: { type: String, required: true },
    año: { type: Number, required: true, min: 1990, max: 2025 },
    
    // Evento
    diaLlegada: {
        type: String,
        required: true,
        enum: ['MIERCOLES','JUEVES', 'VIERNES', 'SABADO']
    },
    
    // Metadata
    fechaRegistro: { type: Date, default: Date.now },
    estado: { 
        type: String, 
        enum: ['pendiente', 'aprobado', 'rechazado'], 
        default: 'pendiente' 
    },
    observaciones: { type: String, default: '' }
});

const Participant = mongoose.model('Participant', participantSchema);

// Datos reales de frecuencias del Excel
const frequenciesData = [
    { numero: 1, grupo: "Viciosos 4x4", frecuencias: 144.45, contacto: "", email: "", telefono: "" },
    { numero: 2, grupo: "Desert 4x4 Offroad", frecuencias: 144.5, contacto: "", email: "deser4x4offroad@gmail.com", telefono: "" },
    { numero: 3, grupo: "BELICOS off Road Chimbote", frecuencias: 145.05, contacto: "Martin Flores", email: "", telefono: "966796366" },
    { numero: 4, grupo: "Wolfpack", frecuencias: 146.75, contacto: "", email: "luiggiads13@gmail.com", telefono: "" },
    { numero: 5, grupo: "RAZA 4X4 - HUANCAYO", frecuencias: 147.25, contacto: "Alfonso Hernandez", email: "", telefono: "990600409" },
    { numero: 6, grupo: "Somos Poderosos", frecuencias: 147.5, contacto: "Juan José Boza", email: "jjboza.quatri@gmail.com", telefono: "996686191" },
    { numero: 7, grupo: "INKA CAR", frecuencias: 147.99, contacto: "Se ira migrando de a pocos", email: "", telefono: "" },
    { numero: 8, grupo: "Chancheros 4x4", frecuencias: 148, contacto: "Italo Lezcano", email: "angelveldy@gmail.com", telefono: "994011186" },
    { numero: 9, grupo: "Xtreme Makari", frecuencias: 148, contacto: "Luis Díaz", email: "kaidiaz2009@gmail.com", telefono: "997365305" },
    { numero: 10, grupo: "Doble Tracción", frecuencias: 148.02, contacto: "Ciro Zúñiga", email: "ciro@dobletraccion.pe", telefono: "949713700" },
    { numero: 11, grupo: "Cheleros Off Road", frecuencias: 148.05, contacto: "Toño Celis", email: "", telefono: "" },
    { numero: 12, grupo: "Muy Muy", frecuencias: 148.08, contacto: "Beto Morales", email: "betomorales@gmail.com", telefono: "977531934" },
    { numero: 13, grupo: "FJ Cruiser", frecuencias: 148.09, contacto: "Ivan Takahashi", email: "ivantakahashi@gmail.com", telefono: "989591832" },
    { numero: 14, grupo: "Lima Off Road", frecuencias: 148.2, contacto: "José Bazán", email: "josebazant@hotmail.com", telefono: "981224640" },
    { numero: 15, grupo: "Intrépidos 4x4", frecuencias: 148.25, contacto: "Jorge Ojeda", email: "contacto@intrepidos4x4.pe", telefono: "998671071" },
    { numero: 16, grupo: "Alacranes 4x4", frecuencias: 148.28, contacto: "Ricardo Rebaza", email: "rrebazab@gmail.com", telefono: "941965570" },
    { numero: 17, grupo: "Subaru Forester Perú", frecuencias: 148.35, contacto: "Dante Vasquez", email: "dante.vasquez@siemens.com", telefono: "997588577" },
    { numero: 18, grupo: "Vuelteros 4x4", frecuencias: 148.42, contacto: "Audrey Balarín", email: "audrey.balarin@gmail.com", telefono: "958888298" },
    { numero: 19, grupo: "Los Mejores 40", frecuencias: 148.44, contacto: "", email: "", telefono: "" },
    { numero: 20, grupo: "Mickey Thompson", frecuencias: 148.5, contacto: "Diego Navea", email: "gerencia@mtperu.net", telefono: "998114074" },
    { numero: 21, grupo: "INKA CAR", frecuencias: 148.53, contacto: "Valentina", email: "", telefono: "" },
    { numero: 22, grupo: "Dunitas", frecuencias: 148.58, contacto: "", email: "", telefono: "" },
    { numero: 23, grupo: "Lobos de Arena", frecuencias: 148.65, contacto: "Peter Pacheco", email: "alexpach@hotmail.com", telefono: "967248653" },
    { numero: 24, grupo: "Decadentes Moto/Quad/UTV", frecuencias: 148.68, contacto: "", email: "", telefono: "" },
    { numero: 25, grupo: "Club Vehículos Todo Terreno", frecuencias: 148.74, contacto: "Jaime Alvariño Garland", email: "jalvarino@sectech.pe", telefono: "990765597" },
    { numero: 26, grupo: "Torque 4x4", frecuencias: 148.78, contacto: "Helmo Rodas", email: "helmo4@hotmail.com", telefono: "987205927" },
    { numero: 27, grupo: "Cazadunas", frecuencias: 148.88, contacto: "Fico Salmón", email: "ficosalm@hotmail.com", telefono: "999448838" },
    { numero: 28, grupo: "Sonaja 4x4", frecuencias: 148.89, contacto: "Fabián Portal", email: "fportalb@gmail.com", telefono: "948312037" },
    { numero: 29, grupo: "Vagabundo 4x4", frecuencias: 149, contacto: "Ruben Araki", email: "rubenaraki@outlook.com", telefono: "946354536" },
    { numero: 30, grupo: "Al Corte 4x4 Off Road", frecuencias: 149.03, contacto: "Francisco León Cachay", email: "alcorte4x4offroad@gmail.com", telefono: "952070787" },
    { numero: 31, grupo: "Traccion 4x4 Perú", frecuencias: 149.09, contacto: "Juan Carlos Cáceres", email: "info@traccion4x4peru.com", telefono: "" },
    { numero: 32, grupo: "Ruteros Perú - Club Duster", frecuencias: 149.3, contacto: "Sergio Samaniego", email: "ssamaniego@cdpracingteam.com", telefono: "979758826" },
    { numero: 33, grupo: "DEMENTES OFF ROAD", frecuencias: 149.65, contacto: "PERCY PINTO LUSTIG", email: "ppinto03@gmail.com", telefono: "923741558" },
    { numero: 34, grupo: "Team Rhino 4x4 Peru", frecuencias: 149.66, contacto: "Ricardo Campos Cueto", email: "", telefono: "982509639" },
    { numero: 35, grupo: "OVERLAND FREEDOM PERÚ", frecuencias: 149.7, contacto: "Gustavo Zamora", email: "", telefono: "948478817" },
    { numero: 36, grupo: "Dingo Off Road", frecuencias: 149.8, contacto: "Johan Moran", email: "", telefono: "998302101" },
    { numero: 37, grupo: "FOX 4X4 PERU", frecuencias: 149.82, contacto: "Alex Garcia", email: "alex.garcia.caceres@gmail.com", telefono: "951520762" },
    { numero: 38, grupo: "Suzuki 4x4 Perú", frecuencias: 149.85, contacto: "Manuel Llaguno", email: "suzuki4x4peru@gmail.com", telefono: "998877814" },
    { numero: 39, grupo: "CLUB JIMNY PERU", frecuencias: 149.99, contacto: "Orlando Alayo / Marco Soto", email: "", telefono: "998106811 / 936939826" },
    { numero: 40, grupo: "Pakatnamu Off Road", frecuencias: 150.02, contacto: "Raúl Razuri", email: "nickygristperu@hotmail.com", telefono: "917194213" },
    { numero: 41, grupo: "Tubulares Perú", frecuencias: 150.05, contacto: "", email: "", telefono: "" },
    { numero: 42, grupo: "Hijos de Ruta", frecuencias: 150.08, contacto: "Carlos Gallardo", email: "hijosderutaoffroadperu@gmail.com", telefono: "950411693" },
    { numero: 43, grupo: "PERU EXPEDITION 4X4", frecuencias: 150.14, contacto: "", email: "", telefono: "" },
    { numero: 44, grupo: "NOMADA CAMP", frecuencias: 150.2, contacto: "Marion Sart", email: "nomadacamp.explore@gmail.com", telefono: "994737089" },
    { numero: 45, grupo: "Lk Adventure", frecuencias: 150.5, contacto: "Alonso Velasquez", email: "avelasquez@lkautomotriz.com", telefono: "" },
    { numero: 46, grupo: "Team Racer 4x4", frecuencias: 150.55, contacto: "Ricardo Mendiola", email: "", telefono: "" },
    { numero: 47, grupo: "PERU NIKKEI", frecuencias: 151.65, contacto: "Angel Gonzales / Henry Chahuaylla", email: "offroadperunikkei@gmail.com", telefono: "992858654 / 997643269" },
    { numero: 48, grupo: "SinRuta (Trujillo)", frecuencias: 152.02, contacto: "", email: "", telefono: "" },
    { numero: 49, grupo: "Fugitivos", frecuencias: 157.55, contacto: "", email: "", telefono: "" }
];

// Función para inicializar datos de frecuencias
async function initializeFrequencies() {
    const count = await Frequency.countDocuments();
    if (count === 0) {
        await Frequency.insertMany(frequenciesData);
        console.log('✅ Tabla de frecuencias inicializada con 49 grupos');
    }
}

// RUTAS DE LA API - FRECUENCIAS

// Obtener todas las frecuencias
app.get('/api/frequencies', async (req, res) => {
    try {
        const frequencies = await Frequency.find({ activo: true }).sort({ numero: 1 });
        res.json(frequencies);
    } catch (error) {
        console.error('Error obteniendo frecuencias:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Obtener frecuencia por ID
app.get('/api/frequencies/:id', async (req, res) => {
    try {
        const frequency = await Frequency.findOne({ numero: req.params.id });
        if (!frequency) {
            return res.status(404).json({ error: 'Grupo no encontrado' });
        }
        res.json(frequency);
    } catch (error) {
        console.error('Error obteniendo frecuencia:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Crear nueva frecuencia
app.post('/api/frequencies', async (req, res) => {
    try {
        const frequency = new Frequency(req.body);
        await frequency.save();
        res.status(201).json({
            message: 'Grupo creado exitosamente',
            frequency
        });
    } catch (error) {
        console.error('Error creando frecuencia:', error);
        if (error.code === 11000) {
            return res.status(400).json({ error: 'El número de grupo ya existe' });
        }
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});


// Actualizar frecuencia
app.put('/api/frequencies/:id', async (req, res) => {
    try {
        const frequency = await Frequency.findOneAndUpdate(
            { numero: req.params.id },
            { ...req.body, fechaActualizacion: new Date() },
            { new: true }
        );
        if (!frequency) {
            return res.status(404).json({ error: 'Grupo no encontrado' });
        }
        res.json({
            message: 'Grupo actualizado exitosamente',
            frequency
        });
    } catch (error) {
        console.error('Error actualizando frecuencia:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Eliminar frecuencia (soft delete)
app.delete('/api/frequencies/:id', async (req, res) => {
    try {
        const frequency = await Frequency.findOneAndUpdate(
            { numero: req.params.id },
            { activo: false, fechaActualizacion: new Date() },
            { new: true }
        );
        if (!frequency) {
            return res.status(404).json({ error: 'Grupo no encontrado' });
        }
        res.json({
            message: 'Grupo desactivado exitosamente',
            frequency
        });
    } catch (error) {
        console.error('Error eliminando frecuencia:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// RUTAS DE LA API - PARTICIPANTES

// Registrar nuevo participante
app.post('/api/participants/register', async (req, res) => {
    try {
        const participantData = req.body;
        
        // Validar que el DNI no esté ya registrado
        const existingDNI = await Participant.findOne({ dni: participantData.dni });
        if (existingDNI) {
            return res.status(400).json({ error: 'Este DNI ya está registrado' });
        }
        
        // Validar que el email no esté ya registrado
        const existingEmail = await Participant.findOne({ email: participantData.email });
        if (existingEmail) {
            return res.status(400).json({ error: 'Este email ya está registrado' });
        }
        
        // Obtener datos del grupo seleccionado
        const grupo = await Frequency.findOne({ numero: participantData.grupoId });
        if (!grupo) {
            return res.status(400).json({ error: 'Grupo seleccionado no válido' });
        }
        
        // Completar datos del grupo
        participantData.grupoNombre = grupo.grupo;
        participantData.grupoContacto = grupo.contacto;
        participantData.grupoFrecuencia = grupo.frecuencias;
        
        // Crear nuevo participante
        const participant = new Participant(participantData);
        await participant.save();
        
        res.status(201).json({
            message: 'Participante registrado exitosamente',
            participantId: participant._id,
            datos: {
                nombres: participant.nombres,
                apellidos: participant.apellidos,
                grupo: participant.grupoNombre,
                dni: participant.dni
            }
        });
        
    } catch (error) {
        console.error('Error registrando participante:', error);
        
        if (error.code === 11000) {
            return res.status(400).json({ error: 'DNI ya registrado en el sistema' });
        }
        
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ error: errors.join(', ') });
        }
        
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Obtener todos los participantes
app.get('/api/participants', async (req, res) => {
    try {
        const participants = await Participant.find()
            .sort({ fechaRegistro: -1 })
            .select('-__v');
        
        res.json({
            total: participants.length,
            participantes: participants
        });
    } catch (error) {
        console.error('Error obteniendo participantes:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Obtener participante por DNI
app.get('/api/participants/dni/:dni', async (req, res) => {
    try {
        const participant = await Participant.findOne({ dni: req.params.dni });
        if (!participant) {
            return res.status(404).json({ error: 'Participante no encontrado' });
        }
        res.json(participant);
    } catch (error) {
        console.error('Error buscando participante:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Actualizar estado de participante
app.patch('/api/participants/:id/status', async (req, res) => {
    try {
        const { estado, observaciones } = req.body;
        
        const participant = await Participant.findByIdAndUpdate(
            req.params.id,
            { estado, observaciones },
            { new: true }
        );
        
        if (!participant) {
            return res.status(404).json({ error: 'Participante no encontrado' });
        }
        
        res.json({
            message: 'Estado actualizado exitosamente',
            participante: participant
        });
    } catch (error) {
        console.error('Error actualizando estado:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Estadísticas del evento
app.get('/api/stats', async (req, res) => {
    try {
        const totalParticipants = await Participant.countDocuments();
        const byRole = await Participant.aggregate([
            { $group: { _id: '$quienSeInscribe', count: { $sum: 1 } } }
        ]);
        const byVehicle = await Participant.aggregate([
            { $group: { _id: '$tipoVehiculo', count: { $sum: 1 } } }
        ]);
        const byExperience = await Participant.aggregate([
            { $group: { _id: '$experiencia', count: { $sum: 1 } } }
        ]);
        const byGroup = await Participant.aggregate([
            { $group: { _id: { grupo: '$grupoNombre', numero: '$grupoId' }, count: { $sum: 1 } } },
            { $sort: { '_id.numero': 1 } }
        ]);
        
        res.json({
            totalParticipantes: totalParticipants,
            porRol: byRole,
            porVehiculo: byVehicle,
            porExperiencia: byExperience,
            porGrupo: byGroup
        });
    } catch (error) {
        console.error('Error obteniendo estadísticas:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Ruta raíz - servir el frontend
app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../public/index.html'));
});

// Panel administrativo
app.get('/admin', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../public/admin.html'));
});


// Ruta de salud de la API
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK',
        mensaje: '🏎️ API Desafío Dunas de Nazca funcionando',
        timestamp: new Date().toISOString(),
        version: '3.0.0',
        totalGrupos: frequenciesData.length
    });
});

// Manejo de errores 404
app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejo de errores generales
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Error interno del servidor' });
});

// Conectar a MongoDB
const MONGODB_URI = process.env.MONGODB_URI;
mongoose.connect(MONGODB_URI)
    .then(async () => {
        console.log('✅ MongoDB conectado exitosamente');
        await initializeFrequencies();
    })
    .catch(err => console.error('❌ Error conectando MongoDB:', err));

// Eventos de conexión MongoDB
mongoose.connection.on('error', (err) => {
    console.error('❌ Error de conexión MongoDB:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('⚠️ MongoDB desconectado');
});

mongoose.connection.on('reconnected', () => {
    console.log('✅ MongoDB reconectado');
});


// Manejo de cierre graceful
process.on('SIGINT', async () => {
    console.log('\n🛑 Cerrando servidor...');
    await mongoose.connection.close();
    console.log('✅ Conexión MongoDB cerrada');
    process.exit(0);
});