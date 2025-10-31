import { PrismaClient } from '@prisma/client';
import seedRouter from './src/routes/seed.js';

const prisma = new PrismaClient();

async function runSeed() {
  const router = seedRouter(prisma);
  const req = { body: { orgId: 'org-admin' } };
  const res = {
    json: (data) => console.log('Seed result:', data),
    status: () => ({ json: (data) => console.log('Error:', data) })
  };
  const next = (err) => console.error('Error:', err);

  // Simulate the POST handler
  await router.stack[0].route.stack[0].handle(req, res, next);
}

runSeed().catch(console.error).finally(() => prisma.$disconnect());