// find-data.js
// Script para encontrar dónde están los datos de frecuencias

const mongoose = require('mongoose');

// 🔗 CAMBIAR POR TU STRING REAL (SIN especificar base de datos al final)
const MONGODB_URI = 'mongodb+srv://mmolina:y7PvbObCzvpcqSwM@desafio-nazca.08bcyv0.mongodb.net/?retryWrites=true&w=majority'
// 'mongodb+srv://mmolina:y7PvbObCzvpcqSwM@desafio-nazca.08bcyv0.mongodb.net/?retryWrites=true&w=majority&appName=desafio-nazca'
// 'mongodb+srv://mmolina:TU_PASSWORD@desafio-nazca.xxxxx.mongodb.net/?retryWrites=true&w=majority';

async function findData() {
    try {
        console.log('🔍 Buscando datos de frecuencias en todo el cluster...\n');
        
        // Conectar sin especificar base de datos
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Conectado al cluster');
        
        // Listar todas las bases de datos
        const admin = mongoose.connection.db.admin();
        const databases = await admin.listDatabases();
        
        console.log('📊 Bases de datos encontradas:');
        databases.databases.forEach(db => {
            console.log(`  - ${db.name} (${db.sizeOnDisk} bytes)`);
        });
        
        console.log('\n🔍 Buscando frecuencias en cada base de datos:');
        
        // Buscar en cada base de datos
        for (const dbInfo of databases.databases) {
            const dbName = dbInfo.name;
            
            // Saltar bases de datos del sistema
            if (['admin', 'local', 'config'].includes(dbName)) {
                continue;
            }
            
            console.log(`\n📁 Revisando base de datos: ${dbName}`);
            
            try {
                const db = mongoose.connection.client.db(dbName);
                const collections = await db.listCollections().toArray();
                
                console.log(`  Colecciones: ${collections.map(c => c.name).join(', ')}`);
                
                // Buscar colección 'frecuencias'
                const frecuenciasCollection = collections.find(c => 
                    c.name === 'frecuencias' || 
                    c.name === 'Frecuencias' || 
                    c.name === 'frecuencia'
                );
                
                if (frecuenciasCollection) {
                    const collection = db.collection(frecuenciasCollection.name);
                    const count = await collection.countDocuments();
                    
                    console.log(`  ✅ ENCONTRADA: ${frecuenciasCollection.name} con ${count} documentos`);
                    
                    if (count > 0) {
                        // Mostrar algunos ejemplos
                        const samples = await collection.find().limit(3).toArray();
                        console.log(`  📻 Muestras:`);
                        samples.forEach((doc, i) => {
                            console.log(`    ${i + 1}: ID=${doc.id}, Grupo="${doc.grupo}", Freq=${doc.frecuencia}`);
                        });
                        
                        // Esta es la configuración correcta
                        console.log(`\n🎯 CONFIGURACIÓN CORRECTA PARA TU SERVIDOR:`);
                        console.log(`Base de datos: ${dbName}`);
                        console.log(`Colección: ${frecuenciasCollection.name}`);
                        console.log(`String de conexión: mongodb+srv://mmolina:password@desafio-nazca.xxxxx.mongodb.net/${dbName}`);
                    }
                } else {
                    console.log(`  ❌ No se encontró colección de frecuencias`);
                }
                
            } catch (error) {
                console.log(`  ❌ Error accediendo a ${dbName}: ${error.message}`);
            }
        }
        
        await mongoose.disconnect();
        console.log('\n🔌 Búsqueda completada');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

findData();