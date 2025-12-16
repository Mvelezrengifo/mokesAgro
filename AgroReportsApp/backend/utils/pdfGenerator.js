const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const generatePDF = async (report) => {
  try {
    // Crear directorio si no existe
    const pdfDir = path.join(__dirname, '../uploads/pdfs');
    if (!fs.existsSync(pdfDir)) {
      fs.mkdirSync(pdfDir, { recursive: true });
    }

    const fileName = `informe_${report.id}_${Date.now()}.pdf`;
    const filePath = path.join(pdfDir, fileName);

    // Template HTML para el PDF
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo-placeholder { width: 100px; height: 100px; border: 2px dashed #ccc; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; }
            .title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
            .subtitle { font-size: 16px; color: #666; }
            .section { margin: 20px 0; }
            .section-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; border-bottom: 2px solid #333; }
            .field { margin: 10px 0; }
            .field-label { font-weight: bold; }
            .problems-grid, .materials-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin: 10px 0; }
            .checkbox-item { padding: 5px; border: 1px solid #ddd; }
            .selected { background-color: #e8f5e8; }
            .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="logo-placeholder">[LOGO AQUÍ]</div>
            <div class="title">[NOMBRE DE LA APP]</div>
            <div class="subtitle">Informe Técnico Agropecuario</div>
        </div>

        <div class="section">
            <div class="section-title">Información General</div>
            <div class="field">
                <span class="field-label">Título:</span> ${report.title}
            </div>
            <div class="field">
                <span class="field-label">Autor:</span> ${report.authorName}
            </div>
            <div class="field">
                <span class="field-label">Ubicación:</span> ${report.location || 'No especificada'}
            </div>
            <div class="field">
                <span class="field-label">Fecha:</span> ${new Date(report.date).toLocaleDateString('es-ES')}
            </div>
        </div>

        <div class="section">
            <div class="section-title">Problemas Identificados</div>
            <div class="problems-grid">
                ${generateProblemsHTML(report.problems)}
            </div>
        </div>

        <div class="section">
            <div class="section-title">Materiales Utilizados/Recomendados</div>
            <div class="materials-grid">
                ${generateMaterialsHTML(report.materials)}
            </div>
        </div>

        <div class="section">
            <div class="section-title">Observaciones</div>
            <p>${report.observations || 'Sin observaciones registradas.'}</p>
        </div>

        <div class="section">
            <div class="section-title">Recomendaciones</div>
            <p>${report.recommendations || 'Sin recomendaciones específicas.'}</p>
        </div>

        ${report.images && report.images.length > 0 ? `
        <div class="section">
            <div class="section-title">Imágenes Adjuntas</div>
            <p>Se adjuntaron ${report.images.length} imagen(es) al informe.</p>
        </div>
        ` : ''}

        <div class="footer">
            <p>Informe generado automáticamente el ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}</p>
            <p>ID del Informe: ${report.id}</p>
        </div>
    </body>
    </html>
    `;

    // Usar html-pdf para generar el PDF
    const pdf = require('html-pdf');
    
    return new Promise((resolve, reject) => {
      pdf.create(htmlContent, {
        format: 'A4',
        border: {
          top: '0.5in',
          right: '0.5in',
          bottom: '0.5in',
          left: '0.5in'
        }
      }).toFile(filePath, (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(filePath);
        }
      });
    });

  } catch (error) {
    throw new Error('Error generando PDF: ' + error.message);
  }
};

const generateProblemsHTML = (problems) => {
  const allProblems = [
    'Virus en plantas',
    'Virus en animales', 
    'Bacterias en plantas',
    'Bacterias en animales',
    'Plagas de insectos',
    'Hongos',
    'Malezas',
    'Deficiencias nutricionales',
    'Problemas de riego',
    'Enfermedades parasitarias',
    'Otros problemas'
  ];

  return allProblems.map(problem => {
    const isSelected = problems && problems.includes(problem);
    return `<div class="checkbox-item ${isSelected ? 'selected' : ''}">
      ${isSelected ? '✓' : '☐'} ${problem}
    </div>`;
  }).join('');
};

const generateMaterialsHTML = (materials) => {
  const allMaterials = [
    'Herbicidas',
    'Fungicidas',
    'Insecticidas',
    'Fertilizantes NPK',
    'Fertilizantes orgánicos',
    'Antibióticos',
    'Vacunas',
    'Desparasitantes',
    'Suplementos nutricionales',
    'Semillas mejoradas',
    'Otros materiales'
  ];

  return allMaterials.map(material => {
    const isSelected = materials && materials.includes(material);
    return `<div class="checkbox-item ${isSelected ? 'selected' : ''}">
      ${isSelected ? '✓' : '☐'} ${material}
    </div>`;
  }).join('');
};

module.exports = { generatePDF };