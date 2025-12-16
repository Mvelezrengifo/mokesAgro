const express = require('express');
const router = express.Router();
const { getEmployees, toggleEmployeeStatus, deleteEmployee } = require('../controllers/userController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Todas las rutas requieren autenticación y rol de ingeniero
router.use(authenticateToken);
router.use(requireRole(['engineer']));

router.get('/employees', getEmployees);
router.patch('/employees/:employeeId/toggle-status', toggleEmployeeStatus);
router.delete('/employees/:employeeId', deleteEmployee);

module.exports = router;