import express from 'express';
import { z } from 'zod';

const router = express.Router();

export default function orgRouter(prisma) {
  const CreateSchema = z.object({ name: z.string().min(2) });

  // Create organization (public for new organizations)
  router.post('/', async (req, res, next) => {
    try {
      const { name } = CreateSchema.parse(req.body);
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
