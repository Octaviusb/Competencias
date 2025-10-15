import express from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { sanitizeInput } from '../middleware/validation.js';

const router = express.Router();

export default function employeesRouter(prisma) {
  // Apply sanitization to all routes
  router.use(sanitizeInput);
  
  // List employees (tenant scoped)
  router.get('/', requireAuth, async (req, res, next) => {
    try {
      const orgId = req.organizationId;
      const items = await prisma.employee.findMany({
        where: { organizationId: orgId },
        include: { department: true, user: { include: { roles: { include: { role: true } } } }, manager: true },
        orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
      });
      res.json(items);
    } catch (e) { next(e); }
  });
 
  // Update employee (admin)
  const UpdateSchema = z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    title: z.string().optional().nullable(),
    departmentId: z.string().uuid().optional().nullable(),
    managerId: z.string().uuid().optional().nullable(),
  });
  router.put('/:id', requireAuth, requireRole('admin'), async (req, res, next) => {
    try {
      const { id } = req.params;
      const { firstName, lastName, title, departmentId, managerId } = UpdateSchema.parse(req.body);
      const orgId = req.organizationId;

      const emp = await prisma.employee.findUnique({ where: { id } });
      if (!emp || emp.organizationId !== orgId) return res.status(404).json({ error: 'Employee not found' });

      if (departmentId) {
        const dep = await prisma.department.findFirst({ where: { id: departmentId, organizationId: orgId } });
        if (!dep) return res.status(400).json({ error: 'Invalid departmentId for this organization' });
      }
      if (managerId) {
        const mgr = await prisma.employee.findFirst({ where: { id: managerId, organizationId: orgId } });
        if (!mgr) return res.status(400).json({ error: 'Invalid managerId for this organization' });
      }

      const updated = await prisma.employee.update({
        where: { id },
        data: {
          firstName,
          lastName,
          title: title ?? null,
          departmentId: departmentId ?? null,
          managerId: managerId ?? null,
        },
      });
      res.json(updated);
    } catch (e) {
      if (e?.code === 'P2025') return res.status(404).json({ error: 'Employee not found' });
      next(e);
    }
  });

  // Delete employee (admin)
  router.delete('/:id', requireAuth, requireRole('admin'), async (req, res, next) => {
    try {
      const { id } = req.params;
      const orgId = req.organizationId;
      const emp = await prisma.employee.findUnique({ where: { id } });
      if (!emp || emp.organizationId !== orgId) return res.status(404).json({ error: 'Employee not found' });
      await prisma.employee.delete({ where: { id } });
      res.status(204).send();
    } catch (e) {
      if (e?.code === 'P2003') return res.status(409).json({ error: 'Employee is in use and cannot be deleted' });
      next(e);
    }
  });

  // Create employee (admin)
  const CreateSchema = z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    title: z.string().optional(),
    departmentId: z.string().uuid().optional().nullable(),
    managerId: z.string().uuid().optional().nullable(),
  });
  router.post('/', requireAuth, requireRole('admin'), async (req, res, next) => {
    try {
      const { firstName, lastName, title, departmentId, managerId } = CreateSchema.parse(req.body);
      const orgId = req.organizationId;

      if (departmentId) {
        const dep = await prisma.department.findFirst({ where: { id: departmentId, organizationId: orgId } });
        if (!dep) return res.status(400).json({ error: 'Invalid departmentId for this organization' });
      }
      if (managerId) {
        const mgr = await prisma.employee.findFirst({ where: { id: managerId, organizationId: orgId } });
        if (!mgr) return res.status(400).json({ error: 'Invalid managerId for this organization' });
      }

      const created = await prisma.employee.create({
        data: {
          firstName,
          lastName,
          title: title || null,
          departmentId: departmentId || null,
          managerId: managerId || null,
          organizationId: orgId,
        },
      });
      res.status(201).json(created);
    } catch (e) { next(e); }
  });

  return router;
}
