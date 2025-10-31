import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function populateProductionDemo() {
  console.log('🚀 Poblando datos de demostración para producción...');

  try {
    // 1. Crear organización demo principal
    const demoOrg = await prisma.organization.upsert({
      where: { id: 'demo-empresa' },
      update: {},
      create: {
        id: 'demo-empresa',
        name: 'TechCorp Colombia S.A.S',
        description: 'Empresa de tecnología líder en soluciones empresariales'
      }
    });

    // 2. Crear departamentos realistas
    const departments = await Promise.all([
      prisma.department.upsert({
        where: { name_organizationId: { name: 'Gerencia General', organizationId: 'demo-empresa' } },
        update: {},
        create: { name: 'Gerencia General', organizationId: 'demo-empresa' }
      }),
      prisma.department.upsert({
        where: { name_organizationId: { name: 'Recursos Humanos', organizationId: 'demo-empresa' } },
        update: {},
        create: { name: 'Recursos Humanos', organizationId: 'demo-empresa' }
      }),
      prisma.department.upsert({
        where: { name_organizationId: { name: 'Tecnología e Innovación', organizationId: 'demo-empresa' } },
        update: {},
        create: { name: 'Tecnología e Innovación', organizationId: 'demo-empresa' }
      }),
      prisma.department.upsert({
        where: { name_organizationId: { name: 'Ventas y Marketing', organizationId: 'demo-empresa' } },
        update: {},
        create: { name: 'Ventas y Marketing', organizationId: 'demo-empresa' }
      }),
      prisma.department.upsert({
        where: { name_organizationId: { name: 'Finanzas y Contabilidad', organizationId: 'demo-empresa' } },
        update: {},
        create: { name: 'Finanzas y Contabilidad', organizationId: 'demo-empresa' }
      }),
      prisma.department.upsert({
        where: { name_organizationId: { name: 'Operaciones', organizationId: 'demo-empresa' } },
        update: {},
        create: { name: 'Operaciones', organizationId: 'demo-empresa' }
      })
    ]);

    // 3. Crear posiciones ejecutivas
    const positions = await Promise.all([
      prisma.position.upsert({
        where: { title_organizationId: { title: 'CEO - Director Ejecutivo', organizationId: 'demo-empresa' } },
        update: {},
        create: { title: 'CEO - Director Ejecutivo', organizationId: 'demo-empresa', departmentId: departments[0].id }
      }),
      prisma.position.upsert({
        where: { title_organizationId: { title: 'Gerente de Recursos Humanos', organizationId: 'demo-empresa' } },
        update: {},
        create: { title: 'Gerente de Recursos Humanos', organizationId: 'demo-empresa', departmentId: departments[1].id }
      }),
      prisma.position.upsert({
        where: { title_organizationId: { title: 'CTO - Director de Tecnología', organizationId: 'demo-empresa' } },
        update: {},
        create: { title: 'CTO - Director de Tecnología', organizationId: 'demo-empresa', departmentId: departments[2].id }
      }),
      prisma.position.upsert({
        where: { title_organizationId: { title: 'Desarrollador Senior Full Stack', organizationId: 'demo-empresa' } },
        update: {},
        create: { title: 'Desarrollador Senior Full Stack', organizationId: 'demo-empresa', departmentId: departments[2].id }
      }),
      prisma.position.upsert({
        where: { title_organizationId: { title: 'Gerente Comercial', organizationId: 'demo-empresa' } },
        update: {},
        create: { title: 'Gerente Comercial', organizationId: 'demo-empresa', departmentId: departments[3].id }
      }),
      prisma.position.upsert({
        where: { title_organizationId: { title: 'Contador Principal', organizationId: 'demo-empresa' } },
        update: {},
        create: { title: 'Contador Principal', organizationId: 'demo-empresa', departmentId: departments[4].id }
      })
    ]);

    // 4. Crear usuarios demo con roles específicos
    const hashedPassword = await bcrypt.hash('Demo2024!', 10);
    
    const users = await Promise.all([
      prisma.user.upsert({
        where: { email: 'ceo@techcorp-demo.com' },
        update: {},
        create: {
          email: 'ceo@techcorp-demo.com',
          password: hashedPassword,
          role: 'Admin',
          organizationId: 'demo-empresa'
        }
      }),
      prisma.user.upsert({
        where: { email: 'rrhh@techcorp-demo.com' },
        update: {},
        create: {
          email: 'rrhh@techcorp-demo.com',
          password: hashedPassword,
          role: 'Director',
          organizationId: 'demo-empresa'
        }
      }),
      prisma.user.upsert({
        where: { email: 'empleado@techcorp-demo.com' },
        update: {},
        create: {
          email: 'empleado@techcorp-demo.com',
          password: hashedPassword,
          role: 'Usuario',
          organizationId: 'demo-empresa'
        }
      })
    ]);

    // 5. Crear empleados con datos realistas
    const employees = await Promise.all([
      prisma.employee.upsert({
        where: { email_organizationId: { email: 'carlos.rodriguez@techcorp-demo.com', organizationId: 'demo-empresa' } },
        update: {},
        create: {
          firstName: 'Carlos',
          lastName: 'Rodríguez Martínez',
          email: 'carlos.rodriguez@techcorp-demo.com',
          phone: '+57 300 123 4567',
          hireDate: new Date('2020-03-15'),
          salary: 8500000,
          organizationId: 'demo-empresa',
          departmentId: departments[0].id,
          positionId: positions[0].id
        }
      }),
      prisma.employee.upsert({
        where: { email_organizationId: { email: 'maria.gonzalez@techcorp-demo.com', organizationId: 'demo-empresa' } },
        update: {},
        create: {
          firstName: 'María',
          lastName: 'González López',
          email: 'maria.gonzalez@techcorp-demo.com',
          phone: '+57 301 234 5678',
          hireDate: new Date('2021-01-20'),
          salary: 6500000,
          organizationId: 'demo-empresa',
          departmentId: departments[1].id,
          positionId: positions[1].id
        }
      }),
      prisma.employee.upsert({
        where: { email_organizationId: { email: 'andres.silva@techcorp-demo.com', organizationId: 'demo-empresa' } },
        update: {},
        create: {
          firstName: 'Andrés',
          lastName: 'Silva Ramírez',
          email: 'andres.silva@techcorp-demo.com',
          phone: '+57 302 345 6789',
          hireDate: new Date('2019-08-10'),
          salary: 9200000,
          organizationId: 'demo-empresa',
          departmentId: departments[2].id,
          positionId: positions[2].id
        }
      }),
      prisma.employee.upsert({
        where: { email_organizationId: { email: 'laura.martinez@techcorp-demo.com', organizationId: 'demo-empresa' } },
        update: {},
        create: {
          firstName: 'Laura',
          lastName: 'Martínez Herrera',
          email: 'laura.martinez@techcorp-demo.com',
          phone: '+57 303 456 7890',
          hireDate: new Date('2022-05-12'),
          salary: 7800000,
          organizationId: 'demo-empresa',
          departmentId: departments[2].id,
          positionId: positions[3].id
        }
      }),
      prisma.employee.upsert({
        where: { email_organizationId: { email: 'diego.morales@techcorp-demo.com', organizationId: 'demo-empresa' } },
        update: {},
        create: {
          firstName: 'Diego',
          lastName: 'Morales Castro',
          email: 'diego.morales@techcorp-demo.com',
          phone: '+57 304 567 8901',
          hireDate: new Date('2021-11-08'),
          salary: 5800000,
          organizationId: 'demo-empresa',
          departmentId: departments[3].id,
          positionId: positions[4].id
        }
      }),
      prisma.employee.upsert({
        where: { email_organizationId: { email: 'patricia.ruiz@techcorp-demo.com', organizationId: 'demo-empresa' } },
        update: {},
        create: {
          firstName: 'Patricia',
          lastName: 'Ruiz Vargas',
          email: 'patricia.ruiz@techcorp-demo.com',
          phone: '+57 305 678 9012',
          hireDate: new Date('2020-09-25'),
          salary: 6200000,
          organizationId: 'demo-empresa',
          departmentId: departments[4].id,
          positionId: positions[5].id
        }
      })
    ]);

    // 6. Crear períodos de nómina con datos históricos
    const currentYear = new Date().getFullYear();
    const payrollPeriods = [];
    
    for (let month = 1; month <= 12; month++) {
      const startDate = new Date(currentYear, month - 1, 1);
      const endDate = new Date(currentYear, month, 0);
      const payDate = new Date(currentYear, month, 5);
      
      const period = await prisma.payrollPeriod.upsert({
        where: { 
          name_organizationId: { 
            name: `${startDate.toLocaleDateString('es-ES', { month: 'long' })} ${currentYear}`, 
            organizationId: 'demo-empresa' 
          } 
        },
        update: {},
        create: {
          name: `${startDate.toLocaleDateString('es-ES', { month: 'long' })} ${currentYear}`,
          startDate,
          endDate,
          payDate,
          status: month <= new Date().getMonth() ? 'completed' : 'draft',
          organizationId: 'demo-empresa'
        }
      });
      payrollPeriods.push(period);
    }

    // 7. Crear recibos de nómina para períodos completados
    const completedPeriods = payrollPeriods.filter(p => p.status === 'completed');
    
    for (const period of completedPeriods) {
      for (const employee of employees) {
        const baseSalary = employee.salary;
        const overtime = Math.floor(Math.random() * 800000);
        const bonuses = Math.floor(Math.random() * 500000);
        const deductions = Math.floor(baseSalary * 0.04);
        const taxes = Math.floor((baseSalary + overtime + bonuses) * 0.19);
        const netPay = baseSalary + overtime + bonuses - deductions - taxes;
        const hoursWorked = 160 + Math.floor(Math.random() * 20);

        await prisma.payslip.upsert({
          where: { 
            employeeId_payrollPeriodId: { 
              employeeId: employee.id, 
              payrollPeriodId: period.id 
            } 
          },
          update: {},
          create: {
            employeeId: employee.id,
            payrollPeriodId: period.id,
            baseSalary,
            overtime,
            bonuses,
            deductions,
            taxes,
            netPay,
            hoursWorked
          }
        });
      }
    }

    // 8. Crear solicitudes de vacaciones realistas
    const leaveTypes = ['vacation', 'sick', 'personal', 'maternity'];
    const statuses = ['approved', 'pending', 'rejected'];
    
    for (let i = 0; i < 15; i++) {
      const employee = employees[Math.floor(Math.random() * employees.length)];
      const type = leaveTypes[Math.floor(Math.random() * leaveTypes.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 90) - 45);
      
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 10) + 1);
      
      const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

      await prisma.leaveRequest.upsert({
        where: { id: `leave-${i + 1}` },
        update: {},
        create: {
          id: `leave-${i + 1}`,
          employeeId: employee.id,
          type,
          startDate,
          endDate,
          days,
          reason: `Solicitud de ${type} por motivos personales`,
          status,
          organizationId: 'demo-empresa'
        }
      });
    }

    console.log('✅ Datos de demostración creados exitosamente para producción:');
    console.log(`- Organización: ${demoOrg.name}`);
    console.log(`- Departamentos: ${departments.length}`);
    console.log(`- Posiciones: ${positions.length}`);
    console.log(`- Usuarios: ${users.length}`);
    console.log(`- Empleados: ${employees.length}`);
    console.log(`- Períodos de nómina: ${payrollPeriods.length}`);
    console.log(`- Solicitudes de vacaciones: 15`);
    
    console.log('\n🔐 Credenciales de acceso:');
    console.log('CEO: ceo@techcorp-demo.com / Demo2024!');
    console.log('RRHH: rrhh@techcorp-demo.com / Demo2024!');
    console.log('Empleado: empleado@techcorp-demo.com / Demo2024!');

  } catch (error) {
    console.error('❌ Error poblando datos:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  populateProductionDemo()
    .then(() => {
      console.log('🎉 Proceso completado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error:', error);
      process.exit(1);
    });
}

export default populateProductionDemo;