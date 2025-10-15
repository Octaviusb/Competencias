let PDFDocument, ExcelJS;
try {
  PDFDocument = (await import('pdfkit')).default;
  ExcelJS = (await import('exceljs')).default;
} catch (e) {
  console.warn('PDF/Excel libraries not available - reports disabled');
}

export class ReportsService {
  async generateEmployeeReport(organizationId, format = 'pdf') {
    const employees = await prisma.employee.findMany({
      where: { organizationId },
      include: { department: true, observations: true, interviews: true }
    });

    if (format === 'pdf') {
      return this.generateEmployeePDF(employees);
    } else if (format === 'excel') {
      return this.generateEmployeeExcel(employees);
    }
  }

  generateEmployeePDF(employees) {
    if (!PDFDocument) {
      throw new Error('PDF generation not available');
    }
    const doc = new PDFDocument();
    const chunks = [];

    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => Buffer.concat(chunks));

    doc.fontSize(20).text('Reporte de Empleados', 100, 100);
    
    let y = 150;
    employees.forEach(emp => {
      doc.fontSize(12)
         .text(`${emp.firstName} ${emp.lastName}`, 100, y)
         .text(`Departamento: ${emp.department?.name || 'N/A'}`, 100, y + 15)
         .text(`Observaciones: ${emp.observations?.length || 0}`, 100, y + 30);
      y += 60;
    });

    doc.end();
    return Buffer.concat(chunks);
  }

  async generateEmployeeExcel(employees) {
    if (!ExcelJS) {
      throw new Error('Excel generation not available');
    }
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Empleados');

    worksheet.columns = [
      { header: 'Nombre', key: 'firstName', width: 15 },
      { header: 'Apellido', key: 'lastName', width: 15 },
      { header: 'Departamento', key: 'department', width: 20 },
      { header: 'Observaciones', key: 'observations', width: 15 }
    ];

    employees.forEach(emp => {
      worksheet.addRow({
        firstName: emp.firstName,
        lastName: emp.lastName,
        department: emp.department?.name || 'N/A',
        observations: emp.observations?.length || 0
      });
    });

    return await workbook.xlsx.writeBuffer();
  }
}