require('dotenv').config();
const mongoose = require('mongoose');

// Ajusta tu URI si no usas process.env
const uri = process.env.MONGO_URI || "mongodb+srv://<usuario>:<clave>@cluster.mongodb.net/test";

const counterSchema = new mongoose.Schema({
  _id: String,
  sequence_value: Number
});

const Counter = mongoose.model('Counter', counterSchema);

async function resetCounters() {
  try {
    await mongoose.connect(uri);
    console.log("✅ Conectado a MongoDB");

    await Counter.updateOne(
      { _id: "inscripciones_NRO" },
      { $set: { sequence_value: 1 } },
      { upsert: true }
    );
    console.log("🔄 inscripciones_NRO seteado a 1");

    await Counter.updateOne(
      { _id: "inscripciones_N_equipo" },
      { $set: { sequence_value: 1 } },
      { upsert: true }
    );
    console.log("🔄 inscripciones_N_equipo seteado a 1");

    const allCounters = await Counter.find({});
    console.log("📊 Contadores actuales:", allCounters);

    console.log("🎉 Contadores reiniciados con éxito");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

resetCounters();
