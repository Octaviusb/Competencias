import express from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

export default function departmentsRouter(prisma) {
  // List departments (tenant scoped)
  router.get('/', requireAuth, async (req, res, next) => {
    try {
      const orgId = req.organizationId;
      const items = await prisma.department.findMany({
        where: { organizationId: orgId },
        orderBy: { name: 'asc' },
      });
      res.json(items);
    } catch (e) { next(e); }
  });

  // Create department (admin)
  const CreateSchema = z.object({ name: z.string().min(2) });
  router.post('/', requireAuth, requireRole('admin'), async (req, res, next) => {
    try {
      const { name } = CreateSchema.parse(req.body);
      const orgId = req.organizationId;
      const created = await prisma.department.create({ data: { name, organizationId: orgId } });
      res.status(201).json(created);
    } catch (e) { next(e); }
  });

  // Update department (admin)
  const UpdateSchema = z.object({ name: z.string().min(2) });
  router.put('/:id', requireAuth, requireRole('admin'), async (req, res, next) => {
    try {
      const { id } = req.params;
      const { name } = UpdateSchema.parse(req.body);
      const orgId = req.organizationId;
      const updated = await prisma.department.update({
        where: { id },
        data: { name },
      });
      if (updated.organizationId !== orgId) {
        return res.status(404).json({ error: 'Department not found' });
      }
      res.json(updated);
    } catch (e) {
      if (e?.code === 'P2025') return res.status(404).json({ error: 'Department not found' });
      if (e?.code === 'P2002') return res.status(409).json({ error: 'Department name already exists' });
      next(e);
    }
  });

  // Delete department (admin)
  router.delete('/:id', requireAuth, requireRole('admin'), async (req, res, next) => {
    try {
      const { id } = req.params;
      const orgId = req.organizationId;
      const dep = await prisma.department.findUnique({ where: { id } });
      if (!dep || dep.organizationId !== orgId) return res.status(404).json({ error: 'Department not found' });
      await prisma.department.delete({ where: { id } });
      res.status(204).send();
    } catch (e) {
      // Foreign key constraint
      if (e?.code === 'P2003') return res.status(409).json({ error: 'Department is in use and cannot be deleted' });
      next(e);
    }
  });

  return router;
}
