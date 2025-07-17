const mongoose = require('mongoose');
const counterService = require('../server/services/counterService');
require('dotenv').config();

// Conectar a MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/desafio-nazca';

async function initDatabase() {
  try {
    console.log('🔗 Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    const db = mongoose.connection.db;

    // 1. CREAR COLECCIÓN INSCRIPCIONES
    console.log('📋 Creando colección inscripciones...');
    
    try {
      await db.createCollection('inscripciones', {
        validator: {
          $jsonSchema: {
            bsonType: "object",
            required: ["tripulante", "grupo", "nombres", "apellidos", "edad", "dni", "email", "celular"],
            properties: {
              NRO: { bsonType: "number" },
              N_equipo: { bsonType: "number" },
              tripulante: { 
                bsonType: "string",
                enum: ["piloto", "copiloto", "acompañante1", "acompañante2", "acompañante3"]
              },
              grupo: { bsonType: "string" },
              nombres: { bsonType: "string", minLength: 2, maxLength: 50 },
              apellidos: { bsonType: "string", minLength: 2, maxLength: 50 },
              edad: { bsonType: "number", minimum: 16, maximum: 80 },
              experiencia: {
                bsonType: "string",
                enum: ["Experto", "Intermedio", "Principiante"]
              },
              grupoSanguineo: {
                bsonType: "string", 
                enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
              },
              dni: { bsonType: "string", pattern: "^[0-9]{8}$" },
              email: { bsonType: "string" },
              tipoVehiculo: {
                bsonType: "string",
                enum: ["moto", "cuatrimoto", "UTV", "arenero", "camioneta"]
              },
              diaLlegada: {
                bsonType: "string",
                enum: ["miercoles","jueves", "viernes", "sabado"]
              },
              estado: {
                bsonType: "string",
                enum: ["PENDIENTE", "CONFIRMADO", "CANCELADO"]
              },
              activo: { bsonType: "bool" }
            }
          }
        }
      });
      console.log('✅ Colección inscripciones creada');
    } catch (error) {
      if (error.code === 48) {
        console.log('ℹ️ Colección inscripciones ya existe');
      } else {
        throw error;
      }
    }

    // 2. CREAR ÍNDICES
    console.log('🔍 Creando índices...');
    
    const inscripcionesCollection = db.collection('inscripciones');
    
    const indices = [
      // Índices únicos
      { key: { email: 1 }, options: { unique: true, name: 'email_unique' } },
      { key: { dni: 1 }, options: { unique: true, name: 'dni_unique' } },
      { key: { NRO: 1 }, options: { unique: true, name: 'nro_unique' } },
      
      // Índice compuesto para equipos
      { 
        key: { N_equipo: 1, tripulante: 1 }, 
        options: { 
          unique: true, 
          name: 'equipo_tripulante_unique',
          partialFilterExpression: { activo: true }
        } 
      },
      
      // Índices de consulta
      { key: { N_equipo: 1 }, options: { name: 'n_equipo_index' } },
      { key: { tripulante: 1 }, options: { name: 'tripulante_index' } },
      { key: { grupo: 1 }, options: { name: 'grupo_index' } },
      { key: { estado: 1 }, options: { name: 'estado_index' } },
      { key: { tipoVehiculo: 1 }, options: { name: 'tipo_vehiculo_index' } },
      { key: { diaLlegada: 1 }, options: { name: 'dia_llegada_index' } },
      { key: { experiencia: 1 }, options: { name: 'experiencia_index' } },
      { key: { fechaInscripcion: -1 }, options: { name: 'fecha_inscripcion_desc' } },
      { key: { activo: 1 }, options: { name: 'activo_index' } }
    ];

    for (const indice of indices) {
      try {
        await inscripcionesCollection.createIndex(indice.key, indice.options);
        console.log(`✅ Índice creado: ${indice.options.name}`);
      } catch (error) {
        if (error.code === 85) {
          console.log(`ℹ️ Índice ya existe: ${indice.options.name}`);
        } else {
          console.error(`❌ Error creando índice ${indice.options.name}:`, error.message);
        }
      }
    }

    // 3. INICIALIZAR CONTADORES
    console.log('🔢 Inicializando contadores...');
    await counterService.initCounter('inscripciones', 'NRO');
    await counterService.initCounter('inscripciones', 'N_equipo');
    console.log('✅ Contadores inicializados');

    // 4. INSERTAR DATOS DE PRUEBA (OPCIONAL)
    console.log('📝 ¿Insertar datos de prueba? (y/n)');
    
    // Para automatizar, cambiar a true si quieres datos de prueba
    const insertTestData = false;
    
    if (insertTestData) {
      console.log('📝 Insertando datos de prueba...');
      
      const testData = [
        {
          NRO: 1,
          N_equipo: 1,
          tripulante: "piloto",
          grupo: "Fugitivos",
          liderGrupo: "RADIO LIMA",
          nombres: "Juan Carlos",
          apellidos: "Rodriguez Martinez",
          edad: 35,
          experiencia: "Experto",
          grupoSanguineo: "O+",
          dni: "12345678",
          email: "juan.rodriguez@email.com",
          celular: "+51 987654321",
          personaContacto: "Maria Rodriguez",
          celularContacto: "+51 987654322",
          tipoVehiculo: "moto",
          marca: "Honda",
          modelo: "CRF450",
          año: 2023,
          frecuencia: 157.55,
          frecuenciaGrupo: "Fugitivos",
          diaLlegada: "viernes",
          estado: "PENDIENTE",
          observaciones: "Piloto con experiencia en rally",
          fechaInscripcion: new Date(),
          activo: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          NRO: 2,
          N_equipo: 1,
          tripulante: "copiloto",
          grupo: "Fugitivos",
          liderGrupo: "RADIO LIMA",
          nombres: "Luis Miguel",
          apellidos: "Garcia Torres",
          edad: 28,
          experiencia: "Intermedio",
          grupoSanguineo: "A+",
          dni: "87654321",
          email: "luis.garcia@email.com",
          celular: "+51 987654323",
          personaContacto: "Ana Garcia",
          celularContacto: "+51 987654324",
          tipoVehiculo: "moto",
          marca: "Honda",
          modelo: "CRF450",
          año: 2023,
          frecuencia: 157.55,
          frecuenciaGrupo: "Fugitivos",
          diaLlegada: "viernes",
          estado: "PENDIENTE",
          observaciones: "Copiloto experimentado",
          fechaInscripcion: new Date(),
          activo: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      await inscripcionesCollection.insertMany(testData);
      console.log('✅ Datos de prueba insertados');
    }

    console.log('\n🎉 ¡Base de datos inicializada correctamente!');
    console.log('📊 Resumen:');
    console.log('   ✅ Colección inscripciones creada');
    console.log('   ✅ Índices configurados');
    console.log('   ✅ Contadores inicializados');
    console.log('   ✅ Sistema listo para usar');

  } catch (error) {
    console.error('❌ Error inicializando base de datos:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
    process.exit(0);
  }
}

// Ejecutar el script
initDatabase();