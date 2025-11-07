import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function setupPsychometricDemo() {
  try {
    console.log('🧠 Configurando demo de pruebas psicométricas...');

    // Buscar o crear organización demo
    let organization = await prisma.organization.findUnique({
      where: { name: 'demo-org' }
    });

    if (!organization) {
      organization = await prisma.organization.create({
        data: { name: 'demo-org' }
      });
      console.log('✅ Organización demo creada');
    }

    // Crear usuario demo para psicometría
    const hashedPassword = await bcrypt.hash('psycho123', 10);
    
    let user = await prisma.user.findFirst({
      where: { 
        email: 'psicologo@demo.com',
        organizationId: organization.id 
      }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: 'psicologo@demo.com',
          passwordHash: hashedPassword,
          organizationId: organization.id,
          isActive: true
        }
      });
      console.log('✅ Usuario psicólogo demo creado');
    }

    // Crear departamento de RRHH
    let department = await prisma.department.findFirst({
      where: { 
        name: 'Recursos Humanos',
        organizationId: organization.id 
      }
    });

    if (!department) {
      department = await prisma.department.create({
        data: {
          name: 'Recursos Humanos',
          organizationId: organization.id
        }
      });
      console.log('✅ Departamento RRHH creado');
    }

    // Crear posiciones de ejemplo
    const positions = [
      { name: 'Gerente de Ventas', description: 'Liderazgo del equipo comercial' },
      { name: 'Desarrollador Senior', description: 'Desarrollo de software' },
      { name: 'Analista de Marketing', description: 'Análisis de mercado' }
    ];

    for (const posData of positions) {
      let position = await prisma.position.findFirst({
        where: { 
          name: posData.name,
          organizationId: organization.id 
        }
      });

      if (!position) {
        position = await prisma.position.create({
          data: {
            ...posData,
            organizationId: organization.id,
            departmentId: department.id
          }
        });

        // Crear análisis de puesto
        const jobAnalysis = await prisma.jobAnalysis.create({
          data: {
            positionId: position.id,
            organizationId: organization.id,
            purpose: `Análisis psicométrico para ${posData.name}`,
            departmentId: department.id
          }
        });

        // Crear perfil psicométrico según el tipo de puesto
        let weights;
        switch (posData.name) {
          case 'Gerente de Ventas':
            weights = {
              opennessWeight: 15,
              conscientiousnessWeight: 25,
              extraversionWeight: 35,
              agreeablenessWeight: 15,
              neuroticismWeight: 10
            };
            break;
          case 'Desarrollador Senior':
            weights = {
              opennessWeight: 30,
              conscientiousnessWeight: 30,
              extraversionWeight: 10,
              agreeablenessWeight: 20,
              neuroticismWeight: 10
            };
            break;
          case 'Analista de Marketing':
            weights = {
              opennessWeight: 25,
              conscientiousnessWeight: 20,
              extraversionWeight: 20,
              agreeablenessWeight: 25,
              neuroticismWeight: 10
            };
            break;
        }

        await prisma.psychometricProfile.create({
          data: {
            jobAnalysisId: jobAnalysis.id,
            organizationId: organization.id,
            ...weights
          }
        });

        console.log(`✅ Perfil psicométrico creado para ${posData.name}`);
      }
    }

    // Crear candidatos de ejemplo
    const candidates = [
      { firstName: 'Ana', lastName: 'García', email: 'ana.garcia@email.com' },
      { firstName: 'Carlos', lastName: 'López', email: 'carlos.lopez@email.com' },
      { firstName: 'María', lastName: 'Rodríguez', email: 'maria.rodriguez@email.com' },
      { firstName: 'Juan', lastName: 'Martínez', email: 'juan.martinez@email.com' }
    ];

    for (const candData of candidates) {
      let candidate = await prisma.candidate.findFirst({
        where: { 
          email: candData.email,
          organizationId: organization.id 
        }
      });

      if (!candidate) {
        candidate = await prisma.candidate.create({
          data: {
            ...candData,
            organizationId: organization.id
          }
        });
        console.log(`✅ Candidato ${candData.firstName} ${candData.lastName} creado`);
      }
    }

    // Crear resultados de ejemplo
    const profiles = await prisma.psychometricProfile.findMany({
      where: { organizationId: organization.id }
    });

    const candidatesList = await prisma.candidate.findMany({
      where: { organizationId: organization.id }
    });

    for (const profile of profiles) {
      for (const candidate of candidatesList.slice(0, 2)) {
        const existingResult = await prisma.psychometricResult.findFirst({
          where: {
            profileId: profile.id,
            candidateId: candidate.id
          }
        });

        if (!existingResult) {
          // Generar puntajes aleatorios pero realistas
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
              notes: 'Resultado de prueba generado automáticamente'
            }
          });
        }
      }
    }

    console.log('✅ Resultados psicométricos de ejemplo creados');

    console.log('\n🎉 Demo de pruebas psicométricas configurado exitosamente!');
    console.log('\n📋 Credenciales de acceso:');
    console.log('👤 Usuario: psicologo@demo.com');
    console.log('🔑 Contraseña: psycho123');
    console.log('🏢 Organización: demo-org');
    console.log('\n🔗 Accede a: http://localhost:5173/psychometric');

  } catch (error) {
    console.error('❌ Error configurando demo:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupPsychometricDemo();