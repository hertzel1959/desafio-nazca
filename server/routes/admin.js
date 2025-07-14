const express = require('express');
const router = express.Router();

// Placeholder para rutas de administración
router.get('/dashboard', (req, res) => {
    res.json({ message: 'Admin dashboard - En desarrollo' });
});

module.exports = router;