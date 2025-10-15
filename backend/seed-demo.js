import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function seedDemo() {
  const orgId = 'demo-org';

  try {
    console.log('🌱 Starting demo data seeding...');

    // Create demo organization if it doesn't exist
    const demoOrg = await prisma.organization.upsert({
      where: { id: orgId },
      update: {},
      create: { id: orgId, name: 'Organización Demo' },
    });
    console.log('✅ Organization created');

    // Create admin user for demo
    const adminUser = await prisma.user.upsert({
      where: { organizationId_email: { email: 'admin@demo.com', organizationId: orgId } },
      update: {},
      create: {
        email: 'admin@demo.com',
        passwordHash: process.env.DEMO_PASSWORD_HASH || '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6fYzYXkqO',
        isActive: true,
        organizationId: orgId,
        employee: {
          create: {
            firstName: 'Admin',
            lastName: 'Demo',
            title: 'Administrador',
            organizationId: orgId,
          },
        },
        roles: {
          create: [{
            role: {
              connectOrCreate: {
                where: { name_organizationId: { name: 'admin', organizationId: orgId } },
                create: { name: 'admin', organizationId: orgId }
              }
            }
          }],
        },
      },
    });
    console.log('✅ Admin user created');

    // Seed Departments
    const departments = ['Ingeniería', 'Recursos Humanos', 'Ventas', 'Operaciones'];
    for (const name of departments) {
      await prisma.department.upsert({
        where: { organizationId_name: { organizationId: orgId, name } },
        update: {},
        create: { organizationId: orgId, name },
      });
    }
    console.log('✅ Departments created');

    // Seed Categories
    const categories = ['Habilidades Blandas', 'Habilidades Técnicas'];
    const categoryIds = {};
    for (const name of categories) {
      const cat = await prisma.category.upsert({
        where: { organizationId_name: { organizationId: orgId, name } },
        update: {},
        create: { organizationId: orgId, name },
      });
      categoryIds[name] = cat.id;
    }
    console.log('✅ Categories created');

    // Seed basic competencies
    const competenciesToCreate = [
      { name: 'Comunicación', description: 'Capacidad para expresar ideas claramente', category: 'Habilidades Blandas' },
      { name: 'Trabajo en equipo', description: 'Colabora efectivamente con otros', category: 'Habilidades Blandas' },
      { name: 'JavaScript', description: 'Dominio del lenguaje JS', category: 'Habilidades Técnicas' },
    ];
    for (const c of competenciesToCreate) {
      await prisma.competency.upsert({
        where: { organizationId_name: { organizationId: orgId, name: c.name } },
        update: { description: c.description, categoryId: categoryIds[c.category] },
        create: { organizationId: orgId, name: c.name, description: c.description, categoryId: categoryIds[c.category] },
      });
    }
    console.log('✅ Competencies created');

    // Seed basic employees
    const deps = await prisma.department.findMany({ where: { organizationId: orgId } });
    const depMap = Object.fromEntries(deps.map(d => [d.name, d.id]));

    const employees = [
      { firstName: 'Ana', lastName: 'García', title: 'Desarrolladora', department: 'Ingeniería' },
      { firstName: 'Luis', lastName: 'Pérez', title: 'Líder Técnico', department: 'Ingeniería' },
      { firstName: 'María', lastName: 'López', title: 'HR Partner', department: 'Recursos Humanos' },
    ];

    for (const e of employees) {
      const exists = await prisma.employee.findFirst({
        where: { firstName: e.firstName, lastName: e.lastName, organizationId: orgId },
      });
      if (!exists) {
        await prisma.employee.create({
          data: {
            firstName: e.firstName,
            lastName: e.lastName,
            title: e.title,
            departmentId: depMap[e.department] || null,
            organizationId: orgId,
          },
        });
      }
    }
    console.log('✅ Employees created');

    // Seed leave balances
    const allEmployees = await prisma.employee.findMany({ where: { organizationId: orgId } });
    const currentYear = new Date().getFullYear();
    for (const emp of allEmployees) {
      await prisma.leaveBalance.upsert({
        where: { employeeId_year: { employeeId: emp.id, year: currentYear } },
        update: {},
        create: {
          employeeId: emp.id,
          year: currentYear,
          vacationDays: 20,
          sickDays: 10,
          personalDays: 5,
          organizationId: orgId,
        },
      });
    }
    console.log('✅ Leave balances created');

    console.log('🎉 Demo data seeding completed successfully!');
    console.log('📧 Admin login: admin@demo.com / password: demo123');
    console.log('🏢 Organization ID: demo-org');

  } catch (error) {
    console.error('❌ Error seeding demo data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedDemo();