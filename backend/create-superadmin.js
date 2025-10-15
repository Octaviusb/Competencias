import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function createSuperAdmin() {
  try {
    console.log('🔧 Creating SuperAdmin with access to all organizations...');

    // Create superadmin organization (special org for cross-tenant access)
    const superOrg = await prisma.organization.upsert({
      where: { id: 'superadmin-org' },
      update: {},
      create: { id: 'superadmin-org', name: 'SuperAdmin Organization' },
    });

    // Hash password
    const passwordHash = await bcrypt.hash('superadmin123', 12);

    // Create superadmin user
    const superAdmin = await prisma.user.upsert({
      where: { organizationId_email: { email: 'superadmin@competencymanager.com', organizationId: 'superadmin-org' } },
      update: {},
      create: {
        email: 'superadmin@competencymanager.com',
        passwordHash: passwordHash,
        isActive: true,
        organizationId: 'superadmin-org',
        employee: {
          create: {
            firstName: 'Super',
            lastName: 'Admin',
            title: 'Super Administrator',
            organizationId: 'superadmin-org',
          },
        },
        roles: {
          create: [{
            role: {
              connectOrCreate: {
                where: { name_organizationId: { name: 'superadmin', organizationId: 'superadmin-org' } },
                create: { name: 'superadmin', organizationId: 'superadmin-org' }
              }
            }
          }],
        },
      },
    });

    console.log('✅ SuperAdmin created successfully!');
    console.log('📧 SuperAdmin login: superadmin@competencymanager.com');
    console.log('🔑 Password: superadmin123');
    console.log('🏢 Organization: superadmin-org');
    console.log('👑 Role: superadmin (full access to all organizations)');

  } catch (error) {
    console.error('❌ Error creating SuperAdmin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSuperAdmin();