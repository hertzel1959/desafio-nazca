// reload-desafio-nazca.js
// Recarga los datos del Excel directamente en desafio-nazca.frecuencias

const mongoose = require('mongoose');
const XLSX = require('xlsx');

// 🔗 String que conecta directamente a desafio-nazca
const MONGODB_URI = 'mongodb+srv://mmolina:y7PvbObCzvpcqSwM@desafio-nazca.08bcyv0.mongodb.net/?retryWrites=true&w=majority&appName=desafio-nazca'
'mongodb+srv://mmolina:TU_PASSWORD@desafio-nazca.xxxxx.mongodb.net/desafio-nazca?retryWrites=true&w=majority';

async function reloadToDesafioNazca() {
    try {
        console.log('🚀 Recargando datos en desafio-nazca.frecuencias...\n');
        
        // 1. Verificar archivo Excel
        const fs = require('fs');
        if (!fs.existsSync('Frecuencias.xlsx')) {
            console.error('❌ No se encontró Frecuencias.xlsx');
            console.log('📁 Asegúrate de que esté en la misma carpeta');
            return;
        }
        
        // 2. Conectar a MongoDB
        console.log('📡 Conectando a Atlas...');
        await mongoose.connect(MONGODB_URI);
        console.log(`✅ Conectado a: ${mongoose.connection.name}`);
        
        // 3. Leer archivo Excel
        console.log('📖 Leyendo Frecuencias.xlsx...');
        const workbook = XLSX.readFile('Frecuencias.xlsx');
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(worksheet);
        console.log(`✅ Leídos ${data.length} registros del Excel`);
        
        // 4. Acceder directamente a la base de datos
        const db = mongoose.connection.db;
        const collection = db.collection('frecuencias');
        
        // 5. Limpiar colección existente
        console.log('🧹 Limpiando datos anteriores...');
        const deleteResult = await collection.deleteMany({});
        console.log(`✅ Eliminados ${deleteResult.deletedCount} documentos anteriores`);
        
        // 6. Procesar y cargar nuevos datos
        console.log('💾 Cargando nuevos datos...');
        const documentos = [];
        
        for (let i = 0; i < data.length; i++) {
            const registro = data[i];
            
            // Validar datos mínimos
            if (!registro.GRUPO || !registro.FRECUENCIAS) {
                console.warn(`⚠️  Saltando registro ${i + 1} (datos incompletos)`);
                continue;
            }
            
            const documento = {
                id: i + 1,  // ID secuencial
                grupo: registro.GRUPO.toString().trim(),
                frecuencia: parseFloat(registro.FRECUENCIAS),
                email: registro.EMAIL?.toString().trim() || '',
                contacto: registro.CONTACTO?.toString().trim() || '',
                telefono: registro.TELEFONO?.toString().trim() || '',
                activo: true,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            
            documentos.push(documento);
        }
        
        // 7. Insertar todos los documentos
        if (documentos.length > 0) {
            const insertResult = await collection.insertMany(documentos);
            console.log(`✅ Insertados ${insertResult.insertedCount} documentos`);
        }
        
        // 8. Verificar resultado final
        const totalFinal = await collection.countDocuments();
        console.log(`📊 Total final en desafio-nazca.frecuencias: ${totalFinal}`);
        
        // 9. Mostrar algunas muestras
        if (totalFinal > 0) {
            const muestras = await collection.find().limit(5).sort({ id: 1 }).toArray();
            console.log('\n📻 Primeras 5 frecuencias:');
            muestras.forEach(f => {
                console.log(`  ID: ${f.id} | ${f.frecuencia} MHz | ${f.grupo}`);
            });
        }
        
        // 10. Crear índices
        console.log('\n📊 Creando índices...');
        await collection.createIndex({ id: 1 }, { unique: true });
        await collection.createIndex({ frecuencia: 1 });
        await collection.createIndex({ grupo: 1 });
        console.log('✅ Índices creados');
        
        console.log('\n🎉 ¡Recarga completada exitosamente!');
        console.log('📍 Datos cargados en: desafio-nazca.frecuencias');
        console.log('💡 Ahora tu servidor debe usar: /desafio-nazca');
        
        await mongoose.disconnect();
        
    } catch (error) {
        console.error('\n❌ Error durante la recarga:', error.message);
        
        if (error.message.includes('authentication')) {
            console.log('💡 Verifica usuario y contraseña');
        } else if (error.code === 'ENOENT') {
            console.log('💡 Verifica que Frecuencias.xlsx esté en la carpeta actual');
        }
    }
}

// Función adicional para limpiar BD test (opcional)
async function cleanTestDatabase() {
    try {
        console.log('\n🗑️  ¿Quieres limpiar la base de datos test? (Y/N)');
        
        // Para automatizar, puedes cambiar esto a true
        const shouldClean = false; // Cambiar a true si quieres limpiar test automáticamente
        
        if (shouldClean) {
            console.log('🧹 Limpiando base de datos test...');
            const testDB = mongoose.connection.client.db('test');
            await testDB.collection('frecuencias').deleteMany({});
            console.log('✅ Base de datos test limpiada');
        }
        
    } catch (error) {
        console.log('⚠️  Error limpiando test:', error.message);
    }
}

// Ejecutar
async function main() {
    await reloadToDesafioNazca();
    // await cleanTestDatabase(); // Descomenta si quieres limpiar test
}

main();