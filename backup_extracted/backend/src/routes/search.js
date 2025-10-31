import express from 'express';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

export default function searchRouter(prisma) {
  router.use(requireAuth);

  router.get('/', async (req, res, next) => {
    try {
      const { q } = req.query;
      const orgId = req.organizationId;
      
      if (!q || q.length < 2) {
        return res.json({ results: [] });
      }

      const [employees, observations, interviews, jobAnalyses] = await Promise.all([
        prisma.employee.findMany({
          where: {
            organizationId: orgId,
            OR: [
              { firstName: { contains: q, mode: 'insensitive' } },
              { lastName: { contains: q, mode: 'insensitive' } },
              { title: { contains: q, mode: 'insensitive' } }
            ]
          },
          take: 5
        }),
        prisma.observation.findMany({
          where: {
            organizationId: orgId,
            context: { contains: q, mode: 'insensitive' }
          },
          include: { employee: true },
          take: 5
        }),
        prisma.interview.findMany({
          where: {
            organizationId: orgId,
            purpose: { contains: q, mode: 'insensitive' }
          },
          include: { employee: true },
          take: 5
        }),
        prisma.jobAnalysis.findMany({
          where: {
            organizationId: orgId,
            title: { contains: q, mode: 'insensitive' }
          },
          take: 5
        })
      ]);

      const results = [
        ...employees.map(e => ({ type: 'employee', id: e.id, title: `${e.firstName} ${e.lastName}`, subtitle: e.title })),
        ...observations.map(o => ({ type: 'observation', id: o.id, title: 'Observación', subtitle: `${o.employee.firstName} ${o.employee.lastName}` })),
        ...interviews.map(i => ({ type: 'interview', id: i.id, title: 'Entrevista', subtitle: `${i.employee.firstName} ${i.employee.lastName}` })),
        ...jobAnalyses.map(j => ({ type: 'job-analysis', id: j.id, title: j.title, subtitle: 'Análisis de Puesto' }))
      ];

      res.json({ results });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
