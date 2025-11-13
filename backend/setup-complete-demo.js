import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function setupCompleteDemo() {
  try {
    console.log('🚀 Configurando demo completo del sistema...');

    // Limpiar y crear organización demo
    await prisma.organization.deleteMany({});
    
    const organization = await prisma.organization.create({
      data: { name: 'demo-org' }
    });

    console.log('✅ Organización demo creada');

    // Crear roles
    const roles = await Promise.all([
      prisma.role.create({ data: { name: 'admin', organizationId: organization.id } }),
      prisma.role.create({ data: { name: 'manager', organizationId: organization.id } }),
      prisma.role.create({ data: { name: 'employee', organizationId: organization.id } }),
      prisma.role.create({ data: { name: 'hr', organizationId: organization.id } })
    ]);

    console.log('✅ Roles creados');

    // Crear usuarios demo
    const hashedPassword = await bcrypt.hash('demo123', 10);
    const psychoPassword = await bcrypt.hash('psycho123', 10);

    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@demo.com',
        passwordHash: hashedPassword,
        organizationId: organization.id,
        isActive: true
      }
    });

    const psychoUser = await prisma.user.create({
      data: {
        email: 'psicologo@demo.com',
        passwordHash: psychoPassword,
        organizationId: organization.id,
        isActive: true
      }
    });

    // Asignar roles
    await prisma.userRole.create({
      data: { userId: adminUser.id, roleId: roles[0].id }
    });

    await prisma.userRole.create({
      data: { userId: psychoUser.id, roleId: roles[3].id }
    });

    console.log('✅ Usuarios demo creados');

    // Crear departamentos
    const departments = await Promise.all([
      prisma.department.create({ data: { name: 'Recursos Humanos', organizationId: organization.id } }),
      prisma.department.create({ data: { name: 'Tecnología', organizationId: organization.id } }),
      prisma.department.create({ data: { name: 'Ventas', organizationId: organization.id } }),
      prisma.department.create({ data: { name: 'Marketing', organizationId: organization.id } })
    ]);

    console.log('✅ Departamentos creados');

    // Crear categorías de competencias
    const categories = await Promise.all([
      prisma.category.create({ data: { name: 'Técnicas', organizationId: organization.id } }),
      prisma.category.create({ data: { name: 'Interpersonales', organizationId: organization.id } }),
      prisma.category.create({ data: { name: 'Gerenciales', organizationId: organization.id } }),
      prisma.category.create({ data: { name: 'Cognitivas', organizationId: organization.id } })
    ]);

    console.log('✅ Categorías de competencias creadas');

    // Crear competencias
    const competencies = [
      { name: 'Liderazgo', description: 'Capacidad para dirigir equipos', categoryId: categories[2].id },
      { name: 'Comunicación', description: 'Habilidad comunicativa efectiva', categoryId: categories[1].id },
      { name: 'Programación', description: 'Desarrollo de software', categoryId: categories[0].id },
      { name: 'Análisis', description: 'Pensamiento analítico', categoryId: categories[3].id },
      { name: 'Trabajo en Equipo', description: 'Colaboración efectiva', categoryId: categories[1].id }
    ];

    for (const comp of competencies) {
      await prisma.competency.create({
        data: { ...comp, organizationId: organization.id }
      });
    }

    console.log('✅ Competencias creadas');

    // Crear posiciones
    const positions = [
      { name: 'Gerente de Ventas', description: 'Liderazgo comercial', departmentId: departments[2].id },
      { name: 'Desarrollador Senior', description: 'Desarrollo de software', departmentId: departments[1].id },
      { name: 'Analista de Marketing', description: 'Análisis de mercado', departmentId: departments[3].id },
      { name: 'Especialista en RRHH', description: 'Gestión de talento', departmentId: departments[0].id }
    ];

    const createdPositions = [];
    for (const pos of positions) {
      const position = await prisma.position.create({
        data: { ...pos, organizationId: organization.id }
      });
      createdPositions.push(position);
    }

    console.log('✅ Posiciones creadas');

    // Crear análisis de puestos y perfiles psicométricos
    for (const position of createdPositions) {
      const jobAnalysis = await prisma.jobAnalysis.create({
        data: {
          positionId: position.id,
          organizationId: organization.id,
          purpose: `Análisis completo para ${position.name}`,
          departmentId: position.departmentId
        }
      });

      // Perfiles psicométricos específicos por puesto
      let weights;
      switch (position.name) {
        case 'Gerente de Ventas':
          weights = { opennessWeight: 15, conscientiousnessWeight: 25, extraversionWeight: 35, agreeablenessWeight: 15, neuroticismWeight: 10 };
          break;
        case 'Desarrollador Senior':
          weights = { opennessWeight: 30, conscientiousnessWeight: 30, extraversionWeight: 10, agreeablenessWeight: 20, neuroticismWeight: 10 };
          break;
        case 'Analista de Marketing':
          weights = { opennessWeight: 25, conscientiousnessWeight: 20, extraversionWeight: 20, agreeablenessWeight: 25, neuroticismWeight: 10 };
          break;
        default:
          weights = { opennessWeight: 20, conscientiousnessWeight: 20, extraversionWeight: 20, agreeablenessWeight: 20, neuroticismWeight: 20 };
      }

      await prisma.psychometricProfile.create({
        data: {
          jobAnalysisId: jobAnalysis.id,
          organizationId: organization.id,
          ...weights
        }
      });
    }

    console.log('✅ Análisis de puestos y perfiles psicométricos creados');

    // Crear candidatos de ejemplo
    const candidates = [
      { firstName: 'Ana', lastName: 'García', email: 'ana.garcia@email.com' },
      { firstName: 'Carlos', lastName: 'López', email: 'carlos.lopez@email.com' },
      { firstName: 'María', lastName: 'Rodríguez', email: 'maria.rodriguez@email.com' },
      { firstName: 'Juan', lastName: 'Martínez', email: 'juan.martinez@email.com' },
      { firstName: 'Laura', lastName: 'Fernández', email: 'laura.fernandez@email.com' }
    ];

    const createdCandidates = [];
    for (const cand of candidates) {
      const candidate = await prisma.candidate.create({
        data: { ...cand, organizationId: organization.id }
      });
      createdCandidates.push(candidate);
    }

    console.log('✅ Candidatos de ejemplo creados');

    // Crear resultados psicométricos de ejemplo
    const profiles = await prisma.psychometricProfile.findMany({
      where: { organizationId: organization.id }
    });

    for (const profile of profiles) {
      for (let i = 0; i < 3; i++) {
        const candidate = createdCandidates[i];
        
        // Generar puntajes realistas
        const scores = {
          openness: Math.floor(Math.random() * 40) + 50,
          conscientiousness: Math.floor(Math.random() * 40) + 50,
          extraversion: Math.floor(Math.random() * 40) + 40,
          agreeableness: Math.floor(Math.random() * 30) + 60,
          neuroticism: Math.floor(Math.random() * 50) + 20
        };

        // Calcular fit score
        const normalizedNeuroticism = 100 - scores.neuroticism;
        const fitScore = Math.round((
          (scores.openness * profile.opennessWeight / 100) +
          (scores.conscientiousness * profile.conscientiousnessWeight / 100) +
          (scores.extraversion * profile.extraversionWeight / 100) +
          (scores.agreeableness * profile.agreeablenessWeight / 100) +
          (normalizedNeuroticism * profile.neuroticismWeight / 100)
        ) * 100) / 100;

        await prisma.psychometricResult.create({
          data: {
            profileId: profile.id,
            candidateId: candidate.id,
            organizationId: organization.id,
            ...scores,
            fitScore,
            notes: 'Resultado de prueba generado para demo'
          }
        });
      }
    }

    console.log('✅ Resultados psicométricos de ejemplo creados');

    console.log('\n🎉 ¡Demo completo configurado exitosamente!');
    console.log('\n📋 CREDENCIALES DE ACCESO:');
    console.log('┌─────────────────────────────────────────┐');
    console.log('│ 👤 ADMINISTRADOR GENERAL                │');
    console.log('│ Email: admin@demo.com                   │');
    console.log('│ Contraseña: demo123                     │');
    console.log('│ Organización: demo-org                  │');
    console.log('├─────────────────────────────────────────┤');
    console.log('│ 🧠 PSICÓLOGO/ESPECIALISTA RRHH          │');
    console.log('│ Email: psicologo@demo.com               │');
    console.log('│ Contraseña: psycho123                   │');
    console.log('│ Organización: demo-org                  │');
    console.log('└──────────────────────────���──────────────┘');
    console.log('\n🔗 ENLACES DE ACCESO:');
    console.log('• Dashboard: http://localhost:5173/dashboard');
    console.log('• Pruebas Psicométricas: http://localhost:5173/psychometric');
    console.log('• Carga Masiva: http://localhost:5173/bulk-import');
    console.log('• Empleados: http://localhost:5173/employees');
    console.log('• Análisis de Puestos: http://localhost:5173/job-analyses');
    console.log('\n📊 DATOS CREADOS:');
    console.log(`• ${departments.length} Departamentos`);
    console.log(`• ${createdPositions.length} Posiciones`);
    console.log(`• ${competencies.length} Competencias`);
    console.log(`• ${createdCandidates.length} Candidatos`);
    console.log(`• ${profiles.length} Perfiles Psicométricos`);
    console.log(`• ${profiles.length * 3} Resultados de Pruebas`);

  } catch (error) {
    console.error('❌ Error configurando demo:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupCompleteDemo();