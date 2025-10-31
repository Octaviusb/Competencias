import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createUser() {
  try {
    const orgId = 'demo-org';
    
    // Create organization
    const org = await prisma.organization.upsert({
      where: { id: orgId },
      update: {},
      create: { id: orgId, name: 'Organización Demo' }
    });
    
    // Create admin user
    const hashedPassword = await bcrypt.hash('demo123', 12);
    const user = await prisma.user.upsert({
      where: { organizationId_email: { email: 'admin@demo.com', organizationId: orgId } },
      update: { passwordHash: hashedPassword },
      create: {
        email: 'admin@demo.com',
        passwordHash: hashedPassword,
        isActive: true,
        organizationId: orgId
      }
    });
    
    console.log('✅ Usuario creado exitosamente:');
    console.log('📧 Email: admin@demo.com');
    console.log('🔑 Password: demo123');
    console.log('🏢 Organization: demo-org');
    console.log('🆔 User ID:', user.id);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createUser();