// Servicio para manejar contadores autoincrementales
const mongoose = require('mongoose');

class CounterService {
  constructor() {
    this.counters = new Map(); // Cache en memoria
  }

  // Inicializar contador para una colección
  async initCounter(collectionName, fieldName = 'NRO') {
    try {
      console.log(`🔢 Inicializando contador para ${collectionName}.${fieldName}...`);
      
      const db = mongoose.connection.db;
      const collection = db.collection(collectionName);
      
      // Obtener el MAX actual (equivalente a SQL MAX())
      const result = await collection.findOne(
        { [fieldName]: { $exists: true, $type: "number" } },
        { sort: { [fieldName]: -1 } }
      );
      
      const maxValue = result ? result[fieldName] : 0;
      const nextValue = maxValue + 1;
      
      // Guardar en memoria (como tu constante en SQL)
      const key = `${collectionName}_${fieldName}`;
      this.counters.set(key, nextValue);
      
      console.log(`✅ Contador ${key} inicializado: próximo valor = ${nextValue}`);
      
      return nextValue;
    } catch (error) {
      console.error(`❌ Error inicializando contador:`, error);
      throw error;
    }
  }

  // Obtener y incrementar (como tu @nextId++)
  getNextValue(collectionName, fieldName = 'NRO') {
    const key = `${collectionName}_${fieldName}`;
    
    if (!this.counters.has(key)) {
      throw new Error(`Contador ${key} no inicializado. Llama initCounter() primero.`);
    }
    
    const currentValue = this.counters.get(key);
    const nextValue = currentValue + 1;
    
    // Incrementar para la próxima vez
    this.counters.set(key, nextValue);
    
    console.log(`🔢 Asignando ${fieldName}: ${currentValue}`);
    
    return currentValue;
  }

  // Obtener valor actual sin incrementar
  getCurrentValue(collectionName, fieldName = 'NRO') {
    const key = `${collectionName}_${fieldName}`;
    return this.counters.get(key) || 0;
  }

  // Resetear contador (útil para testing)
  async resetCounter(collectionName, fieldName = 'NRO') {
    await this.initCounter(collectionName, fieldName);
  }
}

// Singleton - una sola instancia para toda la app
const counterService = new CounterService();

module.exports = counterService;