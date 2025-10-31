import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createOrgUsers() {
  try {
    // Crear organización de ejemplo
    const org = await prisma.organization.create({
      data: { name: 'Empresa Demo' }
    });

    // Crear roles para la organización
    const roles = await prisma.role.createMany({
      data: [
        { name: 'admin', organizationId: org.id },
        { name: 'director', organizationId: org.id },
        { name: 'auditor', organizationId: org.id },
        { name: 'usuario', organizationId: org.id },
      ]
    });

    console.log(`✅ Organización creada: ${org.name} (${org.id})`);

    // Usuarios de ejemplo
    const users = [
      {
        email: 'admin@empresa.com',
        password: 'Admin123!',
        firstName: 'Admin',
        lastName: 'Principal',
        role: 'admin'
      },
      {
        email: 'director@empresa.com', 
        password: 'Director123!',
        firstName: 'Director',
        lastName: 'General',
        role: 'director'
      },
      {
        email: 'auditor@empresa.com',
        password: 'Auditor123!',
        firstName: 'Auditor',
        lastName: 'Interno',
        role: 'auditor'
      },
      {
        email: 'usuario@empresa.com',
        password: 'Usuario123!',
        firstName: 'Usuario',
        lastName: 'Básico',
        role: 'usuario'
      }
    ];

    for (const userData of users) {
      const passwordHash = await bcrypt.hash(userData.password, 12);
      
      const user = await prisma.user.create({
        data: {
          email: userData.email,
          passwordHash,
          isActive: true,
          organizationId: org.id,
          employee: {
            create: {
              firstName: userData.firstName,
              lastName: userData.lastName,
              organizationId: org.id,
              title: userData.role.charAt(0).toUpperCase() + userData.role.slice(1)
            }
          },
          roles: {
            create: [{
              role: {
                connect: {
                  name_organizationId: {
                    name: userData.role,
                    organizationId: org.id
                  }
                }
              }
            }]
          }
        }
      });

      console.log(`✅ Usuario creado: ${userData.email} (${userData.role})`);
    }

    console.log('\n🎯 CREDENCIALES DE PRUEBA:');
    console.log('Organización: Empresa Demo');
    console.log('Admin: admin@empresa.com / Admin123!');
    console.log('Director: director@empresa.com / Director123!');
    console.log('Auditor: auditor@empresa.com / Auditor123!');
    console.log('Usuario: usuario@empresa.com / Usuario123!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createOrgUsers();