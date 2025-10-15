import express from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

export default function employeePositionsRouter(prisma) {
  // Assign a position to an employee (admin)
  const AssignSchema = z.object({
    employeeId: z.string().uuid(),
    positionId: z.string().uuid(),
    effectiveFrom: z.string().datetime().optional(),
  });
  router.post('/', requireAuth, requireRole('admin'), async (req, res, next) => {
    try {
      const { employeeId, positionId, effectiveFrom } = AssignSchema.parse(req.body);
      const orgId = req.organizationId;

      const employee = await prisma.employee.findFirst({ where: { id: employeeId, organizationId: orgId } });
      if (!employee) return res.status(400).json({ error: 'Invalid employeeId for this organization' });
      const position = await prisma.position.findFirst({ where: { id: positionId, organizationId: orgId } });
      if (!position) return res.status(400).json({ error: 'Invalid positionId for this organization' });

      const created = await prisma.employeePosition.create({
        data: {
          employeeId,
          positionId,
          effectiveFrom: effectiveFrom ? new Date(effectiveFrom) : undefined,
        },
      });
      res.status(201).json(created);
    } catch (e) { next(e); }
  });

  // Get positions history for an employee
  router.get('/employee/:employeeId', requireAuth, async (req, res, next) => {
    try {
      const orgId = req.organizationId;
      const employee = await prisma.employee.findFirst({ where: { id: req.params.employeeId, organizationId: orgId } });
      if (!employee) return res.status(404).json({ error: 'Employee not found' });
      const items = await prisma.employeePosition.findMany({
        where: { employeeId: employee.id },
        include: { position: true },
        orderBy: { effectiveFrom: 'desc' },
      });
      res.json(items);
    } catch (e) { next(e); }
  });

  return router;
}
