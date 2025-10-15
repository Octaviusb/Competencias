import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function fixCredentials() {
  try {
    const orgId = 'demo-org';
    
    // Delete existing user if exists
    await prisma.user.deleteMany({
      where: { email: 'admin@demo.com', organizationId: orgId }
    });
    
    // Create organization
    await prisma.organization.upsert({
      where: { id: orgId },
      update: {},
      create: { id: orgId, name: 'Organización Demo' }
    });
    
    // Create new user with correct hash
    const hashedPassword = await bcrypt.hash('demo123', 12);
    const user = await prisma.user.create({
      data: {
        email: 'admin@demo.com',
        passwordHash: hashedPassword,
        isActive: true,
        organizationId: orgId
      }
    });
    
    console.log('✅ Credenciales corregidas:');
    console.log('📧 Email: admin@demo.com');
    console.log('🔑 Password: demo123');
    console.log('🏢 Organization: demo-org');
    console.log('🔐 Hash:', hashedPassword);
    
    // Verify login works
    const testUser = await prisma.user.findUnique({
      where: { organizationId_email: { email: 'admin@demo.com', organizationId: orgId } }
    });
    
    if (testUser) {
      const isValid = await bcrypt.compare('demo123', testUser.passwordHash);
      console.log('✅ Verificación de contraseña:', isValid ? 'CORRECTA' : 'INCORRECTA');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixCredentials();