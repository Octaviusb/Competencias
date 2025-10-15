import jwt from 'jsonwebtoken';

const payload = {
  sub: 'test-user-id',
  org: 'demo-org',
  roles: ['admin'],
  email: 'admin@demo.com'
};

// SuperAdmin payload
const superAdminPayload = {
  sub: 'superadmin-id',
  org: 'superadmin-org',
  roles: ['superadmin'],
  email: 'superadmin@competencymanager.com'
};

const token = jwt.sign(payload, 'change_me_please', { expiresIn: '1h' });
const superAdminToken = jwt.sign(superAdminPayload, 'change_me_please', { expiresIn: '1h' });

console.log('=== TOKENS DISPONIBLES ===');
console.log('Admin Token:', token);
console.log('SuperAdmin Token:', superAdminToken);
console.log('');
console.log('=== CREDENCIALES ===');
console.log('Admin: admin@demo.com / demo123');
console.log('SuperAdmin: superadmin@competencymanager.com / superadmin123');