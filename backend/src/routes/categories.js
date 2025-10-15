import express from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

export default function categoriesRouter(prisma) {
  // List categories (tenant scoped)
  router.get('/', requireAuth, async (req, res, next) => {
    try {
      const orgId = req.organizationId;
      const items = await prisma.category.findMany({
        where: { organizationId: orgId },
        orderBy: { name: 'asc' },
      });
      res.json(items);
    } catch (e) { next(e); }
  });

  // Create category (admin)
  const CreateSchema = z.object({ name: z.string().min(2) });
  router.post('/', requireAuth, requireRole('admin'), async (req, res, next) => {
    try {
      const { name } = CreateSchema.parse(req.body);
      const orgId = req.organizationId;
      const created = await prisma.category.create({ data: { name, organizationId: orgId } });
      res.status(201).json(created);
    } catch (e) { next(e); }
  });

  // Update category (admin)
  const UpdateSchema = z.object({ name: z.string().min(2) });
  router.put('/:id', requireAuth, requireRole('admin'), async (req, res, next) => {
    try {
      const { id } = req.params;
      const { name } = UpdateSchema.parse(req.body);
      const orgId = req.organizationId;
      const cat = await prisma.category.findUnique({ where: { id } });
      if (!cat || cat.organizationId !== orgId) return res.status(404).json({ error: 'Category not found' });
      const updated = await prisma.category.update({ where: { id }, data: { name } });
      res.json(updated);
    } catch (e) {
      if (e?.code === 'P2002') return res.status(409).json({ error: 'Category name already exists' });
      if (e?.code === 'P2025') return res.status(404).json({ error: 'Category not found' });
      next(e);
    }
  });

  // Delete category (admin)
  router.delete('/:id', requireAuth, requireRole('admin'), async (req, res, next) => {
    try {
      const { id } = req.params;
      const orgId = req.organizationId;
      const cat = await prisma.category.findUnique({ where: { id } });
      if (!cat || cat.organizationId !== orgId) return res.status(404).json({ error: 'Category not found' });
      await prisma.category.delete({ where: { id } });
      res.status(204).send();
    } catch (e) {
      if (e?.code === 'P2003') return res.status(409).json({ error: 'Category is in use and cannot be deleted' });
      next(e);
    }
  });

  return router;
}
