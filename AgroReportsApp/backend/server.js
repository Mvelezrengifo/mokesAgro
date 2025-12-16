const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { sequelize } = require('./models');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const reportRoutes = require('./routes/reports');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reports', reportRoutes);

// Ruta para compartir por WhatsApp
app.get('/api/share/whatsapp/:reportId', async (req, res) => {
  try {
    const { reportId } = req.params;
    const { Report } = require('./models');
    
    const report = await Report.findByPk(reportId);
    if (!report || !report.pdfPath) {
      return res.status(404).json({ error: 'Informe o PDF no encontrado' });
    }

    const pdfUrl = `${req.protocol}://${req.get('host')}/uploads/pdfs/${path.basename(report.pdfPath)}`;
    const message = `Informe Agropecuario: ${report.title}\\nAutor: ${report.authorName}\\nFecha: ${new Date(report.date).toLocaleDateString('es-ES')}\\n\\nDescargar PDF: ${pdfUrl}`;
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    
    res.json({ whatsappUrl });
  } catch (error) {
    res.status(500).json({ error: 'Error al generar enlace de WhatsApp: ' + error.message });
  }
});

// Ruta de salud
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Servidor funcionando correctamente' });
});

// Manejo de errores
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Inicializar base de datos y servidor
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida');
    
    await sequelize.sync({ force: false });
    console.log('✅ Modelos sincronizados');
    
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
      console.log(`📱 API disponible en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar servidor:', error);
    process.exit(1);
  }
};

startServer();