// move-data.js
// Script para mover datos de 'test' a 'desafio-nazca'

const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://mmolina:y7PvbObCzvpcqSwM@desafio-nazca.08bcyv0.mongodb.net/?retryWrites=true&w=majority&appName=desafio-nazca'
//'mongodb+srv://mmolina:TU_PASSWORD@desafio-nazca.xxxxx.mongodb.net/?retryWrites=true&w=majority';

async function moveData() {
    try {
        console.log('🔄 Moviendo datos de "test" a "desafio-nazca"...\n');
        
        await mongoose.connect(MONGODB_URI);
        
        // Acceder a ambas bases de datos
        const testDB = mongoose.connection.client.db('test');
        const targetDB = mongoose.connection.client.db('desafio-nazca');
        
        // Leer datos de test.frecuencias
        console.log('📖 Leyendo datos de test.frecuencias...');
        const data = await testDB.collection('frecuencias').find().toArray();
        console.log(`✅ Encontrados ${data.length} documentos`);
        
        if (data.length === 0) {
            console.log('❌ No hay datos para mover');
            return;
        }
        
        // Limpiar colección destino
        console.log('🧹 Limpiando desafio-nazca.frecuencias...');
        await targetDB.collection('frecuencias').deleteMany({});
        
        // Insertar datos en destino
        console.log('💾 Insertando datos en desafio-nazca.frecuencias...');
        await targetDB.collection('frecuencias').insertMany(data);
        console.log(`✅ ${data.length} documentos movidos exitosamente`);
        
        // Verificar
        const count = await targetDB.collection('frecuencias').countDocuments();
        console.log(`📊 Verificación: ${count} documentos en desafio-nazca.frecuencias`);
        
        console.log('\n🎉 ¡Datos movidos exitosamente!');
        console.log('💡 Ahora puedes cambiar tu servidor para usar:');
        console.log('   /desafio-nazca en lugar de /test');
        
        await mongoose.disconnect();
        
    } catch (error) {
        console.error('❌ Error moviendo datos:', error);
    }
}

moveData();