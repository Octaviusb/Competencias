import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function populateDemoData() {
  console.log('🚀 Poblando datos de demostración...');

  try {
    // 1. Crear organización demo
    const demoOrg = await prisma.organization.upsert({
      where: { id: 'demo-org' },
      update: {},
      create: {
        id: 'demo-org',
        name: 'Empresa Demo',
        description: 'Organización de demostración para pruebas'
      }
    });

    // 2. Crear departamentos
    const departments = await Promise.all([
      prisma.department.upsert({
        where: { name_organizationId: { name: 'Recursos Humanos', organizationId: 'demo-org' } },
        update: {},
        create: { name: 'Recursos Humanos', organizationId: 'demo-org' }
      }),
      prisma.department.upsert({
        where: { name_organizationId: { name: 'Tecnología', organizationId: 'demo-org' } },
        update: {},
        create: { name: 'Tecnología', organizationId: 'demo-org' }
      }),
      prisma.department.upsert({
        where: { name_organizationId: { name: 'Ventas', organizationId: 'demo-org' } },
        update: {},
        create: { name: 'Ventas', organizationId: 'demo-org' }
      }),
      prisma.department.upsert({
        where: { name_organizationId: { name: 'Marketing', organizationId: 'demo-org' } },
        update: {},
        create: { name: 'Marketing', organizationId: 'demo-org' }
      })
    ]);

    // 3. Crear posiciones
    const positions = await Promise.all([
      prisma.position.upsert({
        where: { title_organizationId: { title: 'Gerente de RRHH', organizationId: 'demo-org' } },
        update: {},
        create: { title: 'Gerente de RRHH', organizationId: 'demo-org', departmentId: departments[0].id }
      }),
      prisma.position.upsert({
        where: { title_organizationId: { title: 'Desarrollador Senior', organizationId: 'demo-org' } },
        update: {},
        create: { title: 'Desarrollador Senior', organizationId: 'demo-org', departmentId: departments[1].id }
      }),
      prisma.position.upsert({
        where: { title_organizationId: { title: 'Ejecutivo de Ventas', organizationId: 'demo-org' } },
        update: {},
        create: { title: 'Ejecutivo de Ventas', organizationId: 'demo-org', departmentId: departments[2].id }
      }),
      prisma.position.upsert({
        where: { title_organizationId: { title: 'Especialista en Marketing', organizationId: 'demo-org' } },
        update: {},
        create: { title: 'Especialista en Marketing', organizationId: 'demo-org', departmentId: departments[3].id }
      })
    ]);

    // 4. Crear usuarios demo
    const hashedPassword = await bcrypt.hash('demo123', 10);
    
    const users = await Promise.all([
      prisma.user.upsert({
        where: { email: 'admin@demo.com' },
        update: {},
        create: {
          email: 'admin@demo.com',
          password: hashedPassword,
          role: 'Admin',
          organizationId: 'demo-org'
        }
      }),
      prisma.user.upsert({
        where: { email: 'director@demo.com' },
        update: {},
        create: {
          email: 'director@demo.com',
          password: hashedPassword,
          role: 'Director',
          organizationId: 'demo-org'
        }
      }),
      prisma.user.upsert({
        where: { email: 'usuario@demo.com' },
        update: {},
        create: {
          email: 'usuario@demo.com',
          password: hashedPassword,
          role: 'Usuario',
          organizationId: 'demo-org'
        }
      })
    ]);

    // 5. Crear empleados
    const employees = await Promise.all([
      prisma.employee.upsert({
        where: { email_organizationId: { email: 'maria.garcia@demo.com', organizationId: 'demo-org' } },
        update: {},
        create: {
          firstName: 'María',
          lastName: 'García',
          email: 'maria.garcia@demo.com',
          phone: '+57 300 123 4567',
          hireDate: new Date('2022-01-15'),
          salary: 4500000,
          organizationId: 'demo-org',
          departmentId: departments[0].id,
          positionId: positions[0].id
        }
      }),
      prisma.employee.upsert({
        where: { email_organizationId: { email: 'carlos.rodriguez@demo.com', organizationId: 'demo-org' } },
        update: {},
        create: {
          firstName: 'Carlos',
          lastName: 'Rodríguez',
          email: 'carlos.rodriguez@demo.com',
          phone: '+57 301 234 5678',
          hireDate: new Date('2021-06-10'),
          salary: 6000000,
          organizationId: 'demo-org',
          departmentId: departments[1].id,
          positionId: positions[1].id
        }
      }),
      prisma.employee.upsert({
        where: { email_organizationId: { email: 'ana.martinez@demo.com', organizationId: 'demo-org' } },
        update: {},
        create: {
          firstName: 'Ana',
          lastName: 'Martínez',
          email: 'ana.martinez@demo.com',
          phone: '+57 302 345 6789',
          hireDate: new Date('2023-03-20'),
          salary: 3800000,
          organizationId: 'demo-org',
          departmentId: departments[2].id,
          positionId: positions[2].id
        }
      }),
      prisma.employee.upsert({
        where: { email_organizationId: { email: 'luis.hernandez@demo.com', organizationId: 'demo-org' } },
        update: {},
        create: {
          firstName: 'Luis',
          lastName: 'Hernández',
          email: 'luis.hernandez@demo.com',
          phone: '+57 303 456 7890',
          hireDate: new Date('2022-09-05'),
          salary: 4200000,
          organizationId: 'demo-org',
          departmentId: departments[3].id,
          positionId: positions[3].id
        }
      })
    ]);

    // 6. Crear períodos de nómina
    const payrollPeriods = await Promise.all([
      prisma.payrollPeriod.upsert({
        where: { name_organizationId: { name: 'Enero 2024', organizationId: 'demo-org' } },
        update: {},
        create: {
          name: 'Enero 2024',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-31'),
          payDate: new Date('2024-02-05'),
          status: 'completed',
          organizationId: 'demo-org'
        }
      }),
      prisma.payrollPeriod.upsert({
        where: { name_organizationId: { name: 'Febrero 2024', organizationId: 'demo-org' } },
        update: {},
        create: {
          name: 'Febrero 2024',
          startDate: new Date('2024-02-01'),
          endDate: new Date('2024-02-29'),
          payDate: new Date('2024-03-05'),
          status: 'draft',
          organizationId: 'demo-org'
        }
      })
    ]);

    // 7. Crear recibos de nómina para el período completado
    const payslips = [];
    for (const employee of employees) {
      const baseSalary = employee.salary;
      const overtime = Math.floor(Math.random() * 500000);
      const bonuses = Math.floor(Math.random() * 300000);
      const deductions = Math.floor(baseSalary * 0.04); // 4% deducción
      const taxes = Math.floor((baseSalary + overtime + bonuses) * 0.19); // 19% impuestos
      const netPay = baseSalary + overtime + bonuses - deductions - taxes;
      const hoursWorked = 160 + Math.floor(Math.random() * 20);

      const payslip = await prisma.payslip.upsert({
        where: { 
          employeeId_payrollPeriodId: { 
            employeeId: employee.id, 
            payrollPeriodId: payrollPeriods[0].id 
          } 
        },
        update: {},
        create: {
          employeeId: employee.id,
          payrollPeriodId: payrollPeriods[0].id,
          baseSalary,
          overtime,
          bonuses,
          deductions,
          taxes,
          netPay,
          hoursWorked
        }
      });
      payslips.push(payslip);
    }

    // 8. Crear solicitudes de vacaciones
    const leaveRequests = await Promise.all([
      prisma.leaveRequest.upsert({
        where: { id: 'leave-1' },
        update: {},
        create: {
          id: 'leave-1',
          employeeId: employees[0].id,
          type: 'vacation',
          startDate: new Date('2024-03-15'),
          endDate: new Date('2024-03-22'),
          days: 8,
          reason: 'Vacaciones familiares',
          status: 'approved',
          organizationId: 'demo-org'
        }
      }),
      prisma.leaveRequest.upsert({
        where: { id: 'leave-2' },
        update: {},
        create: {
          id: 'leave-2',
          employeeId: employees[1].id,
          type: 'sick',
          startDate: new Date('2024-02-10'),
          endDate: new Date('2024-02-12'),
          days: 3,
          reason: 'Incapacidad médica',
          status: 'approved',
          organizationId: 'demo-org'
        }
      }),
      prisma.leaveRequest.upsert({
        where: { id: 'leave-3' },
        update: {},
        create: {
          id: 'leave-3',
          employeeId: employees[2].id,
          type: 'personal',
          startDate: new Date('2024-03-01'),
          endDate: new Date('2024-03-01'),
          days: 1,
          reason: 'Asuntos personales',
          status: 'pending',
          organizationId: 'demo-org'
        }
      })
    ]);

    // 9. Crear registros de asistencia
    const attendanceRecords = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Solo días laborales
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        for (const employee of employees) {
          const checkIn = new Date(date);
          checkIn.setHours(8 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60));
          
          const checkOut = new Date(date);
          checkOut.setHours(17 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60));
          
          const hoursWorked = (checkOut - checkIn) / (1000 * 60 * 60);

          try {
            const attendance = await prisma.attendance.upsert({
              where: { 
                employeeId_date: { 
                  employeeId: employee.id, 
                  date: date.toISOString().split('T')[0] 
                } 
              },
              update: {},
              create: {
                employeeId: employee.id,
                date: date.toISOString().split('T')[0],
                checkIn,
                checkOut,
                hoursWorked,
                organizationId: 'demo-org'
              }
            });
            attendanceRecords.push(attendance);
          } catch (error) {
            // Ignorar duplicados
          }
        }
      }
    }

    // 10. Crear vacantes de reclutamiento
    const jobPostings = await Promise.all([
      prisma.jobPosting.upsert({
        where: { title_organizationId: { title: 'Desarrollador Full Stack', organizationId: 'demo-org' } },
        update: {},
        create: {
          title: 'Desarrollador Full Stack',
          description: 'Buscamos desarrollador con experiencia en React y Node.js',
          requirements: 'Mínimo 3 años de experiencia, conocimientos en JavaScript, React, Node.js',
          salary: 5500000,
          status: 'active',
          departmentId: departments[1].id,
          organizationId: 'demo-org'
        }
      }),
      prisma.jobPosting.upsert({
        where: { title_organizationId: { title: 'Analista de Marketing Digital', organizationId: 'demo-org' } },
        update: {},
        create: {
          title: 'Analista de Marketing Digital',
          description: 'Especialista en campañas digitales y análisis de métricas',
          requirements: 'Experiencia en Google Ads, Facebook Ads, Analytics',
          salary: 3500000,
          status: 'active',
          departmentId: departments[3].id,
          organizationId: 'demo-org'
        }
      })
    ]);

    // 11. Crear cursos de capacitación
    const trainingCourses = await Promise.all([
      prisma.trainingCourse.upsert({
        where: { title_organizationId: { title: 'Liderazgo Efectivo', organizationId: 'demo-org' } },
        update: {},
        create: {
          title: 'Liderazgo Efectivo',
          description: 'Curso sobre técnicas de liderazgo y gestión de equipos',
          duration: 40,
          instructor: 'Dr. Patricia Ruiz',
          status: 'active',
          organizationId: 'demo-org'
        }
      }),
      prisma.trainingCourse.upsert({
        where: { title_organizationId: { title: 'Tecnologías Emergentes', organizationId: 'demo-org' } },
        update: {},
        create: {
          title: 'Tecnologías Emergentes',
          description: 'Actualización en nuevas tecnologías de desarrollo',
          duration: 60,
          instructor: 'Ing. Roberto Silva',
          status: 'active',
          organizationId: 'demo-org'
        }
      })
    ]);

    console.log('✅ Datos de demostración creados exitosamente:');
    console.log(`- Organización: ${demoOrg.name}`);
    console.log(`- Departamentos: ${departments.length}`);
    console.log(`- Posiciones: ${positions.length}`);
    console.log(`- Usuarios: ${users.length}`);
    console.log(`- Empleados: ${employees.length}`);
    console.log(`- Períodos de nómina: ${payrollPeriods.length}`);
    console.log(`- Recibos de nómina: ${payslips.length}`);
    console.log(`- Solicitudes de vacaciones: ${leaveRequests.length}`);
    console.log(`- Registros de asistencia: ${attendanceRecords.length}`);
    console.log(`- Vacantes: ${jobPostings.length}`);
    console.log(`- Cursos: ${trainingCourses.length}`);

  } catch (error) {
    console.error('❌ Error poblando datos:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  populateDemoData()
    .then(() => {
      console.log('🎉 Proceso completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error:', error);
      process.exit(1);
    });
}

export default populateDemoData;