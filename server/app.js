/**
 * DESAFÍO DUNAS DE NAZCA - SERVER APPLICATION
 * Servidor principal de la aplicación
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const counterService = require('./services/counterService');
const emailService = require('./services/emailService');
const testMailRoutes = require('../sendTestMail');

require('dotenv').config();

// Importar rutas
const indexRoutes = require('./routes/index');
const registrationRoutes = require('./routes/registration');
const adminRoutes = require('./routes/admin');
const frecuenciasRoutes = require('./routes/frecuencias');
const inscripcionesRoutes = require('./routes/inscripciones');

// Importar modelos
const Video = require('./models/Video'); // ← NUEVO MODELO

// Importar middleware
const authMiddleware = require('./middleware/auth');

// Crear aplicación Express
const app = express();

// Configuración
const NODE_ENV = process.env.NODE_ENV || 'development';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/desafio-nazca';
console.log('🔗 Usando URI:', MONGODB_URI.substring(0, 20) + '...');

/**
 * MIDDLEWARE DE SEGURIDAD
 */

// CORS
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
// Aplicar rate limiting solo a ciertas rutas, NO a videos
app.use('/api/registration', limiter);
app.use('/api/frecuencias', limiter);
app.use('/api/inscripciones', limiter);

// Para videos, usar un límite más alto
const videoLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 500, // Límite mucho más alto para admin
    standardHeaders: true,
    legacyHeaders: false
});
app.use('/api/videos', videoLimiter);

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

// Crear carpeta uploads si no existe
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('📁 Carpeta uploads creada');
}

// Archivos estáticos
app.use(express.static(path.join(__dirname, 'public'), {
    maxAge: NODE_ENV === 'production' ? '1y' : '0',
    etag: true,
    lastModified: true
}));

// También servir frontend si está en la raíz
app.use(express.static(path.join(__dirname, '../public'), {
    maxAge: NODE_ENV === 'production' ? '1y' : '0',
    etag: true,
    lastModified: true
}));

console.log('📁 Archivos estáticos configurados desde:', path.join(__dirname, 'public'));

/**
 * CONFIGURACIÓN DE MULTER PARA VIDEOS
 */

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadsPath = path.join(__dirname, 'public', 'uploads');
        
        // Verificar que la carpeta existe
        if (!fs.existsSync(uploadsPath)) {
            fs.mkdirSync(uploadsPath, { recursive: true });
            console.log('📁 Carpeta uploads creada:', uploadsPath);
        }
        
        console.log('📁 Guardando en:', uploadsPath);
        cb(null, uploadsPath);
    },
    filename: function (req, file, cb) {
        // Nombre único para evitar conflictos
        const timestamp = Date.now();
        const random = Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        const uniqueName = `video-${timestamp}-${random}${extension}`;
        
        console.log('📝 Nombre del archivo:', uniqueName);
        cb(null, uniqueName);
    }
});

const fileFilter = (req, file, cb) => {
    console.log('🔍 Verificando archivo:', file.originalname, 'Tipo:', file.mimetype);
    
    // Solo permitir videos
    if (file.mimetype.startsWith('video/')) {
        console.log('✅ Archivo de video válido');
        cb(null, true);
    } else {
        console.log('❌ Archivo no es video');
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
 * RUTAS DE LA API PARA VIDEOS (CON MONGODB)
 */

// Obtener estadísticas de videos
app.get('/api/videos/stats', async (req, res) => {
    try {
        const total = await Video.countDocuments();
        const published = await Video.countDocuments({ status: 'published' });
        const draft = await Video.countDocuments({ status: 'draft' });
        
        res.json({ 
            data: { 
                total,
                published,
                draft
            } 
        });
    } catch (error) {
        console.error('❌ Error obteniendo estadísticas:', error);
        res.status(500).json({ error: 'Error obteniendo estadísticas' });
    }
});

// Obtener todos los videos (para admin)
app.get('/api/videos', async (req, res) => {
    try {
        const videos = await Video.find().sort({ createdAt: -1 });
        console.log('📡 GET /api/videos - Enviando', videos.length, 'videos');
        res.json(videos);
    } catch (error) {
        console.error('❌ Error obteniendo videos:', error);
        res.status(500).json({ error: 'Error obteniendo videos' });
    }
});

// Obtener solo videos publicados (para página pública)
app.get('/api/videos/public', async (req, res) => {
    try {
        const publicVideos = await Video.find({ status: 'published' })
            .sort({ featured: -1, createdAt: -1 });
        
        console.log('📡 GET /api/videos/public - Enviando', publicVideos.length, 'videos públicos');
        res.json({ data: publicVideos });
    } catch (error) {
        console.error('❌ Error obteniendo videos públicos:', error);
        res.status(500).json({ error: 'Error obteniendo videos públicos' });
    }
});

// Subir nuevo video
app.post('/api/videos', upload.single('video'), async (req, res) => {
    console.log('\n🎬 ============ SUBIR NUEVO VIDEO ============');
    console.log('📤 POST /api/videos iniciado');
    console.log('📁 Archivo recibido:', req.file ? 'SÍ' : 'NO');
    console.log('📝 Datos del formulario:', req.body);
    
    try {
        // Validar campos requeridos
        if (!req.body.title || !req.body.category) {
            console.log('❌ Faltan campos requeridos');
            return res.status(400).json({ error: 'Título y categoría son obligatorios' });
        }

        // Preparar datos del video
        const videoData = {
            title: req.body.title,
            description: req.body.description || '',
            category: req.body.category,
            status: req.body.status || 'draft',
            featured: req.body.featured === 'on' || req.body.featured === 'true',
            duration: req.body.duration || '0:00',
            tags: req.body.tags || ''
        };

        // Si hay archivo, agregar información del archivo
        if (req.file) {
            console.log('📁 Procesando archivo:', req.file.filename);
            console.log('📊 Tamaño:', req.file.size, 'bytes');
            
            videoData.filename = req.file.filename;
            videoData.url = `/uploads/${req.file.filename}`;
            videoData.size = req.file.size;
        } else {
            console.log('⚠️ Sin archivo - Creando solo metadatos');
        }

        // Guardar en MongoDB
        const newVideo = new Video(videoData);
        const savedVideo = await newVideo.save();
        
        console.log('✅ Video guardado exitosamente en MongoDB:');
        console.log('  - ID:', savedVideo._id);
        console.log('  - Título:', savedVideo.title);
        console.log('  - Archivo:', savedVideo.filename || 'Sin archivo');
        console.log('  - URL:', savedVideo.url || 'Sin URL');
        console.log('🎬 ================================\n');
        
        res.json({ 
            success: true, 
            message: 'Video guardado exitosamente',
            data: savedVideo 
        });

    } catch (error) {
        console.error('❌ Error en POST /api/videos:', error);
        res.status(500).json({ error: 'Error interno del servidor: ' + error.message });
    }
});

// Actualizar video existente
app.put('/api/videos/:id', async (req, res) => {
    console.log('\n🎬 ============ ACTUALIZAR VIDEO ============');
    console.log('✏️ PUT /api/videos/' + req.params.id);
    
    // Usar multer solo si hay archivo
    const processRequest = async (req, res) => {
        try {
            const videoId = req.params.id;
            console.log('🔍 Buscando video ID:', videoId);
            console.log('📝 Datos recibidos:', req.body);
            console.log('📁 Nuevo archivo:', req.file ? 'SÍ' : 'NO');
            
            // Buscar video existente
            const existingVideo = await Video.findById(videoId);
            if (!existingVideo) {
                console.log('❌ Video no encontrado');
                return res.status(404).json({ error: 'Video no encontrado' });
            }

            // Preparar datos de actualización
            const updateData = {
                title: req.body.title || existingVideo.title,
                description: req.body.description || existingVideo.description,
                category: req.body.category || existingVideo.category,
                status: req.body.status || existingVideo.status,
                featured: req.body.featured === 'on' || req.body.featured === 'true' || req.body.featured === true,
                duration: req.body.duration || existingVideo.duration,
                tags: req.body.tags || existingVideo.tags
            };

            // Si hay archivo nuevo, reemplazar
            if (req.file) {
                console.log('📁 Reemplazando archivo...');
                
                // Borrar archivo anterior si existe
                if (existingVideo.filename) {
                    const oldPath = path.join(__dirname, 'public', 'uploads', existingVideo.filename);
                    console.log('🗑️ Eliminando archivo anterior:', oldPath);
                    if (fs.existsSync(oldPath)) {
                        fs.unlinkSync(oldPath);
                        console.log('✅ Archivo anterior eliminado');
                    }
                }

                updateData.filename = req.file.filename;
                updateData.url = `/uploads/${req.file.filename}`;
                updateData.size = req.file.size;
                console.log('📁 Nuevo archivo:', req.file.filename);
            }

            // Actualizar en MongoDB
            const updatedVideo = await Video.findByIdAndUpdate(
                videoId, 
                updateData, 
                { new: true, runValidators: true }
            );
            
            console.log('✅ Video actualizado exitosamente:', updatedVideo.title);
            console.log('🎬 ================================\n');
            
            res.json({ 
                success: true, 
                message: 'Video actualizado exitosamente',
                data: updatedVideo 
            });

        } catch (error) {
            console.error('❌ Error actualizando video:', error);
            res.status(500).json({ error: 'Error interno del servidor: ' + error.message });
        }
    };

    // Detectar si hay multipart/form-data
    const contentType = req.get('Content-Type') || '';
    if (contentType.includes('multipart/form-data')) {
        console.log('📁 Contenido multipart detectado - usando multer');
        upload.single('video')(req, res, (err) => {
            if (err) {
                console.error('❌ Error en multer:', err);
                return res.status(400).json({ error: err.message });
            }
            processRequest(req, res);
        });
    } else {
        console.log('📝 Solo metadatos - sin multer');
        processRequest(req, res);
    }
});

// Eliminar video
app.delete('/api/videos/:id', async (req, res) => {
    console.log('\n🗑️ ELIMINAR VIDEO ID:', req.params.id);
    
    try {
        const videoId = req.params.id;
        
        // Buscar video para obtener información del archivo
        const video = await Video.findById(videoId);
        if (!video) {
            return res.status(404).json({ error: 'Video no encontrado' });
        }

        console.log('🗑️ Eliminando:', video.title);
        
        // Borrar archivo físico si existe
        if (video.filename) {
            const filePath = path.join(__dirname, 'public', 'uploads', video.filename);
            console.log('🗑️ Borrando archivo:', filePath);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                console.log('✅ Archivo eliminado del disco');
            }
        }

        // Borrar de MongoDB
        await Video.findByIdAndDelete(videoId);
        
        console.log('✅ Video eliminado completamente de MongoDB');
        
        res.json({ 
            success: true, 
            message: 'Video eliminado exitosamente' 
        });

    } catch (error) {
        console.error('❌ Error eliminando video:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Incrementar vistas
app.post('/api/videos/:id/view', async (req, res) => {
    try {
        const videoId = req.params.id;
        const updatedVideo = await Video.findByIdAndUpdate(
            videoId,
            { $inc: { views: 1 } },
            { new: true }
        );
        
        if (updatedVideo) {
            console.log('👀 Vista incrementada para:', updatedVideo.title);
        }
        
        res.json({ success: true });
    } catch (error) {
        console.error('❌ Error incrementando vista:', error);
        res.json({ success: false });
    }
});

// Debug: Información de la base de datos
app.get('/api/debug/database', async (req, res) => {
    try {
        console.log('\n🐛 ========== DEBUG BASE DE DATOS ==========');
        
        const videos = await Video.find().sort({ createdAt: -1 });
        const total = videos.length;
        const published = videos.filter(v => v.status === 'published').length;
        const draft = videos.filter(v => v.status === 'draft').length;
        
        console.log('📊 Total videos en MongoDB:', total);
        console.log('📝 Lista de videos:');
        
        videos.forEach((video, index) => {
            console.log(`  ${index + 1}. ID: ${video._id}`);
            console.log(`     Título: ${video.title}`);
            console.log(`     Estado: ${video.status}`);
            console.log(`     Archivo: ${video.filename || 'Sin archivo'}`);
            console.log(`     URL: ${video.url || 'Sin URL'}`);
            console.log('     ---');
        });
        
        console.log('📊 Estadísticas:');
        console.log(`   Total: ${total}`);
        console.log(`   Publicados: ${published}`);
        console.log(`   Borradores: ${draft}`);
        console.log('🐛 ================================\n');
        
        res.json({
            success: true,
            total,
            published,
            draft,
            videos: videos.map(v => ({
                id: v._id,
                title: v.title,
                status: v.status,
                filename: v.filename,
                size: v.size,
                url: v.url,
                category: v.category,
                featured: v.featured,
                createdAt: v.createdAt
            }))
        });
    } catch (error) {
        console.error('❌ Error en debug:', error);
        res.status(500).json({ error: 'Error obteniendo información de debug' });
    }
});

// Debug: Reset de la base de datos
app.post('/api/debug/reset-database', async (req, res) => {
    try {
        console.log('\n🔄 ========== RESET BASE DE DATOS ==========');
        
        const videosAntes = await Video.countDocuments();
        console.log('📊 Videos antes del reset:', videosAntes);
        
        // Eliminar todos los videos de MongoDB
        await Video.deleteMany({});
        
        // Crear video de prueba
        const videoDemo = new Video({
            title: "Video de prueba",
            description: "Este es un video de ejemplo",
            category: "evento",
            status: "published",
            featured: false,
            duration: "2:30",
            tags: "prueba,demo"
        });
        
        await videoDemo.save();
        
        const videosDespues = await Video.countDocuments();
        console.log('✅ Base de datos reseteada');
        console.log('📊 Videos después del reset:', videosDespues);
        console.log('🔄 ================================\n');
        
        res.json({
            success: true,
            message: 'Base de datos reseteada',
            total: videosDespues
        });
    } catch (error) {
        console.error('❌ Error reseteando base de datos:', error);
        res.status(500).json({ error: 'Error reseteando base de datos' });
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
    console.log('✅ Contadores listos');
    console.log('📊 Inscripciones usarán RECNUMBER (contador automático)');
    
    // Verificar servicio de email
   /* console.log('📧 Verificando servicio de email...');
    const emailConectado = await emailService.verifyConnection();
    if (emailConectado) {
        console.log('✅ Servicio de email conectado');
    } else {
        console.log('⚠️ Email no configurado (revisar .env)');
    }
    */
   
    // ✅ REEMPLAZAR CON SOLO ESTO:
    console.log('📧 EmailService configurado');

    // Verificar videos existentes
    const totalVideos = await Video.countDocuments();
    console.log(`🎥 Videos en MongoDB: ${totalVideos}`);
})
.catch(err => {
    console.error('❌ Error conectando a MongoDB:', err);
});

/**
 * RUTAS PRINCIPALES
 */

// Rutas API
app.use('/api', indexRoutes);
app.use('/api/registration', registrationLimiter, registrationRoutes);
app.use('/api/admin', authMiddleware.requireAuth, adminRoutes);
app.use('/api/frecuencias', frecuenciasRoutes);
app.use('/api/inscripciones', inscripcionesRoutes);
app.use('/api', testMailRoutes);

// Ruta para la página de videos
app.get('/videos', (req, res) => {
    res.sendFile(path.join(__dirname, 'videos.html'));
});

// Ruta catch-all para el frontend
app.get('*', (req, res) => {
    // NO capturar rutas de archivos estáticos
    if (req.path.startsWith('/api') || 
        req.path.startsWith('/uploads')) {
        return res.status(404).json({ error: 'Recurso no encontrado' });
    }
    
    // Servir index.html para el frontend
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

/**
 * MANEJO DE ERRORES
 */

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
    
    next(error);
});

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
const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, async () => {
    console.log('\n🚀 ===================================');
    console.log(`🏁 Desafío Dunas de Nazca - Servidor iniciado`);
    console.log(`🌍 Entorno: ${NODE_ENV}`);
    console.log(`📡 Puerto: ${PORT}`);
    console.log(`🔗 URL: http://localhost:${PORT}`);
    console.log(`📁 Carpeta uploads: ${uploadsDir}`);
    
    // Contar videos desde MongoDB
    try {
        const totalVideos = await Video.countDocuments();
        console.log(`🎥 Videos en MongoDB: ${totalVideos}`);
    } catch (error) {
        console.log(`🎥 Videos: Error conectando a MongoDB`);
    }
    
    console.log(`🌐 Frontend: http://localhost:${PORT}`);
    console.log(`👨‍💼 Admin: http://localhost:${PORT}/admin`);
    console.log(`🔗 API: http://localhost:${PORT}/api/health`);
    console.log('🚀 ===================================\n');
});

// Configurar timeout del servidor
server.timeout = 120000; // 2 minutos

module.exports = app;