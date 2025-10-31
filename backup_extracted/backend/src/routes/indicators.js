import express from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

export default function indicatorsRouter(prisma) {
  // List indicators
  router.get('/', requireAuth, async (req, res, next) => {
    try {
      const orgId = req.organizationId;
      const items = await prisma.indicator.findMany({ where: { organizationId: orgId }, orderBy: { name: 'asc' } });
      res.json(items);
    } catch (e) { next(e); }
  });

  const CreateSchema = z.object({ name: z.string().min(2), description: z.string().optional().nullable() });

  // Create indicator
  router.post('/', requireAuth, requireRole('admin'), async (req, res, next) => {
    try {
      const orgId = req.organizationId;
      const { name, description } = CreateSchema.parse(req.body);
      const created = await prisma.indicator.create({ data: { name, description: description || null, organizationId: orgId } });
      res.status(201).json(created);
    } catch (e) { next(e); }
  });

  // Update indicator
  router.put('/:id', requireAuth, requireRole('admin'), async (req, res, next) => {
    try {
      const orgId = req.organizationId;
      const { name, description } = CreateSchema.parse(req.body);
      const ind = await prisma.indicator.findFirst({ where: { id: req.params.id, organizationId: orgId } });
      if (!ind) return res.status(404).json({ error: 'Not found' });
      const updated = await prisma.indicator.update({ where: { id: ind.id }, data: { name, description: description || null } });
      res.json(updated);
    } catch (e) { next(e); }
  });

  // Delete indicator
  router.delete('/:id', requireAuth, requireRole('admin'), async (req, res, next) => {
    try {
      const orgId = req.organizationId;
      const ind = await prisma.indicator.findFirst({ where: { id: req.params.id, organizationId: orgId } });
      if (!ind) return res.status(404).json({ error: 'Not found' });
      await prisma.indicator.delete({ where: { id: ind.id } });
      res.status(204).send();
    } catch (e) {
      if (e?.code === 'P2003') return res.status(409).json({ error: 'Indicator is in use and cannot be deleted' });
      next(e);
    }
  });

  return router;
}
