import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testOrganizations() {
  try {
    console.log('🔍 Verificando organizaciones en la base de datos...');
    
    const organizations = await prisma.organization.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`📊 Total organizaciones encontradas: ${organizations.length}`);
    
    organizations.forEach((org, index) => {
      console.log(`${index + 1}. ${org.name}`);
      console.log(`   ID: ${org.id}`);
      console.log(`   Creada: ${org.createdAt}`);
      console.log('');
    });
    
    if (organizations.length === 0) {
      console.log('⚠️  No hay organizaciones. Creando organizaciones de ejemplo...');
      
      // Crear organizaciones de ejemplo
      const orgs = await prisma.organization.createMany({
        data: [
          { name: 'Sistema Central' },
          { name: 'Empresa Demo' },
          { name: 'Organización Prueba' }
        ]
      });
      
      console.log(`✅ Creadas ${orgs.count} organizaciones de ejemplo`);
      
      // Mostrar las nuevas organizaciones
      const newOrgs = await prisma.organization.findMany();
      newOrgs.forEach((org, index) => {
        console.log(`${index + 1}. ${org.name} (${org.id})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testOrganizations();