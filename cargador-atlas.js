// cargador-atlas.js
// Cargador de frecuencias para MongoDB Atlas Cloud

require('dotenv').config(); // Cargar variables del archivo .env
const mongoose = require('mongoose');
const XLSX = require('xlsx');

// Esquema para el contador de IDs
const counterSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    sequence_value: { type: Number, default: 0 }
});

const Counter = mongoose.model('Counter', counterSchema);

// Esquema principal para frecuencias
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
        required: true,
        unique: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true
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

// Middleware para generar ID autoincremental
frecuenciaSchema.pre('save', async function(next) {
    if (this.isNew) {
        try {
            const counter = await Counter.findByIdAndUpdate(
                'frecuencia_id',
                { $inc: { sequence_value: 1 } },
                { new: true, upsert: true }
            );
            this.id = counter.sequence_value;
        } catch (error) {
            return next(error);
        }
    }
    next();
});

const Frecuencia = mongoose.model('Frecuencia', frecuenciaSchema);

async function cargarFrecuenciasAtlas() {
    console.log('🚀 Iniciando carga de frecuencias en MongoDB Atlas...\n');
    
    try {
        // 1. Verificar variables de entorno
        console.log('🔍 Verificando configuración...');
        
        // Posibles nombres de variables en tu .env
        const MONGO_URI = process.env.MONGODB_URI || 
                          process.env.MONGO_URI || 
                          process.env.DATABASE_URL || 
                          process.env.ATLAS_URI ||
                          process.env.MONGODB_URL;
        
        if (!MONGO_URI) {
            console.error('❌ No se encontró la URI de MongoDB en el archivo .env');
            console.log('\n💡 Asegúrate de tener una de estas variables en tu .env:');
            console.log('MONGODB_URI=mongodb+srv://usuario:password@cluster.xxxxx.mongodb.net/frecuencias_db');
            console.log('MONGO_URI=mongodb+srv://usuario:password@cluster.xxxxx.mongodb.net/frecuencias_db');
            console.log('DATABASE_URL=mongodb+srv://usuario:password@cluster.xxxxx.mongodb.net/frecuencias_db');
            return;
        }
        
        console.log('✅ URI de MongoDB encontrada');
        console.log(`🔗 Conectando a: ${MONGO_URI.replace(/:[^:@]*@/, ':****@')}`); // Ocultar password
        
        // 2. Conectar a MongoDB Atlas
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            retryWrites: true,
            w: 'majority'
        });
        console.log('✅ Conectado a MongoDB Atlas');
        
        // 3. Verificar que el archivo Excel existe
        console.log('📖 Verificando archivo Excel...');
        const fs = require('fs');
        if (!fs.existsSync('Frecuencias.xlsx')) {
            console.error('❌ No se encontró el archivo Frecuencias.xlsx');
            console.log('💡 Asegúrate de que el archivo esté en la misma carpeta que este script');
            return;
        }
        
        // 4. Leer archivo Excel
        console.log('📖 Leyendo archivo Excel...');
        const workbook = XLSX.readFile('Frecuencias.xlsx');
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(worksheet);
        console.log(`✅ Leídos ${data.length} registros del Excel`);
        
        // 5. Limpiar datos anteriores (opcional)
        console.log('🧹 Limpiando datos anteriores...');
        await Frecuencia.deleteMany({});
        await Counter.deleteMany({});
        console.log('✅ Datos anteriores eliminados');
        
        // 6. Procesar y guardar datos
        console.log('💾 Guardando datos en Atlas...');
        let insertados = 0;
        let errores = 0;
        
        for (const registro of data) {
            try {
                const nuevaFrecuencia = new Frecuencia({
                    grupo: registro.GRUPO?.toString().trim() || '',
                    frecuencia: parseFloat(registro.FRECUENCIAS) || 0,
                    email: registro.EMAIL?.toString().trim() || null,
                    contacto: registro.CONTACTO?.toString().trim() || null,
                    telefono: registro.TELEFONO?.toString().trim() || null
                });
                
                await nuevaFrecuencia.save();
                insertados++;
                
                if (insertados % 10 === 0) {
                    console.log(`⏳ Procesados ${insertados}/${data.length} registros...`);
                }
                
            } catch (error) {
                console.error(`❌ Error en registro: ${error.message}`);
                errores++;
            }
        }
        
        console.log(`✅ Proceso completado: ${insertados} insertados, ${errores} errores`);
        
        // 7. Crear índices para optimizar consultas
        console.log('📊 Creando índices...');
        await Frecuencia.collection.createIndex({ id: 1 }, { unique: true });
        await Frecuencia.collection.createIndex({ frecuencia: 1 }, { unique: true });
        await Frecuencia.collection.createIndex({ grupo: 1 });
        console.log('✅ Índices creados');
        
        // 8. Mostrar resumen
        console.log('\n📊 RESUMEN FINAL:');
        const total = await Frecuencia.countDocuments();
        const conEmail = await Frecuencia.countDocuments({ email: { $ne: null, $ne: '' } });
        const conContacto = await Frecuencia.countDocuments({ contacto: { $ne: null, $ne: '' } });
        
        console.log(`📻 Total de frecuencias: ${total}`);
        console.log(`📧 Con email: ${conEmail}`);
        console.log(`👤 Con contacto: ${conContacto}`);
        
        // Mostrar algunas frecuencias de ejemplo
        const muestras = await Frecuencia.find().limit(5).sort({ id: 1 });
        console.log('\n📻 Primeras 5 frecuencias:');
        muestras.forEach(f => {
            console.log(`ID: ${f.id} | ${f.grupo} | ${f.frecuencia} MHz | ${f.email || 'Sin email'}`);
        });
        
        console.log('\n🎉 ¡Carga completada exitosamente en MongoDB Atlas!');
        
    } catch (error) {
        console.error('\n❌ Error durante la carga:', error.message);
        
        // Errores específicos de Atlas
        if (error.message.includes('authentication')) {
            console.log('\n💡 SOLUCIÓN: Verificar usuario y contraseña en el string de conexión');
        } else if (error.message.includes('network')) {
            console.log('\n💡 SOLUCIÓN: Verificar conexión a internet y whitelist de IPs en Atlas');
        } else if (error.message.includes('ServerSelectionTimeoutError')) {
            console.log('\n💡 SOLUCIÓN: Verificar que el cluster de Atlas esté activo');
        }
        
        console.log('\n🔧 PASOS PARA VERIFICAR ATLAS:');
        console.log('1. Ir a https://cloud.mongodb.com/');
        console.log('2. Verificar que el cluster esté activo (no pausado)');
        console.log('3. En Network Access, agregar tu IP actual');
        console.log('4. En Database Access, verificar usuario y permisos');
        
    } finally {
        // Desconectar
        await mongoose.disconnect();
        console.log('🔌 Desconectado de MongoDB Atlas');
    }
}

// Función para consultar datos
async function consultarDatosAtlas() {
    try {
        const MONGO_URI = process.env.MONGODB_URI || 
                          process.env.MONGO_URI || 
                          process.env.DATABASE_URL || 
                          process.env.ATLAS_URI ||
                          process.env.MONGODB_URL;
        
        await mongoose.connect(MONGO_URI);
        console.log('📊 Consultando datos en Atlas...\n');
        
        const total = await Frecuencia.countDocuments();
        console.log(`📻 Total de frecuencias: ${total}`);
        
        const conEmail = await Frecuencia.countDocuments({ 
            email: { $ne: null, $ne: '' } 
        });
        console.log(`📧 Con email: ${conEmail}`);
        
        // Estadísticas por rango de frecuencia
        const rangos = [
            { min: 144, max: 145, nombre: '144-145 MHz' },
            { min: 145, max: 146, nombre: '145-146 MHz' },
            { min: 146, max: 147, nombre: '146-147 MHz' },
            { min: 147, max: 148, nombre: '147-148 MHz' }
        ];
        
        console.log('\n📊 Distribución por rangos:');
        for (const rango of rangos) {
            const count = await Frecuencia.countDocuments({
                frecuencia: { $gte: rango.min, $lt: rango.max }
            });
            console.log(`${rango.nombre}: ${count} frecuencias`);
        }
        
        // Buscar grupos específicos
        const grupos = await Frecuencia.find({}, 'grupo frecuencia').limit(10).sort({ frecuencia: 1 });
        console.log('\n📻 Primeros 10 grupos ordenados por frecuencia:');
        grupos.forEach(g => {
            console.log(`${g.frecuencia} MHz - ${g.grupo}`);
        });
        
        await mongoose.disconnect();
        
    } catch (error) {
        console.error('❌ Error consultando:', error.message);
    }
}

// Función para testear conexión a Atlas
async function testAtlasConnection() {
    try {
        const MONGO_URI = process.env.MONGODB_URI || 
                          process.env.MONGO_URI || 
                          process.env.DATABASE_URL || 
                          process.env.ATLAS_URI ||
                          process.env.MONGODB_URL;
        
        if (!MONGO_URI) {
            console.log('❌ No se encontró URI de MongoDB en .env');
            return;
        }
        
        console.log('🔍 Probando conexión a Atlas...');
        await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
        console.log('✅ Conexión a Atlas exitosa!');
        
        const admin = mongoose.connection.db.admin();
        const status = await admin.ping();
        console.log('✅ Ping a Atlas exitoso:', status);
        
        await mongoose.disconnect();
        
    } catch (error) {
        console.error('❌ Error de conexión:', error.message);
    }
}

// Ejecutar según comando
const comando = process.argv[2];

switch (comando) {
    case 'test':
        testAtlasConnection();
        break;
    case 'consultar':
        consultarDatosAtlas();
        break;
    default:
        cargarFrecuenciasAtlas();
}

module.exports = { 
    cargarFrecuenciasAtlas, 
    consultarDatosAtlas, 
    testAtlasConnection,
    Frecuencia,
    Counter 
};