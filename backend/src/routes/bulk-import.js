import express from 'express';
import multer from 'multer';
import ExcelJS from 'exceljs';
import { requireAuth } from '../middleware/auth.js';
import { auditLog } from '../services/audit.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

export default function bulkImportRouter(prisma) {
  router.use(requireAuth);

  // 1. Plantilla de empleados para descarga
  router.get('/templates/employees', async (req, res, next) => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Empleados');

      // Definir columnas
      worksheet.columns = [
        { header: 'Nombres', key: 'firstName', width: 20 },
        { header: 'Apellidos', key: 'lastName', width: 20 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'Título/Cargo', key: 'title', width: 25 },
        { header: 'Departamento', key: 'department', width: 20 },
        { header: 'Fecha Ingreso', key: 'hireDate', width: 15 },
        { header: 'Estado', key: 'status', width: 15 },
        { header: 'Salario Base', key: 'baseSalary', width: 15 },
        { header: 'Teléfono', key: 'phone', width: 15 },
        { header: 'Dirección', key: 'address', width: 30 }
      ];

      // Agregar fila de ejemplo
      worksheet.addRow({
        firstName: 'Juan',
        lastName: 'Pérez García',
        email: 'juan.perez@empresa.com',
        title: 'Desarrollador Senior',
        department: 'Tecnología',
        hireDate: '2024-01-15',
        status: 'active',
        baseSalary: 4500000,
        phone: '3001234567',
        address: 'Calle 123 #45-67, Bogotá'
      });

      // Estilo del header
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=plantilla_empleados.xlsx');

      await workbook.xlsx.write(res);
      res.end();

    } catch (error) {
      next(error);
    }
  });

  // 2. Importar empleados desde Excel
  router.post('/employees', upload.single('file'), async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No se proporcionó archivo' });
      }

      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(req.file.buffer);
      const worksheet = workbook.getWorksheet(1);

      const results = {
        success: 0,
        errors: [],
        created: [],
        updated: []
      };

      // Procesar cada fila (saltando el header)
      for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
        const row = worksheet.getRow(rowNumber);
        
        try {
          const employeeData = {
            firstName: row.getCell(1).value?.toString().trim(),
            lastName: row.getCell(2).value?.toString().trim(),
            email: row.getCell(3).value?.toString().trim().toLowerCase(),
            title: row.getCell(4).value?.toString().trim(),
            departmentName: row.getCell(5).value?.toString().trim(),
            hireDate: row.getCell(6).value,
            status: row.getCell(7).value?.toString().trim() || 'active',
            baseSalary: parseFloat(row.getCell(8).value) || 0,
            phone: row.getCell(9).value?.toString().trim(),
            address: row.getCell(10).value?.toString().trim()
          };

          // Validaciones básicas
          if (!employeeData.firstName || !employeeData.lastName || !employeeData.email) {
            results.errors.push({
              row: rowNumber,
              error: 'Nombres, apellidos y email son obligatorios'
            });
            continue;
          }

          // Buscar o crear departamento
          let department = null;
          if (employeeData.departmentName) {
            department = await prisma.department.upsert({
              where: {
                organizationId_name: {
                  organizationId: req.organizationId,
                  name: employeeData.departmentName
                }
              },
              update: {},
              create: {
                name: employeeData.departmentName,
                organizationId: req.organizationId
              }
            });
          }

          // Verificar si el empleado ya existe
          const existingEmployee = await prisma.employee.findFirst({
            where: {
              organizationId: req.organizationId,
              OR: [
                { user: { email: employeeData.email } },
                {
                  firstName: employeeData.firstName,
                  lastName: employeeData.lastName
                }
              ]
            }
          });

          if (existingEmployee) {
            // Actualizar empleado existente
            const updatedEmployee = await prisma.employee.update({
              where: { id: existingEmployee.id },
              data: {
                title: employeeData.title,
                departmentId: department?.id,
                hireDate: employeeData.hireDate ? new Date(employeeData.hireDate) : null,
                status: employeeData.status
              }
            });

            results.updated.push({
              row: rowNumber,
              employee: `${employeeData.firstName} ${employeeData.lastName}`,
              action: 'updated'
            });
          } else {
            // Crear nuevo empleado
            const newEmployee = await prisma.employee.create({
              data: {
                firstName: employeeData.firstName,
                lastName: employeeData.lastName,
                title: employeeData.title,
                departmentId: department?.id,
                hireDate: employeeData.hireDate ? new Date(employeeData.hireDate) : null,
                status: employeeData.status,
                organizationId: req.organizationId
              }
            });

            results.created.push({
              row: rowNumber,
              employee: `${employeeData.firstName} ${employeeData.lastName}`,
              action: 'created'
            });
          }

          results.success++;

        } catch (error) {
          results.errors.push({
            row: rowNumber,
            error: error.message
          });
        }
      }

      // Registrar auditoría
      auditLog(
        'BULK_IMPORT_EMPLOYEES',
        req.userId,
        req.organizationId,
        {
          resource: req.originalUrl,
          resourceId: 'bulk',
          userAgent: req.get('User-Agent'),
          ip: req.ip,
          changes: {
            totalProcessed: worksheet.rowCount - 1,
            successful: results.success,
            errors: results.errors.length
          }
        }
      );

      res.json(results);

    } catch (error) {
      next(error);
    }
  });

  // 3. Plantilla de competencias
  router.get('/templates/competencies', async (req, res, next) => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Competencias');

      worksheet.columns = [
        { header: 'Nombre Competencia', key: 'name', width: 30 },
        { header: 'Descripción', key: 'description', width: 50 },
        { header: 'Categoría', key: 'category', width: 20 }
      ];

      // Ejemplos
      const examples = [
        { name: 'Liderazgo', description: 'Capacidad para dirigir y motivar equipos', category: 'Gerenciales' },
        { name: 'Comunicación Efectiva', description: 'Habilidad para transmitir ideas claramente', category: 'Interpersonales' },
        { name: 'Pensamiento Analítico', description: 'Capacidad de análisis y resolución de problemas', category: 'Cognitivas' }
      ];

      examples.forEach(example => worksheet.addRow(example));

      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=plantilla_competencias.xlsx');

      await workbook.xlsx.write(res);
      res.end();

    } catch (error) {
      next(error);
    }
  });

  // 4. Importar competencias
  router.post('/competencies', upload.single('file'), async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No se proporcionó archivo' });
      }

      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(req.file.buffer);
      const worksheet = workbook.getWorksheet(1);

      const results = { success: 0, errors: [], created: [] };

      for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
        const row = worksheet.getRow(rowNumber);
        
        try {
          const competencyData = {
            name: row.getCell(1).value?.toString().trim(),
            description: row.getCell(2).value?.toString().trim(),
            categoryName: row.getCell(3).value?.toString().trim()
          };

          if (!competencyData.name || !competencyData.categoryName) {
            results.errors.push({
              row: rowNumber,
              error: 'Nombre y categoría son obligatorios'
            });
            continue;
          }

          // Buscar o crear categoría
          const category = await prisma.category.upsert({
            where: {
              organizationId_name: {
                organizationId: req.organizationId,
                name: competencyData.categoryName
              }
            },
            update: {},
            create: {
              name: competencyData.categoryName,
              organizationId: req.organizationId
            }
          });

          // Crear competencia
          await prisma.competency.upsert({
            where: {
              organizationId_name: {
                organizationId: req.organizationId,
                name: competencyData.name
              }
            },
            update: {
              description: competencyData.description
            },
            create: {
              name: competencyData.name,
              description: competencyData.description,
              categoryId: category.id,
              organizationId: req.organizationId
            }
          });

          results.created.push({
            row: rowNumber,
            competency: competencyData.name,
            category: competencyData.categoryName
          });
          results.success++;

        } catch (error) {
          results.errors.push({
            row: rowNumber,
            error: error.message
          });
        }
      }

      res.json(results);

    } catch (error) {
      next(error);
    }
  });

  // 5. Plantilla de posiciones
  router.get('/templates/positions', async (req, res, next) => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Posiciones');

      worksheet.columns = [
        { header: 'Nombre Posición', key: 'name', width: 30 },
        { header: 'Descripción', key: 'description', width: 50 },
        { header: 'Nivel', key: 'level', width: 15 },
        { header: 'Departamento', key: 'department', width: 20 }
      ];

      const examples = [
        { name: 'Gerente General', description: 'Dirección estratégica de la organización', level: 'Ejecutivo', department: 'Gerencia' },
        { name: 'Desarrollador Full Stack', description: 'Desarrollo de aplicaciones web', level: 'Profesional', department: 'Tecnología' }
      ];

      examples.forEach(example => worksheet.addRow(example));

      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=plantilla_posiciones.xlsx');

      await workbook.xlsx.write(res);
      res.end();

    } catch (error) {
      next(error);
    }
  });

  return router;
}