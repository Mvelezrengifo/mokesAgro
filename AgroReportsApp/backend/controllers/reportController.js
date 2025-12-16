const { Report, User } = require('../models');
const { generatePDF } = require('../utils/pdfGenerator');
const path = require('path');
const fs = require('fs');

const createReport = async (req, res) => {
  try {
    const {
      title,
      authorName,
      location,
      problems,
      materials,
      observations,
      recommendations
    } = req.body;

    const report = await Report.create({
      title,
      authorName,
      location,
      problems: problems || [],
      materials: materials || [],
      observations,
      recommendations,
      userId: req.user.id,
      images: req.files ? req.files.map(file => file.filename) : []
    });

    res.status(201).json({
      message: 'Informe creado exitosamente',
      report
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear informe: ' + error.message });
  }
};

const getReports = async (req, res) => {
  try {
    let whereClause = {};
    
    // Si es empleado, solo ve sus propios informes
    if (req.user.role === 'employee') {
      whereClause.userId = req.user.id;
    } else if (req.user.role === 'engineer') {
      // Si es ingeniero, ve todos los informes de sus empleados y los suyos
      const employees = await User.findAll({
        where: { createdBy: req.user.id },
        attributes: ['id']
      });
      
      const employeeIds = employees.map(emp => emp.id);
      employeeIds.push(req.user.id); // Incluir sus propios informes
      
      whereClause.userId = employeeIds;
    }

    const reports = await Report.findAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'user',
        attributes: ['name', 'email']
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json({ reports });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener informes: ' + error.message });
  }
};

const getReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    
    const report = await Report.findOne({
      where: { id: reportId },
      include: [{
        model: User,
        as: 'user',
        attributes: ['name', 'email']
      }]
    });

    if (!report) {
      return res.status(404).json({ error: 'Informe no encontrado' });
    }

    // Verificar permisos
    if (req.user.role === 'employee' && report.userId !== req.user.id) {
      return res.status(403).json({ error: 'No tienes permisos para ver este informe' });
    }

    res.json({ report });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener informe: ' + error.message });
  }
};

const generateReportPDF = async (req, res) => {
  try {
    const { reportId } = req.params;
    
    const report = await Report.findByPk(reportId);
    if (!report) {
      return res.status(404).json({ error: 'Informe no encontrado' });
    }

    const pdfPath = await generatePDF(report);
    
    // Actualizar el informe con la ruta del PDF
    report.pdfPath = pdfPath;
    report.status = 'completed';
    await report.save();

    res.json({ 
      message: 'PDF generado exitosamente',
      pdfPath: `/uploads/pdfs/${path.basename(pdfPath)}`
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al generar PDF: ' + error.message });
  }
};

const deleteReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    
    const report = await Report.findByPk(reportId);
    if (!report) {
      return res.status(404).json({ error: 'Informe no encontrado' });
    }

    // Solo ingenieros pueden eliminar informes
    if (req.user.role !== 'engineer') {
      return res.status(403).json({ error: 'No tienes permisos para eliminar informes' });
    }

    // Eliminar archivos asociados
    if (report.pdfPath && fs.existsSync(report.pdfPath)) {
      fs.unlinkSync(report.pdfPath);
    }

    if (report.images && report.images.length > 0) {
      report.images.forEach(image => {
        const imagePath = path.join(__dirname, '../uploads/images', image);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      });
    }

    await report.destroy();

    res.json({ message: 'Informe eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar informe: ' + error.message });
  }
};

module.exports = {
  createReport,
  getReports,
  getReport,
  generateReportPDF,
  deleteReport
};