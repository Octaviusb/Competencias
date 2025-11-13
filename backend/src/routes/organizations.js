import express from 'express';
import { z } from 'zod';

const router = express.Router();

export default function orgRouter(prisma) {
  const CreateSchema = z.object({ name: z.string().min(2) });

  // Create organization (limited to prevent spam)
  router.post('/', async (req, res, next) => {
    try {
      const { name } = CreateSchema.parse(req.body);
      
      // Limit: max 5 organizations total to prevent spam
      const orgCount = await prisma.organization.count();
      if (orgCount >= 5) {
        return res.status(429).json({ error: 'Límite de organizaciones alcanzado. Contacta al administrador.' });
      }
      
      const org = await prisma.organization.create({ data: { name } });
      // Seed default roles for this organization
      await prisma.role.createMany({ data: [
        { name: 'admin', organizationId: org.id },
        { name: 'evaluator', organizationId: org.id },
        { name: 'employee', organizationId: org.id },
      ]});
      res.status(201).json(org);
    } catch (err) {
      if (err?.code === 'P2002') {
        return res.status(409).json({ error: 'Organization name already exists' });
      }
      next(err);
    }
  });

  // List organizations (public for selection, superadmin for management)
  router.get('/', async (req, res, next) => {
    try {
      const items = await prisma.organization.findMany({ 
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, createdAt: true }
      });
      res.json(items);
    } catch (err) { next(err); }
  });

  return router;
}
