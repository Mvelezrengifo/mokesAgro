const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { 
  createReport, 
  getReports, 
  getReport, 
  generateReportPDF, 
  deleteReport 
} = require('../controllers/reportController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Configuración de multer para subida de imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/images'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB límite
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif)'));
    }
  }
});

// Todas las rutas requieren autenticación
router.use(authenticateToken);

router.post('/', upload.array('images', 5), createReport);
router.get('/', getReports);
router.get('/:reportId', getReport);
router.post('/:reportId/generate-pdf', generateReportPDF);
router.delete('/:reportId', requireRole(['engineer']), deleteReport);

module.exports = router;