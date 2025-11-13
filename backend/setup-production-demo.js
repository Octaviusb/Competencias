import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function setupProductionDemo() {
  try {
    console.log('🚀 Configurando demo para producción...');

    // Verificar si ya existe la organización
    let organization = await prisma.organization.findUnique({
      where: { name: 'demo-org' }
    });

    if (!organization) {
      organization = await prisma.organization.create({
        data: { name: 'demo-org' }
      });
    }

    // Crear roles si no existen
    const roles = [];
    const roleNames = ['admin', 'manager', 'employee', 'hr'];
    
    for (const roleName of roleNames) {
      let role = await prisma.role.findFirst({
        where: { name: roleName, organizationId: organization.id }
      });
      
      if (!role) {
        role = await prisma.role.create({
          data: { name: roleName, organizationId: organization.id }
        });
      }
      roles.push(role);
    }

    // Crear usuarios demo
    const hashedPassword = await bcrypt.hash('demo123', 10);
    const psychoPassword = await bcrypt.hash('psycho123', 10);

    // Usuario admin
    let adminUser = await prisma.user.findFirst({
      where: { email: 'admin@demo.com', organizationId: organization.id }
    });

    if (!adminUser) {
      adminUser = await prisma.user.create({
        data: {
          email: 'admin@demo.com',
          passwordHash: hashedPassword,
          organizationId: organization.id,
          isActive: true
        }
      });

      await prisma.userRole.create({
        data: { userId: adminUser.id, roleId: roles[0].id }
      });
    }

    // Usuario psicólogo
    let psychoUser = await prisma.user.findFirst({
      where: { email: 'psicologo@demo.com', organizationId: organization.id }
    });

    if (!psychoUser) {
      psychoUser = await prisma.user.create({
        data: {
          email: 'psicologo@demo.com',
          passwordHash: psychoPassword,
          organizationId: organization.id,
          isActive: true
        }
      });

      await prisma.userRole.create({
        data: { userId: psychoUser.id, roleId: roles[3].id }
      });
    }

    // Crear datos básicos si no existen
    const deptCount = await prisma.department.count({
      where: { organizationId: organization.id }
    });

    if (deptCount === 0) {
      // Crear departamentos
      const departments = await Promise.all([
        prisma.department.create({ data: { name: 'Recursos Humanos', organizationId: organization.id } }),
        prisma.department.create({ data: { name: 'Tecnología', organizationId: organization.id } }),
        prisma.department.create({ data: { name: 'Ventas', organizationId: organization.id } })
      ]);

      // Crear categorías
      const categories = await Promise.all([
        prisma.category.create({ data: { name: 'Técnicas', organizationId: organization.id } }),
        prisma.category.create({ data: { name: 'Interpersonales', organizationId: organization.id } }),
        prisma.category.create({ data: { name: 'Gerenciales', organizationId: organization.id } })
      ]);

      // Crear competencias
      await Promise.all([
        prisma.competency.create({ data: { name: 'Liderazgo', description: 'Capacidad de liderazgo', categoryId: categories[2].id, organizationId: organization.id } }),
        prisma.competency.create({ data: { name: 'Comunicación', description: 'Habilidad comunicativa', categoryId: categories[1].id, organizationId: organization.id } }),
        prisma.competency.create({ data: { name: 'Programación', description: 'Desarrollo de software', categoryId: categories[0].id, organizationId: organization.id } })
      ]);

      // Crear posiciones
      const positions = await Promise.all([
        prisma.position.create({ data: { name: 'Gerente de Ventas', description: 'Liderazgo comercial', departmentId: departments[2].id, organizationId: organization.id } }),
        prisma.position.create({ data: { name: 'Desarrollador Senior', description: 'Desarrollo de software', departmentId: departments[1].id, organizationId: organization.id } })
      ]);

      // Crear análisis de puestos y perfiles psicométricos
      for (const position of positions) {
        const jobAnalysis = await prisma.jobAnalysis.create({
          data: {
            positionId: position.id,
            organizationId: organization.id,
            purpose: `Análisis para ${position.name}`,
            departmentId: position.departmentId
          }
        });

        const weights = position.name === 'Gerente de Ventas' 
          ? { opennessWeight: 15, conscientiousnessWeight: 25, extraversionWeight: 35, agreeablenessWeight: 15, neuroticismWeight: 10 }
          : { opennessWeight: 30, conscientiousnessWeight: 30, extraversionWeight: 10, agreeablenessWeight: 20, neuroticismWeight: 10 };

        await prisma.psychometricProfile.create({
          data: {
            jobAnalysisId: jobAnalysis.id,
            organizationId: organization.id,
            ...weights
          }
        });
      }

      // Crear candidatos
      const candidates = await Promise.all([
        prisma.candidate.create({ data: { firstName: 'Ana', lastName: 'García', email: 'ana.garcia@email.com', organizationId: organization.id } }),
        prisma.candidate.create({ data: { firstName: 'Carlos', lastName: 'López', email: 'carlos.lopez@email.com', organizationId: organization.id } })
      ]);

      console.log('✅ Datos demo creados');
    }

    console.log('\n🎉 Demo configurado para producción!');
    console.log('\n📋 CREDENCIALES:');
    console.log('Admin: admin@demo.com / demo123');
    console.log('Psicólogo: psicologo@demo.com / psycho123');
    console.log('Organización: demo-org');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupProductionDemo();