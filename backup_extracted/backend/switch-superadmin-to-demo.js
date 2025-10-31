import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function switchSuperadminToDemo() {
  try {
    console.log('🔄 Cambiando superadmin a organización demo...');

    // Buscar la organización demo
    const demoOrg = await prisma.organization.findFirst({
      where: { id: 'demo-org' }
    });

    if (!demoOrg) {
      console.log('❌ Organización demo no encontrada');
      return;
    }

    // Buscar el superadmin
    const superadmin = await prisma.user.findFirst({
      where: { email: 'superadmin@competencymanager.com' }
    });

    if (!superadmin) {
      console.log('❌ Usuario superadmin no encontrado');
      return;
    }

    // Actualizar el superadmin para que use la organización demo
    const updatedUser = await prisma.user.update({
      where: { id: superadmin.id },
      data: { organizationId: 'demo-org' }
    });

    console.log('✅ Superadmin actualizado exitosamente');
    console.log(`📧 Email: ${updatedUser.email}`);
    console.log(`🏢 Nueva organización: ${demoOrg.name} (${demoOrg.id})`);
    console.log('🔑 Contraseña: superadmin123');
    
    // Verificar datos en la organización demo
    const employeeCount = await prisma.employee.count({
      where: { organizationId: 'demo-org' }
    });
    
    const departmentCount = await prisma.department.count({
      where: { organizationId: 'demo-org' }
    });

    console.log(`\n📊 Datos disponibles en organización demo:`);
    console.log(`- Empleados: ${employeeCount}`);
    console.log(`- Departamentos: ${departmentCount}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

switchSuperadminToDemo();