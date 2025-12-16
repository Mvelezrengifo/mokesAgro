const express = require('express');
const router = express.Router();
const { register, login, getProfile } = require('../controllers/authController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Rutas públicas
router.post('/register', register);
router.post('/login', login);

// Rutas protegidas
router.get('/profile', authenticateToken, getProfile);

// Crear empleado (solo ingenieros)
router.post('/create-employee', authenticateToken, requireRole(['engineer']), register);

module.exports = router;