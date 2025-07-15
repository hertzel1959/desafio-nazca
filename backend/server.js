// server.js - MongoDB Atlas con los 49 GRUPOS COMPLETOS
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ✅ CORREGIDO: Servir archivos estáticos desde public/
app.use(express.static(path.join(__dirname, '..', 'public')));

// Esquemas MongoDB
const frequencySchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    grupo: { type: String, required: true },
    frecuencia: { type: Number, required: true },
    contacto: { type: String, default: '' },
    email: { type: String, default: '' },
    telefono: { type: String, default: '' },
    activo: { type: Boolean, default: true },
    fechaCreacion: { type: Date, default: Date.now }
});

const inscripcionSchema = new mongoose.Schema({
    NRO: { type: Number, unique: true },
    N_equipo: { type: Number, required: true },
    tripulante: { 
        type: String, 
        required: true,
        enum: ['piloto', 'copiloto', 'acompañante1', 'acompañante2', 'acompañante3']
    },
    nombres: { type: String, required: true },
    apellidos: { type: String, required: true },
    nombreCompleto: { type: String },
    edad: { type: Number, required: true, min: 16, max: 80 },
    experiencia: { 
        type: String, 
        enum: ['Principiante', 'Intermedio', 'Experto'],
        default: 'Intermedio'
    },
    grupoSanguineo: { 
        type: String, 
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
        default: 'O+'
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
    grupo: { type: String, required: true },
    frecuencia: { type: Number },
    liderGrupo: { type: String },
    tipoVehiculo: {
        type: String,
        required: true,
        enum: ['moto', 'cuatrimoto', 'UTV', 'arenero', 'camioneta']
    },
    marca: { type: String, required: true },
    modelo: { type: String, required: true },
    año: { type: Number, required: true, min: 1990, max: 2026 },
    vehiculoCompleto: { type: String },
    diaLlegada: {
        type: String,
        required: true,
        enum: ['miercoles','jueves', 'viernes', 'sabado']
    },
    estado: { 
        type: String, 
        enum: ['PENDIENTE', 'CONFIRMADO', 'CANCELADO'], 
        default: 'PENDIENTE' 
    },
    observaciones: { type: String, default: '' },
    fechaRegistro: { type: Date, default: Date.now }
});

// Auto-generar campos calculados
inscripcionSchema.pre('save', function(next) {
    if (this.nombres && this.apellidos) {
        this.nombreCompleto = `${this.nombres} ${this.apellidos}`;
    }
    if (this.marca && this.modelo && this.año) {
        this.vehiculoCompleto = `${this.marca} ${this.modelo} ${this.año}`;
    }
    next();
});

const codigoSchema = new mongoose.Schema({
    email: { type: String, required: true },
    codigo: { type: String, required: true },
    datosInscripcion: { type: Object, required: true },
    fechaCreacion: { type: Date, default: Date.now, expires: 600 }
});

const Frequency = mongoose.model('Frequency', frequencySchema);
const Inscripcion = mongoose.model('Inscripcion', inscripcionSchema);
const CodigoVerificacion = mongoose.model('CodigoVerificacion', codigoSchema);

// ===============================
// 🏁 LOS 49 GRUPOS COMPLETOS DEL EXCEL
// ===============================

const frequenciesData = [
    { id: 1, grupo: "Viciosos 4x4", frecuencia: 144.45, contacto: "", email: "", telefono: "" },
    { id: 2, grupo: "Desert 4x4 Offroad", frecuencia: 144.5, contacto: "", email: "deser4x4offroad@gmail.com", telefono: "" },
    { id: 3, grupo: "BELICOS off Road Chimbote", frecuencia: 145.05, contacto: "Martin Flores", email: "", telefono: "966796366" },
    { id: 4, grupo: "Wolfpack", frecuencia: 146.75, contacto: "", email: "luiggiads13@gmail.com", telefono: "" },
    { id: 5, grupo: "RAZA 4X4 - HUANCAYO", frecuencia: 147.25, contacto: "Alfonso Hernandez", email: "", telefono: "990600409" },
    { id: 6, grupo: "Somos Poderosos", frecuencia: 147.5, contacto: "Juan José Boza", email: "jjboza.quatri@gmail.com", telefono: "996686191" },
    { id: 7, grupo: "INKA CAR", frecuencia: 147.99, contacto: "Se ira migrando de a pocos", email: "", telefono: "" },
    { id: 8, grupo: "Chancheros 4x4", frecuencia: 148, contacto: "Italo Lezcano", email: "angelveldy@gmail.com", telefono: "994011186" },
    { id: 9, grupo: "Xtreme Makari", frecuencia: 148, contacto: "Luis Díaz", email: "kaidiaz2009@gmail.com", telefono: "997365305" },
    { id: 10, grupo: "Doble Tracción", frecuencia: 148.02, contacto: "Ciro Zúñiga", email: "ciro@dobletraccion.pe", telefono: "949713700" },
    { id: 11, grupo: "Cheleros Off Road", frecuencia: 148.05, contacto: "Toño Celis", email: "", telefono: "" },
    { id: 12, grupo: "Muy Muy", frecuencia: 148.08, contacto: "Beto Morales", email: "betomorales@gmail.com", telefono: "977531934" },
    { id: 13, grupo: "FJ Cruiser", frecuencia: 148.09, contacto: "Ivan Takahashi", email: "ivantakahashi@gmail.com", telefono: "989591832" },
    { id: 14, grupo: "Lima Off Road", frecuencia: 148.2, contacto: "José Bazán", email: "josebazant@hotmail.com", telefono: "981224640" },
    { id: 15, grupo: "Intrépidos 4x4", frecuencia: 148.25, contacto: "Jorge Ojeda", email: "contacto@intrepidos4x4.pe", telefono: "998671071" },
    { id: 16, grupo: "Alacranes 4x4", frecuencia: 148.28, contacto: "Ricardo Rebaza", email: "rrebazab@gmail.com", telefono: "941965570" },
    { id: 17, grupo: "Subaru Forester Perú", frecuencia: 148.35, contacto: "Dante Vasquez", email: "dante.vasquez@siemens.com", telefono: "997588577" },
    { id: 18, grupo: "Vuelteros 4x4", frecuencia: 148.42, contacto: "Audrey Balarín", email: "audrey.balarin@gmail.com", telefono: "958888298" },
    { id: 19, grupo: "Los Mejores 40", frecuencia: 148.44, contacto: "", email: "", telefono: "" },
    { id: 20, grupo: "Mickey Thompson", frecuencia: 148.5, contacto: "Diego Navea", email: "gerencia@mtperu.net", telefono: "998114074" },
    { id: 21, grupo: "INKA CAR 2", frecuencia: 148.53, contacto: "Valentina", email: "", telefono: "" },
    { id: 22, grupo: "Dunitas", frecuencia: 148.58, contacto: "", email: "", telefono: "" },
    { id: 23, grupo: "Lobos de Arena", frecuencia: 148.65, contacto: "Peter Pacheco", email: "alexpach@hotmail.com", telefono: "967248653" },
    { id: 24, grupo: "Decadentes Moto/Quad/UTV", frecuencia: 148.68, contacto: "", email: "", telefono: "" },
    { id: 25, grupo: "Club Vehículos Todo Terreno", frecuencia: 148.74, contacto: "Jaime Alvariño Garland", email: "jalvarino@sectech.pe", telefono: "990765597" },
    { id: 26, grupo: "Torque 4x4", frecuencia: 148.78, contacto: "Helmo Rodas", email: "helmo4@hotmail.com", telefono: "987205927" },
    { id: 27, grupo: "Cazadunas", frecuencia: 148.88, contacto: "Fico Salmón", email: "ficosalm@hotmail.com", telefono: "999448838" },
    { id: 28, grupo: "Sonaja 4x4", frecuencia: 148.89, contacto: "Fabián Portal", email: "fportalb@gmail.com", telefono: "948312037" },
    { id: 29, grupo: "Vagabundo 4x4", frecuencia: 149, contacto: "Ruben Araki", email: "rubenaraki@outlook.com", telefono: "946354536" },
    { id: 30, grupo: "Al Corte 4x4 Off Road", frecuencia: 149.03, contacto: "Francisco León Cachay", email: "alcorte4x4offroad@gmail.com", telefono: "952070787" },
    { id: 31, grupo: "Traccion 4x4 Perú", frecuencia: 149.09, contacto: "Juan Carlos Cáceres", email: "info@traccion4x4peru.com", telefono: "" },
    { id: 32, grupo: "Ruteros Perú - Club Duster", frecuencia: 149.3, contacto: "Sergio Samaniego", email: "ssamaniego@cdpracingteam.com", telefono: "979758826" },
    { id: 33, grupo: "DEMENTES OFF ROAD", frecuencia: 149.65, contacto: "PERCY PINTO LUSTIG", email: "ppinto03@gmail.com", telefono: "923741558" },
    { id: 34, grupo: "Team Rhino 4x4 Peru", frecuencia: 149.66, contacto: "Ricardo Campos Cueto", email: "", telefono: "982509639" },
    { id: 35, grupo: "OVERLAND FREEDOM PERÚ", frecuencia: 149.7, contacto: "Gustavo Zamora", email: "", telefono: "948478817" },
    { id: 36, grupo: "Dingo Off Road", frecuencia: 149.8, contacto: "Johan Moran", email: "", telefono: "998302101" },
    { id: 37, grupo: "FOX 4X4 PERU", frecuencia: 149.82, contacto: "Alex Garcia", email: "alex.garcia.caceres@gmail.com", telefono: "951520762" },
    { id: 38, grupo: "Suzuki 4x4 Perú", frecuencia: 149.85, contacto: "Manuel Llaguno", email: "suzuki4x4peru@gmail.com", telefono: "998877814" },
    { id: 39, grupo: "CLUB JIMNY PERU", frecuencia: 149.99, contacto: "Orlando Alayo / Marco Soto", email: "", telefono: "998106811 / 936939826" },
    { id: 40, grupo: "Pakatnamu Off Road", frecuencia: 150.02, contacto: "Raúl Razuri", email: "nickygristperu@hotmail.com", telefono: "917194213" },
    { id: 41, grupo: "Tubulares Perú", frecuencia: 150.05, contacto: "", email: "", telefono: "" },
    { id: 42, grupo: "Hijos de Ruta", frecuencia: 150.08, contacto: "Carlos Gallardo", email: "hijosderutaoffroadperu@gmail.com", telefono: "950411693" },
    { id: 43, grupo: "PERU EXPEDITION 4X4", frecuencia: 150.14, contacto: "", email: "", telefono: "" },
    { id: 44, grupo: "NOMADA CAMP", frecuencia: 150.2, contacto: "Marion Sart", email: "nomadacamp.explore@gmail.com", telefono: "994737089" },
    { id: 45, grupo: "Lk Adventure", frecuencia: 150.5, contacto: "Alonso Velasquez", email: "avelasquez@lkautomotriz.com", telefono: "" },
    { id: 46, grupo: "Team Racer 4x4", frecuencia: 150.55, contacto: "Ricardo Mendiola", email: "", telefono: "" },
    { id: 47, grupo: "PERU NIKKEI", frecuencia: 151.65, contacto: "Angel Gonzales / Henry Chahuaylla", email: "offroadperunikkei@gmail.com", telefono: "992858654 / 997643269" },
    { id: 48, grupo: "SinRuta (Trujillo)", frecuencia: 152.02, contacto: "", email: "", telefono: "" },
    { id: 49, grupo: "Fugitivos", frecuencia: 157.55, contacto: "", email: "", telefono: "" }
];

// Función para inicializar frecuencias
async function initializeFrequencies() {
    try {
        const count = await Frequency.countDocuments();
        if (count === 0) {
            await Frequency.insertMany(frequenciesData);
            console.log('✅ Los 49 grupos inicializados exitosamente');
        } else {
            console.log('✅ Frecuencias ya inicializadas:', count, 'grupos');
        }
    } catch (error) {
        console.error('❌ Error inicializando frecuencias:', error);
    }
}

// ===============================
// RUTAS API - FRECUENCIAS
// ===============================

app.get('/api/frecuencias', async (req, res) => {
    try {
        const frequencies = await Frequency.find({ activo: true }).sort({ id: 1 });
        res.json(frequencies);
    } catch (error) {
        console.error('Error obteniendo frecuencias:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.get('/api/frecuencias/:id', async (req, res) => {
    try {
        const frequency = await Frequency.findOne({ id: req.params.id });
        if (!frequency) {
            return res.status(404).json({ error: 'Grupo no encontrado' });
        }
        res.json(frequency);
    } catch (error) {
        console.error('Error obteniendo frecuencia:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.post('/api/frecuencias', async (req, res) => {
    try {
        const maxId = await Frequency.findOne().sort({ id: -1 });
        const newId = maxId ? maxId.id + 1 : 1;
        
        const frequency = new Frequency({
            id: newId,
            ...req.body
        });
        
        await frequency.save();
        res.status(201).json({
            message: 'Grupo creado exitosamente',
            data: frequency
        });
    } catch (error) {
        console.error('Error creando frecuencia:', error);
        if (error.code === 11000) {
            return res.status(400).json({ error: 'El ID del grupo ya existe' });
        }
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.put('/api/frecuencias/:id', async (req, res) => {
    try {
        const frequency = await Frequency.findOneAndUpdate(
            { id: req.params.id },
            req.body,
            { new: true }
        );
        if (!frequency) {
            return res.status(404).json({ error: 'Grupo no encontrado' });
        }
        res.json({
            message: 'Grupo actualizado exitosamente',
            data: frequency
        });
    } catch (error) {
        console.error('Error actualizando frecuencia:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.delete('/api/frecuencias/:id', async (req, res) => {
    try {
        const frequency = await Frequency.findOneAndUpdate(
            { id: req.params.id },
            { activo: false },
            { new: true }
        );
        if (!frequency) {
            return res.status(404).json({ error: 'Grupo no encontrado' });
        }
        res.json({
            message: 'Grupo eliminado exitosamente'
        });
    } catch (error) {
        console.error('Error eliminando frecuencia:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ===============================
// RUTAS API - INSCRIPCIONES
// ===============================

app.post('/api/inscripciones/enviar-codigo', async (req, res) => {
    try {
        const { email, datosInscripcion } = req.body;
        
        // Validar que el email no esté ya registrado
        const existingEmail = await Inscripcion.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ error: 'Este email ya está registrado' });
        }
        
        // Validar que el DNI no esté ya registrado (si se proporciona)
        if (datosInscripcion.dni) {
            const existingDNI = await Inscripcion.findOne({ dni: datosInscripcion.dni });
            if (existingDNI) {
                return res.status(400).json({ error: 'Este DNI ya está registrado' });
            }
        }
        
        // Generar código de 6 dígitos
        const codigo = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Eliminar códigos anteriores para este email
        await CodigoVerificacion.deleteMany({ email });
        
        // Guardar nuevo código
        const codigoVerif = new CodigoVerificacion({
            email,
            codigo,
            datosInscripcion
        });
        await codigoVerif.save();
        
        // TODO: Aquí integrar servicio de email real (SendGrid, Mailgun, etc.)
        console.log(`📧 Código para ${email}: ${codigo}`);
        
        res.json({
            success: true,
            message: 'Código enviado exitosamente',
            debug: {
                codigo: codigo // Solo para desarrollo, quitar en producción
            }
        });
        
    } catch (error) {
        console.error('Error enviando código:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.post('/api/inscripciones/verificar-codigo', async (req, res) => {
    try {
        const { email, codigo } = req.body;
        
        // Buscar código válido
        const verificacion = await CodigoVerificacion.findOne({ email, codigo });
        
        if (!verificacion) {
            return res.status(400).json({ error: 'Código incorrecto o expirado' });
        }
        
        // Obtener datos del grupo seleccionado
        const grupo = await Frequency.findOne({ grupo: verificacion.datosInscripcion.grupo });
        if (!grupo) {
            return res.status(400).json({ error: 'Grupo seleccionado no válido' });
        }
        
        // Generar número de equipo único
        const lastInscripcion = await Inscripcion.findOne().sort({ N_equipo: -1 });
        const N_equipo = lastInscripcion ? lastInscripcion.N_equipo + 1 : 1001;
        
        // Auto-generar NRO
        const lastNRO = await Inscripcion.findOne().sort({ NRO: -1 });
        const NRO = lastNRO ? lastNRO.NRO + 1 : 1;
        
        // Crear nueva inscripción
        const nuevaInscripcion = new Inscripcion({
            NRO,
            N_equipo,
            tripulante: verificacion.datosInscripcion.tripulante || 'piloto',
            nombres: verificacion.datosInscripcion.nombres,
            apellidos: verificacion.datosInscripcion.apellidos,
            edad: verificacion.datosInscripcion.edad,
            experiencia: verificacion.datosInscripcion.experiencia,
            grupoSanguineo: verificacion.datosInscripcion.grupoSanguineo,
            dni: verificacion.datosInscripcion.dni,
            email: verificacion.datosInscripcion.email,
            celular: verificacion.datosInscripcion.celular,
            personaContacto: verificacion.datosInscripcion.personaContacto,
            celularContacto: verificacion.datosInscripcion.celularContacto,
            grupo: verificacion.datosInscripcion.grupo,
            frecuencia: grupo.frecuencia,
            liderGrupo: grupo.contacto,
            tipoVehiculo: verificacion.datosInscripcion.tipoVehiculo,
            marca: verificacion.datosInscripcion.marca,
            modelo: verificacion.datosInscripcion.modelo,
            año: verificacion.datosInscripcion.año,
            diaLlegada: verificacion.datosInscripcion.diaLlegada,
            estado: verificacion.datosInscripcion.estado || 'PENDIENTE',
            observaciones: verificacion.datosInscripcion.observaciones || ''
        });
        
        await nuevaInscripcion.save();
        
        // Eliminar código usado
        await CodigoVerificacion.deleteOne({ _id: verificacion._id });
        
        res.json({
            success: true,
            message: 'Inscripción guardada exitosamente',
            data: nuevaInscripcion
        });
        
    } catch (error) {
        console.error('Error verificando código:', error);
        
        if (error.code === 11000) {
            if (error.message.includes('dni')) {
                return res.status(400).json({ error: 'Este DNI ya está registrado' });
            }
            if (error.message.includes('email')) {
                return res.status(400).json({ error: 'Este email ya está registrado' });
            }
        }
        
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ error: errors.join(', ') });
        }
        
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.get('/api/inscripciones', async (req, res) => {
    try {
        const inscripciones = await Inscripcion.find()
            .sort({ fechaRegistro: -1 })
            .select('-__v');
        
        res.json({
            success: true,
            total: inscripciones.length,
            data: inscripciones
        });
    } catch (error) {
        console.error('Error obteniendo inscripciones:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.get('/api/inscripciones/stats', async (req, res) => {
    try {
        const total = await Inscripcion.countDocuments();
        
        const porEstado = await Inscripcion.aggregate([
            { $group: { _id: '$estado', count: { $sum: 1 } } }
        ]);
        
        const porTripulante = await Inscripcion.aggregate([
            { $group: { _id: '$tripulante', count: { $sum: 1 } } }
        ]);
        
        const stats = {
            total,
            porEstado: porEstado.reduce((acc, item) => {
                acc[item._id] = item.count;
                return acc;
            }, {}),
            porTripulante: porTripulante.reduce((acc, item) => {
                acc[item._id] = item.count;
                return acc;
            }, {})
        };
        
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error obteniendo estadísticas:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.get('/api/inscripciones/equipo/:numero', async (req, res) => {
    try {
        const miembros = await Inscripcion.find({ N_equipo: req.params.numero });
        
        if (miembros.length === 0) {
            return res.status(404).json({ error: 'Equipo no encontrado' });
        }
        
        const equipo = {
            N_equipo: req.params.numero,
            grupo: miembros[0].grupo,
            frecuencia: miembros[0].frecuencia,
            liderGrupo: miembros[0].liderGrupo,
            totalMiembros: miembros.length,
            miembros: miembros
        };
        
        res.json({
            success: true,
            data: equipo
        });
    } catch (error) {
        console.error('Error obteniendo equipo:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.put('/api/inscripciones/:id', async (req, res) => {
    try {
        const inscripcion = await Inscripcion.findOneAndUpdate(
            { NRO: req.params.id },
            req.body,
            { new: true }
        );
        
        if (!inscripcion) {
            return res.status(404).json({ error: 'Inscripción no encontrada' });
        }
        
        res.json({
            success: true,
            message: 'Inscripción actualizada exitosamente',
            data: inscripcion
        });
    } catch (error) {
        console.error('Error actualizando inscripción:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.delete('/api/inscripciones/:id', async (req, res) => {
    try {
        const inscripcion = await Inscripcion.findOneAndDelete({ NRO: req.params.id });
        
        if (!inscripcion) {
            return res.status(404).json({ error: 'Inscripción no encontrada' });
        }
        
        res.json({
            success: true,
            message: 'Inscripción eliminada exitosamente'
        });
    } catch (error) {
        console.error('Error eliminando inscripción:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ===============================
// RUTAS FRONTEND
// ===============================

// Ruta raíz - servir index.html
app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, '..', 'public', 'index.html'));
});

// Panel administrativo
app.get('/admin', (req, res) => {
    res.sendFile(path.resolve(__dirname, '..', 'public', 'admin.html'));
});

// Ruta de salud de la API
app.get('/api/health', async (req, res) => {
    try {
        const frecuenciasCount = await Frequency.countDocuments();
        const inscripcionesCount = await Inscripcion.countDocuments();
        
        res.json({ 
            status: 'OK',
            mensaje: '🏎️ API Desafío Dunas de Nazca funcionando',
            timestamp: new Date().toISOString(),
            version: '1.0.0',
            database: 'MongoDB Atlas',
            totalGrupos: frecuenciasCount,
            totalInscripciones: inscripcionesCount,
            servidor: 'Render',
            modo: 'PRODUCCIÓN COMPLETA'
        });
    } catch (error) {
        res.status(500).json({
            status: 'ERROR',
            mensaje: 'Error conectando a la base de datos',
            error: error.message
        });
    }
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

// ===============================
// CONEXIÓN MONGODB Y SERVIDOR
// ===============================

// Conectar a MongoDB Atlas
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/desafio-dunas-nazca';

mongoose.connect(MONGODB_URI)
    .then(async () => {
        console.log('✅ MongoDB Atlas conectado exitosamente');
        await initializeFrequencies();
    })
    .catch(err => {
        console.error('❌ Error conectando MongoDB Atlas:', err);
        console.error('❌ Verifica tu MONGODB_URI en las variables de entorno');
    });

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

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
    console.log(`🌐 Frontend: https://desafio-nazca.onrender.com`);
    console.log(`👨‍💼 Admin: https://desafio-nazca.onrender.com/admin`);
    console.log(`🔗 API Health: https://desafio-nazca.onrender.com/api/health`);
    console.log(`🗄️ Base de datos: MongoDB Atlas`);
    console.log(`📊 Total grupos: 49`);
});

// Manejo de cierre graceful
process.on('SIGINT', async () => {
    console.log('\n🛑 Cerrando servidor...');
    await mongoose.connection.close();
    console.log('✅ Conexión MongoDB cerrada');
    process.exit(0);
});

// Endpoint de prueba de email
app.get('/test-email', async (req, res) => {
  try {
    const emailService = require('../server/services/emailService');
    
    console.log('🧪 Probando servicio de email...');
    
    // Verificar conexión primero
    const conexionOK = await emailService.verificarConexion();
    console.log('Conexión verificada:', conexionOK);
    
    if (!conexionOK) {
      return res.status(500).json({ 
        success: false, 
        error: 'No se pudo conectar al servicio de email' 
      });
    }
    
    // Probar envío
    const resultado = await emailService.enviarCodigoVerificacion(
      'mmolina@icresil.com',
      '123456',
      {
        nombres: 'Test',
        apellidos: 'Usuario',
        tripulante: 'Piloto',
        grupo: 'Grupo Test',
        tipoVehiculo: 'Moto',
        marca: 'Test',
        modelo: 'Test',
        diaLlegada: '29 de Agosto'
      }
    );
    
    res.json({ 
      success: true, 
      message: 'Email de prueba enviado',
      resultado: resultado
    });
    
  } catch (error) {
    console.error('❌ Error en prueba de email:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      stack: error.stack
    });
  }
});
const testMailRoutes = require('./routes/testMail');
app.use('/api', testMailRoutes);
