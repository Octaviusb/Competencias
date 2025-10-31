import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function checkSuperadmin() {
  try {
    const email = 'developer@competencias.com';
    
    // Find organization
    const org = await prisma.organization.findFirst({
      where: { name: 'Sistema Central' }
    });
    
    if (!org) {
      console.log('❌ Organización no encontrada');
      return;
    }
    
    console.log(`✅ Organización encontrada: ${org.name} (${org.id})`);
    
    // Find user
    const user = await prisma.user.findFirst({
      where: { 
        email,
        organizationId: org.id 
      },
      include: {
        employee: true,
        roles: { include: { role: true } }
      }
    });
    
    if (!user) {
      console.log('❌ Usuario superadmin no encontrado');
      return;
    }
    
    console.log(`✅ Usuario encontrado: ${user.email}`);
    console.log(`📧 Email: ${user.email}`);
    console.log(`🏢 Organización: ${org.id}`);
    console.log(`👤 Empleado: ${user.employee?.firstName} ${user.employee?.lastName}`);
    console.log(`🔑 Roles: ${user.roles.map(r => r.role.name).join(', ')}`);
    
    // Test password
    const testPassword = 'SuperAdmin2024!';
    const passwordMatch = await bcrypt.compare(testPassword, user.passwordHash);
    console.log(`🔐 Password válida: ${passwordMatch ? '✅ SÍ' : '❌ NO'}`);
    
    if (!passwordMatch) {
      console.log('🔧 Actualizando contraseña...');
      const newHash = await bcrypt.hash(testPassword, 12);
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: newHash }
      });
      console.log('✅ Contraseña actualizada');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSuperadmin();