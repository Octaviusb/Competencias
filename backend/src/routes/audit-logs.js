import express from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

export default function auditLogsRouter(prisma) {
  // List audit logs (admin only)
  router.get('/', requireAuth, requireRole('admin'), async (req, res, next) => {
    try {
      const orgId = req.organizationId;
      const { entityType, action, userId, limit = 50, offset = 0 } = req.query;

      const where = { organizationId: orgId };
      if (entityType) where.entityType = entityType;
      if (action) where.action = action;
      if (userId) where.userId = userId;

      const items = await prisma.auditLog.findMany({
        where,
        include: { user: { select: { email: true } } },
        orderBy: { timestamp: 'desc' },
        take: parseInt(limit),
        skip: parseInt(offset),
      });

      const total = await prisma.auditLog.count({ where });

      res.json({ items, total });
    } catch (e) { next(e); }
  });

  // Get specific audit log
  router.get('/:id', requireAuth, requireRole('admin'), async (req, res, next) => {
    try {
      const { id } = req.params;
      const orgId = req.organizationId;

      const log = await prisma.auditLog.findUnique({
        where: { id },
        include: { user: { select: { email: true } } },
      });

      if (!log || log.organizationId !== orgId) return res.status(404).json({ error: 'Audit log not found' });

      res.json(log);
    } catch (e) { next(e); }
  });

  return router;
}
