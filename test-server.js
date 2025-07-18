const express = require('express');
const app = express();

app.get('/api/videos', (req, res) => {
    console.log('📡 Ruta /api/videos funcionando!');
    res.json([{ id: 1, title: "Funciona!" }]);
});

app.listen(3002, () => {
    console.log('🧪 Servidor de prueba en puerto 3002');
});