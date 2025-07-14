// cargador-frecuencias-corregido.js
// Versión corregida: solo ID es único, frecuencias pueden duplicarse

const mongoose = require('mongoose');
const XLSX = require('xlsx');

// 🔗 REEMPLAZA CON TU STRING DE CONEXIÓN REAL
const MONGODB_URI = 'mongodb+srv://mmolina:y7PvbObCzvpcqSwM@desafio-nazca.08bcyv0.mongodb.net/?retryWrites=true&w=majority&appName=desafio-nazca'


// Esquema corregido - SOLO el ID es único
const frecuenciaSchema = new mongoose.Schema({
    id: {
        type: Number,
        unique: true,        // ✅ Solo el ID es único
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
        // ❌ Removimos unique: true - las frecuencias pueden duplicarse
    },
    email: String,
    contacto: String,
    telefono: String,
    activo: { type: Boolean, default: true }
}, { timestamps: true });

// Índices para optimizar consultas (sin restricción unique en frecuencia)
frecuenciaSchema.index({ frecuencia: 1 });  // Para búsquedas rápidas
frecuenciaSchema.index({ grupo: 1 });       // Para búsquedas por grupo
frecuenciaSchema.index({ activo: 1 });      // Para filtrar activos

const Frecuencia = mongoose.model('Frecuencia', frecuenciaSchema);

async function limpiarIndicesYCargar() {
    console.log('🚀 Iniciando carga corregida...\n');
    
    try {
        // 1. Conectar
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Conectado a Atlas');
        
        // 2. IMPORTANTE: Eliminar colección existente para limpiar índices
        console.log('🧹 Limpiando colección y sus índices...');
        await mongoose.connection.db.collection('frecuencias').drop().catch(() => {
            console.log('ℹ️  Colección no existía, continuando...');
        });
        console.log('✅ Colección limpiada');
        
        // 3. Leer Excel
        console.log('📖 Leyendo archivo Excel...');
        const workbook = XLSX.readFile('Frecuencias.xlsx');
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(worksheet);
        console.log(`✅ Encontrados ${data.length} registros`);
        
        // 4. Cargar TODOS los datos
        console.log('💾 Cargando todos los datos...');
        let insertados = 0;
        let errores = 0;
        
        for (let i = 0; i < data.length; i++) {
            const registro = data[i];
            
            try {
                const nuevaFrecuencia = new Frecuencia({
                    id: i + 1,  // ID secuencial: 1, 2, 3, 4...
                    grupo: registro.GRUPO?.toString().trim() || '',
                    frecuencia: parseFloat(registro.FRECUENCIAS) || 0,
                    email: registro.EMAIL?.toString().trim() || '',
                    contacto: registro.CONTACTO?.toString().trim() || '',
                    telefono: registro.TELEFONO?.toString().trim() || ''
                });
                
                await nuevaFrecuencia.save();
                insertados++;
                
                if (insertados % 10 === 0) {
                    console.log(`⏳ Procesados: ${insertados}/${data.length}`);
                }
                
            } catch (error) {
                console.error(`❌ Error en registro ${i + 1}: ${error.message}`);
                errores++;
            }
        }
        
        // 5. Crear índices optimizados (sin unique en frecuencia)
        console.log('📊 Creando índices optimizados...');
        await Frecuencia.collection.createIndex({ id: 1 }, { unique: true });
        await Frecuencia.collection.createIndex({ frecuencia: 1 });
        await Frecuencia.collection.createIndex({ grupo: 1 });
        console.log('✅ Índices creados');
        
        // 6. Resumen final
        console.log('\n📊 RESUMEN FINAL:');
        console.log(`✅ Insertados: ${insertados}`);
        console.log(`❌ Errores: ${errores}`);
        console.log(`📊 Total en Atlas: ${await Frecuencia.countDocuments()}`);
        
        // 7. Verificar frecuencias duplicadas
        const frecuenciasDuplicadas = await Frecuencia.aggregate([
            { $group: { _id: "$frecuencia", count: { $sum: 1 } } },
            { $match: { count: { $gt: 1 } } },
            { $sort: { _id: 1 } }
        ]);
        
        if (frecuenciasDuplicadas.length > 0) {
            console.log('\n📻 Frecuencias que aparecen múltiples veces:');
            frecuenciasDuplicadas.forEach(dup => {
                console.log(`${dup._id} MHz: ${dup.count} veces`);
            });
        }
        
        // 8. Mostrar ejemplos
        const ejemplos = await Frecuencia.find().limit(5).sort({ id: 1 });
        console.log('\n📻 Primeros 5 registros:');
        ejemplos.forEach(f => {
            console.log(`ID: ${f.id} | ${f.frecuencia} MHz | ${f.grupo}`);
        });
        
        console.log('\n🎉 ¡Carga completada exitosamente!');
        console.log('✅ Ahora las frecuencias pueden duplicarse, solo el ID es único');
        
    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Desconectado');
    }
}

// Función para buscar frecuencias duplicadas
async function buscarDuplicadas() {
    try {
        await mongoose.connect(MONGODB_URI);
        
        console.log('🔍 Buscando frecuencias duplicadas...\n');
        
        const duplicadas = await Frecuencia.aggregate([
            { $group: { 
                _id: "$frecuencia", 
                count: { $sum: 1 },
                grupos: { $push: { id: "$id", grupo: "$grupo" } }
            }},
            { $match: { count: { $gt: 1 } } },
            { $sort: { _id: 1 } }
        ]);
        
        if (duplicadas.length === 0) {
            console.log('✅ No hay frecuencias duplicadas');
        } else {
            console.log(`📊 Encontradas ${duplicadas.length} frecuencias duplicadas:\n`);
            
            duplicadas.forEach(dup => {
                console.log(`🔄 Frecuencia ${dup._id} MHz (${dup.count} veces):`);
                dup.grupos.forEach(g => {
                    console.log(`   ID: ${g.id} - ${g.grupo}`);
                });
                console.log('');
            });
        }
        
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await mongoose.disconnect();
    }
}

// Función para consultar datos
async function consultarTodos() {
    try {
        await mongoose.connect(MONGODB_URI);
        
        const total = await Frecuencia.countDocuments();
        console.log(`📊 Total de registros: ${total}\n`);
        
        // Estadísticas por rango
        const rangos = [
            { min: 144, max: 145, nombre: '144-145 MHz' },
            { min: 145, max: 146, nombre: '145-146 MHz' },
            { min: 146, max: 147, nombre: '146-147 MHz' },
            { min: 147, max: 148, nombre: '147-148 MHz' },
            { min: 148, max: 149, nombre: '148-149 MHz' }
        ];
        
        console.log('📊 Distribución por rangos:');
        for (const rango of rangos) {
            const count = await Frecuencia.countDocuments({
                frecuencia: { $gte: rango.min, $lt: rango.max }
            });
            console.log(`${rango.nombre}: ${count} registros`);
        }
        
        // Mostrar todos los registros ordenados
        console.log('\n📻 Todos los registros ordenados por ID:');
        const todos = await Frecuencia.find().sort({ id: 1 });
        
        todos.forEach(f => {
            const email = f.email ? ` | ${f.email}` : '';
            const contacto = f.contacto ? ` | ${f.contacto}` : '';
            console.log(`ID: ${f.id} | ${f.frecuencia} MHz | ${f.grupo}${email}${contacto}`);
        });
        
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await mongoose.disconnect();
    }
}

// Ejecutar según comando
const comando = process.argv[2];

switch (comando) {
    case 'duplicadas':
        buscarDuplicadas();
        break;
    case 'todos':
        consultarTodos();
        break;
    default:
        limpiarIndicesYCargar();
}

module.exports = { 
    limpiarIndicesYCargar, 
    buscarDuplicadas, 
    consultarTodos 
};