import express from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

export default function protectedRouter(prisma) {
  router.get('/me', requireAuth, async (req, res, next) => {
    try {
      const me = await prisma.user.findUnique({ where: { id: req.user.sub }, include: { employee: true } });
      res.json(me);
    } catch (e) { next(e); }
  });

  router.get('/admin/roles', requireAuth, requireRole('admin'), async (req, res, next) => {
    try {
      const roles = await prisma.role.findMany({ where: { organizationId: req.organizationId } });
      res.json(roles);
    } catch (e) { next(e); }
  });

  return router;
}
