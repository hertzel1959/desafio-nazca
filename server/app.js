/**
 * DESAFÍO DUNAS DE NAZCA - SERVER APPLICATION
 * Servidor principal de la aplicación
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const multer = require('multer');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

const counterService = require('./services/counterService'); // ← LÍNEA AGREGADA
// 1. IMPORTS (línea 12 aproximadamente) - AGREGAR:
const inscripcionesRoutes = require('./routes/inscripciones');

const emailService = require('./services/emailService'); // ← AGREGAR ESTA LÍNEA
const testMailRoutes = require('../sendTestMail'); // ← AGREGAR ESTA LÍNEA
require('dotenv').config();

// Importar rutas
const indexRoutes = require('./routes/index');
const registrationRoutes = require('./routes/registration');
const adminRoutes = require('./routes/admin');
const frecuenciasRoutes = require('./routes/frecuencias');
//const inscripcionesRoutes = require('./routes/inscripciones');
//const inscripcionesRoutes = require('./routes/inscripciones');

// Importar middleware
const authMiddleware = require('./middleware/auth');

// Crear aplicación Express
const app = express();

// Configuración
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/desafio-nazca';
console.log('🔗 Usando URI:', MONGODB_URI.substring(0, 20) + '...');

/**
 * MIDDLEWARE DE SEGURIDAD
 */

// Helmet para headers de seguridad

app.use(cors({
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: NODE_ENV === 'production' ? 100 : 1000, // límite de requests por IP
    message: {
        error: 'Demasiados intentos desde esta IP. Intenta nuevamente en 15 minutos.'
    },
    standardHeaders: true,
    legacyHeaders: false
});
app.use('/api/', limiter);

// Rate limiting más estricto para registro
const registrationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 5, // máximo 5 registros por hora por IP
    message: {
        error: 'Demasiados intentos de registro. Intenta nuevamente en 1 hora.'
    }
});

/**
 * MIDDLEWARE GENERAL
 */

// Compresión
app.use(compression());

// Logging
if (NODE_ENV === 'production') {
    app.use(morgan('combined'));
} else {
    app.use(morgan('dev'));
}

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Archivos estáticos
app.use(express.static(path.join(__dirname, '../public'), {
    maxAge: NODE_ENV === 'production' ? '1y' : '0',
    etag: true,
    lastModified: true
}));
// ============================================
// 📁 CONFIGURACIÓN DE CARPETAS
// ============================================

// Servir archivos estáticos
app.use(express.static('public'));
app.use(express.json());

// Crear carpeta uploads si no existe
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('📁 Carpeta uploads creada');
} 
// ============================================
// 🎥 CONFIGURACIÓN DE MULTER PARA VIDEOS
// ============================================

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/') // Los videos se guardan aquí
    },
    filename: function (req, file, cb) {
        // Nombre único para evitar conflictos
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const fileFilter = (req, file, cb) => {
    // Solo permitir videos
    if (file.mimetype.startsWith('video/')) {
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten archivos de video'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB máximo
    }
});

/**
 * CONEXIÓN A BASE DE DATOS
 */
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4
})
.then(async () => {
    console.log('✅ Conectado a MongoDB');
    
    // Inicializar contadores
    console.log('🔢 Inicializando contadores...');
    await counterService.initCounter('frecuencias', 'NRO');
    // ❌ QUITAMOS inscripciones porque ahora usa RECNUMBER
    // await counterService.initCounter('inscripciones', 'NRO');        
    console.log('✅ Contadores listos');
    console.log('📊 Inscripciones usarán RECNUMBER (contador automático)');
    
    // Verificar servicio de email
    console.log('📧 Verificando servicio de email...');
    const emailConectado = await emailService.verificarConexion();
    if (emailConectado) {
        console.log('✅ Servicio de email conectado');
    } else {
        console.log('⚠️ Email no configurado (revisar .env)');
    }
})

/**
 * RUTAS
 */

// Rutas API

app.use('/api', indexRoutes);
app.use('/api/registration', registrationLimiter, registrationRoutes);
app.use('/api/admin', authMiddleware.requireAuth, adminRoutes);
app.use('/api/frecuencias', frecuenciasRoutes);
//app.use('/api/inscripciones', inscripcionesRoutes);
 app.use('/api/inscripciones', inscripcionesRoutes); // nueva
app.use('/api', testMailRoutes); // ← AGREGAR ESTA LÍNEA

// Cambiar por:
//app.use('/api/inscripciones-evento', inscripcionesRoutes);



// Ruta para servir el index.html en todas las rutas que no sean API
app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(__dirname, '../public/index.html'));
    } else {
        res.status(404).json({ error: 'Endpoint no encontrado' });
    }
});

/**
 * MANEJO DE ERRORES
 */

// Middleware de manejo de errores 404
app.use((req, res, next) => {
    const error = new Error(`Ruta no encontrada: ${req.originalUrl}`);
    error.status = 404;
    next(error);
});

// Middleware de manejo de errores general
app.use((error, req, res, next) => {
    console.error('Error:', error);
    
    const status = error.status || 500;
    const message = NODE_ENV === 'production' 
        ? (status === 500 ? 'Error interno del servidor' : error.message)
        : error.message;
    
    res.status(status).json({
        error: message,
        ...(NODE_ENV === 'development' && { stack: error.stack })
    });
});

/**
 * MANEJO DE SEÑALES DE PROCESO
 */
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

function gracefulShutdown(signal) {
    console.log(`\n📡 Recibida señal ${signal}. Cerrando servidor...`);
    
    server.close(() => {
        console.log('🔌 Servidor HTTP cerrado.');
        
        mongoose.connection.close(false, () => {
            console.log('🔌 Conexión MongoDB cerrada.');
            process.exit(0);
        });
    });
    
    // Forzar cierre después de 30 segundos
    setTimeout(() => {
        console.error('⚠️ Forzando cierre del proceso...');
        process.exit(1);
    }, 30000);
}

/**
 * INICIAR SERVIDOR
 */
const server = app.listen(PORT, () => {
    console.log('\n🚀 ===================================');
    console.log(`🏁 Desafío Dunas de Nazca - Servidor iniciado`);
    console.log(`🌍 Entorno: ${NODE_ENV}`);
    console.log(`📡 Puerto: ${PORT}`);
    console.log(`🔗 URL: http://localhost:${PORT}`);
    console.log('🚀 ===================================\n');
});

// Configurar timeout del servidor
server.timeout = 120000; // 2 minutos
// ============================================
// 🗄️ BASE DE DATOS SIMULADA (en memoria)
// ============================================

let videosDatabase = [
    {
        id: 1,
        title: "Video de prueba",
        description: "Este es un video de ejemplo",
        category: "evento",
        status: "published",
        featured: false,
        duration: "2:30",
        views: 0,
        createdAt: new Date().toISOString(),
        filename: null,
        url: null,
        size: 0,
        tags: "prueba,demo"
    }
];

// ============================================
// 🛤️ RUTAS DE LA API PARA VIDEOS
// ============================================

// 📊 Obtener estadísticas de videos
app.get('/api/videos/stats', (req, res) => {
    const published = videosDatabase.filter(v => v.status === 'published').length;
    res.json({ 
        data: { 
            total: videosDatabase.length, 
            published: published,
            draft: videosDatabase.length - published
        } 
    });
});

// 📋 Obtener todos los videos (para admin)
app.get('/api/videos', (req, res) => {
    res.json(videosDatabase);
});

// 📋 Obtener solo videos publicados (para página pública)
app.get('/api/videos/public', (req, res) => {
    const publicVideos = videosDatabase
        .filter(v => v.status === 'published')
        .sort((a, b) => {
            // Destacados primero, luego por fecha
            if (a.featured && !b.featured) return -1;
            if (!a.featured && b.featured) return 1;
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
    
    res.json({ data: publicVideos });
});

// 📤 Subir nuevo video
app.post('/api/videos', upload.single('video'), (req, res) => {
    try {
        console.log('📤 Subiendo video...');
        console.log('Archivo:', req.file);
        console.log('Datos:', req.body);

        if (!req.file && req.body.title) {
            // Solo metadatos (sin archivo) - para testing
            const newVideo = {
                id: Date.now(),
                title: req.body.title,
                description: req.body.description || '',
                category: req.body.category,
                status: req.body.status || 'draft',
                featured: req.body.featured === 'on' || req.body.featured === 'true',
                duration: req.body.duration || '0:00',
                views: 0,
                createdAt: new Date().toISOString(),
                filename: null,
                url: null,
                size: 0,
                tags: req.body.tags || ''
            };

            videosDatabase.push(newVideo);
            console.log('✅ Video (solo metadatos) guardado');
            
            return res.json({ 
                success: true, 
                message: 'Video guardado (modo demo)',
                data: newVideo 
            });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'No se recibió ningún archivo' });
        }

        // Crear entrada en la base de datos con archivo real
        const videoUrl = `/uploads/${req.file.filename}`;
        
        const newVideo = {
            id: Date.now(),
            title: req.body.title,
            description: req.body.description || '',
            category: req.body.category,
            status: req.body.status || 'draft',
            featured: req.body.featured === 'on' || req.body.featured === 'true',
            duration: req.body.duration || '0:00',
            views: 0,
            createdAt: new Date().toISOString(),
            filename: req.file.filename,
            url: videoUrl,
            size: req.file.size,
            tags: req.body.tags || ''
        };

        videosDatabase.push(newVideo);
        
        console.log('✅ Video guardado exitosamente:', newVideo.title);
        
        res.json({ 
            success: true, 
            message: 'Video subido exitosamente',
            data: newVideo 
        });

    } catch (error) {
        console.error('❌ Error subiendo video:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ✏️ Actualizar video existente
app.put('/api/videos/:id', upload.single('video'), (req, res) => {
    try {
        const videoId = parseInt(req.params.id);
        const videoIndex = videosDatabase.findIndex(v => v.id === videoId);
        
        if (videoIndex === -1) {
            return res.status(404).json({ error: 'Video no encontrado' });
        }

        // Actualizar datos
        const updatedVideo = {
            ...videosDatabase[videoIndex],
            title: req.body.title || videosDatabase[videoIndex].title,
            description: req.body.description || videosDatabase[videoIndex].description,
            category: req.body.category || videosDatabase[videoIndex].category,
            status: req.body.status || videosDatabase[videoIndex].status,
            featured: req.body.featured === 'on' || req.body.featured === 'true',
            duration: req.body.duration || videosDatabase[videoIndex].duration,
            tags: req.body.tags || videosDatabase[videoIndex].tags
        };

        // Si hay archivo nuevo, reemplazar
        if (req.file) {
            // Borrar archivo anterior si existe
            if (videosDatabase[videoIndex].filename) {
                const oldPath = path.join(__dirname, 'public', 'uploads', videosDatabase[videoIndex].filename);
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }

            updatedVideo.filename = req.file.filename;
            updatedVideo.url = `/uploads/${req.file.filename}`;
            updatedVideo.size = req.file.size;
        }

        videosDatabase[videoIndex] = updatedVideo;
        
        console.log('✅ Video actualizado:', updatedVideo.title);
        
        res.json({ 
            success: true, 
            message: 'Video actualizado exitosamente',
            data: updatedVideo 
        });

    } catch (error) {
        console.error('❌ Error actualizando video:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// 🗑️ Eliminar video
app.delete('/api/videos/:id', (req, res) => {
    try {
        const videoId = parseInt(req.params.id);
        const videoIndex = videosDatabase.findIndex(v => v.id === videoId);
        
        if (videoIndex === -1) {
            return res.status(404).json({ error: 'Video no encontrado' });
        }

        const video = videosDatabase[videoIndex];
        
        // Borrar archivo físico si existe
        if (video.filename) {
            const filePath = path.join(__dirname, 'public', 'uploads', video.filename);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                console.log('🗑️ Archivo eliminado:', video.filename);
            }
        }

        // Borrar de la base de datos
        videosDatabase.splice(videoIndex, 1);
        
        console.log('✅ Video eliminado:', video.title);
        
        res.json({ 
            success: true, 
            message: 'Video eliminado exitosamente' 
        });

    } catch (error) {
        console.error('❌ Error eliminando video:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// 🔄 Cambiar estado de video (publicar/despublicar)
app.patch('/api/videos/:id/status', (req, res) => {
    try {
        const videoId = parseInt(req.params.id);
        const videoIndex = videosDatabase.findIndex(v => v.id === videoId);
        
        if (videoIndex === -1) {
            return res.status(404).json({ error: 'Video no encontrado' });
        }

        videosDatabase[videoIndex].status = req.body.status;
        
        console.log('✅ Estado del video cambiado:', videosDatabase[videoIndex].title, '→', req.body.status);
        
        res.json({ 
            success: true, 
            message: `Video ${req.body.status === 'published' ? 'publicado' : 'despublicado'} exitosamente`,
            data: videosDatabase[videoIndex]
        });

    } catch (error) {
        console.error('❌ Error cambiando estado:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// 👀 Incrementar vistas
app.post('/api/videos/:id/view', (req, res) => {
    try {
        const videoId = parseInt(req.params.id);
        const videoIndex = videosDatabase.findIndex(v => v.id === videoId);
        
        if (videoIndex !== -1) {
            videosDatabase[videoIndex].views = (videosDatabase[videoIndex].views || 0) + 1;
        }
        
        res.json({ success: true });
    } catch (error) {
        res.json({ success: false });
    }
});

// ============================================
// 🏠 RUTAS PARA SERVIR LAS PÁGINAS HTML
// ============================================

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get('/videos', (req, res) => {
    res.sendFile(path.join(__dirname, 'videos.html'));
});

// ============================================
// 🚀 INICIAR SERVIDOR
// ============================================

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
    console.log(`📁 Carpeta uploads: ${uploadsDir}`);
    console.log(`🎥 Videos guardados: ${videosDatabase.length}`);
});

// ============================================
// ❌ MANEJO DE ERRORES
// ============================================

// Error de multer (archivo demasiado grande, etc.)
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'El archivo es demasiado grande (máximo 100MB)' });
        }
    }
    
    if (error.message === 'Solo se permiten archivos de video') {
        return res.status(400).json({ error: 'Solo se permiten archivos de video' });
    }
    
    console.error('❌ Error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
});

module.exports = app;