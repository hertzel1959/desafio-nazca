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


const counterService = require('./services/counterService'); // ← LÍNEA AGREGADA
// 1. IMPORTS (línea 12 aproximadamente) - AGREGAR:
const inscripcionesRoutes = require('./routes/inscripciones');
const testMailRoutes = require('./routes/testMail'); // ← AGREGAR ESTA LÍNEA
const emailService = require('./services/emailService'); // ← AGREGAR ESTA LÍNEA

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
// Helmet para headers de seguridad (RELAJADO para desarrollo)
/*
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],  // ← Permitir inline
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'", "https:"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            childSrc: ["'self'"]
        }
    },
    crossOriginEmbedderPolicy: false
}));
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
 
//app.use('/api/inscripciones', inscripcionesRoutes);
//await counterService.initCounter('inscripciones', 'NRO');
//await counterService.initCounter('inscripciones', 'N_equipo');

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
    await counterService.initCounter('inscripciones', 'NRO');        // ← MOVER AQUÍ
    await counterService.initCounter('inscripciones', 'N_equipo');   // ← MOVER AQUÍ
    console.log('✅ Contadores listos');
    
    // Verificar servicio de email
    console.log('📧 Verificando servicio de email...');
    const emailConectado = await emailService.verificarConexion();
    if (emailConectado) {
        console.log('✅ Servicio de email conectado');
    } else {
        console.log('⚠️ Email no configurado (revisar .env)');
    }
})
.catch((error) => {
    console.error('❌ Error conectando a MongoDB:', error);
    process.exit(1);
});

/**
 * RUTAS
 */

// Rutas API

app.use('/api', indexRoutes);
app.use('/api/registration', registrationLimiter, registrationRoutes);
app.use('/api/admin', authMiddleware.requireAuth, adminRoutes);
app.use('/api/frecuencias', frecuenciasRoutes);
app.use('/api/inscripciones', inscripcionesRoutes);
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

module.exports = app;