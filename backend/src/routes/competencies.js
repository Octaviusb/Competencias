import express from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

export default function competenciesRouter(prisma) {
  // List competencies (tenant scoped, optional filter by category)
  router.get('/', requireAuth, async (req, res, next) => {
    try {
      const orgId = req.organizationId;
      const { categoryId } = req.query;
      const items = await prisma.competency.findMany({
        where: {
          organizationId: orgId,
          ...(categoryId ? { categoryId } : {}),
        },
        include: { category: true },
        orderBy: { name: 'asc' },
      });
      res.json(items);
    } catch (e) { next(e); }
  });

  // Create competency (admin)
  const CreateSchema = z.object({
    name: z.string().min(2),
    description: z.string().min(4),
    categoryId: z.string().uuid(),
  });
  router.post('/', requireAuth, requireRole('admin'), async (req, res, next) => {
    try {
      const { name, description, categoryId } = CreateSchema.parse(req.body);
      const orgId = req.organizationId;
      // Validate category belongs to same tenant
      const cat = await prisma.category.findFirst({ where: { id: categoryId, organizationId: orgId } });
      if (!cat) return res.status(400).json({ error: 'Invalid categoryId for this organization' });
      const created = await prisma.competency.create({
        data: { name, description, categoryId, organizationId: orgId },
      });
      res.status(201).json(created);
    } catch (e) { next(e); }
  });

  // Update competency (admin)
  const UpdateSchema = z.object({
    name: z.string().min(2),
    description: z.string().min(4),
    categoryId: z.string().uuid(),
  });
  router.put('/:id', requireAuth, requireRole('admin'), async (req, res, next) => {
    try {
      const { id } = req.params;
      const { name, description, categoryId } = UpdateSchema.parse(req.body);
      const orgId = req.organizationId;
      const comp = await prisma.competency.findUnique({ where: { id } });
      if (!comp || comp.organizationId !== orgId) return res.status(404).json({ error: 'Competency not found' });
      const cat = await prisma.category.findFirst({ where: { id: categoryId, organizationId: orgId } });
      if (!cat) return res.status(400).json({ error: 'Invalid categoryId for this organization' });
      const updated = await prisma.competency.update({ where: { id }, data: { name, description, categoryId } });
      res.json(updated);
    } catch (e) {
      if (e?.code === 'P2002') return res.status(409).json({ error: 'Competency name already exists' });
      if (e?.code === 'P2025') return res.status(404).json({ error: 'Competency not found' });
      next(e);
    }
  });

  // Delete competency (admin)
  router.delete('/:id', requireAuth, requireRole('admin'), async (req, res, next) => {
    try {
      const { id } = req.params;
      const orgId = req.organizationId;
      const comp = await prisma.competency.findUnique({ where: { id } });
      if (!comp || comp.organizationId !== orgId) return res.status(404).json({ error: 'Competency not found' });
      await prisma.competency.delete({ where: { id } });
      res.status(204).send();
    } catch (e) {
      if (e?.code === 'P2003') return res.status(409).json({ error: 'Competency is in use and cannot be deleted' });
      next(e);
    }
  });

  return router;
}
