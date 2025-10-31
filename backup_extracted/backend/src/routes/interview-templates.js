import express from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

export default function interviewTemplatesRouter(prisma) {
  // List interview templates
  router.get('/', requireAuth, async (req, res, next) => {
    try {
      const orgId = req.organizationId;
      const items = await prisma.interviewTemplate.findMany({
        where: { organizationId: orgId },
        include: { questions: { orderBy: { order: 'asc' } } },
        orderBy: { name: 'asc' },
      });
      res.json(items);
    } catch (e) { next(e); }
  });

  // Get specific template
  router.get('/:id', requireAuth, async (req, res, next) => {
    try {
      const { id } = req.params;
      const orgId = req.organizationId;

      const template = await prisma.interviewTemplate.findUnique({
        where: { id },
        include: { questions: { orderBy: { order: 'asc' } } },
      });

      if (!template || template.organizationId !== orgId) return res.status(404).json({ error: 'Template not found' });

      res.json(template);
    } catch (e) { next(e); }
  });

  // Create template
  const CreateSchema = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    type: z.string().min(1),
    questions: z.array(z.object({
      question: z.string().min(1),
      category: z.string().min(1),
      order: z.number().int().min(1),
      required: z.boolean().optional(),
    })).optional(),
  });

  router.post('/', requireAuth, requireRole('admin'), async (req, res, next) => {
    try {
      const { name, description, type, questions = [] } = CreateSchema.parse(req.body);
      const orgId = req.organizationId;

      const created = await prisma.interviewTemplate.create({
        data: {
          name,
          description: description || null,
          type,
          organizationId: orgId,
          questions: {
            create: questions.map(q => ({
              question: q.question,
              category: q.category,
              order: q.order,
              required: q.required || false,
            })),
          },
        },
        include: { questions: true },
      });

      res.status(201).json(created);
    } catch (e) { next(e); }
  });

  // Update template
  const UpdateSchema = z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    type: z.string().min(1).optional(),
  });

  router.put('/:id', requireAuth, requireRole('admin'), async (req, res, next) => {
    try {
      const { id } = req.params;
      const updates = UpdateSchema.parse(req.body);
      const orgId = req.organizationId;

      const template = await prisma.interviewTemplate.findUnique({ where: { id } });
      if (!template || template.organizationId !== orgId) return res.status(404).json({ error: 'Template not found' });

      const updated = await prisma.interviewTemplate.update({
        where: { id },
        data: updates,
        include: { questions: { orderBy: { order: 'asc' } } },
      });

      res.json(updated);
    } catch (e) { next(e); }
  });

  // Delete template
  router.delete('/:id', requireAuth, requireRole('admin'), async (req, res, next) => {
    try {
      const { id } = req.params;
      const orgId = req.organizationId;

      const template = await prisma.interviewTemplate.findUnique({ where: { id } });
      if (!template || template.organizationId !== orgId) return res.status(404).json({ error: 'Template not found' });

      await prisma.interviewTemplate.delete({ where: { id } });
      res.status(204).send();
    } catch (e) {
      if (e?.code === 'P2003') return res.status(409).json({ error: 'Template is in use and cannot be deleted' });
      next(e);
    }
  });

  return router;
}
