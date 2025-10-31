import express from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

export default function templatesRouter(prisma) {
  // List templates
  router.get('/', requireAuth, async (req, res, next) => {
    try {
      const orgId = req.organizationId;
      const items = await prisma.evaluationTemplate.findMany({
        where: { organizationId: orgId },
        orderBy: { name: 'asc' },
      });
      res.json(items);
    } catch (e) { next(e); }
  });

  // Get template with items + indicators
  router.get('/:id', requireAuth, async (req, res, next) => {
    try {
      const orgId = req.organizationId;
      const tpl = await prisma.evaluationTemplate.findFirst({
        where: { id: req.params.id, organizationId: orgId },
        include: {
          items: { include: { competency: true } },
          indicators: { include: { indicator: true } },
        },
      });
      if (!tpl) return res.status(404).json({ error: 'Not found' });
      res.json(tpl);
    } catch (e) { next(e); }
  });

  const CreateSchema = z.object({
    name: z.string().min(2),
    description: z.string().optional().nullable(),
    scaleMin: z.number().int(),
    scaleMax: z.number().int(),
  }).refine(v => v.scaleMax > v.scaleMin, { message: 'scaleMax must be > scaleMin', path: ['scaleMax'] });

  // Create template
  router.post('/', requireAuth, requireRole('admin'), async (req, res, next) => {
    try {
      const orgId = req.organizationId;
      const { name, description, scaleMin, scaleMax } = CreateSchema.parse(req.body);
      const created = await prisma.evaluationTemplate.create({
        data: { name, description: description || null, scaleMin, scaleMax, organizationId: orgId },
      });
      res.status(201).json(created);
    } catch (e) { next(e); }
  });

  const UpdateSchema = CreateSchema;
  router.put('/:id', requireAuth, requireRole('admin'), async (req, res, next) => {
    try {
      const orgId = req.organizationId;
      const { name, description, scaleMin, scaleMax } = UpdateSchema.parse(req.body);
      const tpl = await prisma.evaluationTemplate.findFirst({ where: { id: req.params.id, organizationId: orgId } });
      if (!tpl) return res.status(404).json({ error: 'Not found' });
      const updated = await prisma.evaluationTemplate.update({
        where: { id: tpl.id },
        data: { name, description: description || null, scaleMin, scaleMax },
      });
      res.json(updated);
    } catch (e) { next(e); }
  });

  // Delete template
  router.delete('/:id', requireAuth, requireRole('admin'), async (req, res, next) => {
    try {
      const orgId = req.organizationId;
      const tpl = await prisma.evaluationTemplate.findFirst({ where: { id: req.params.id, organizationId: orgId } });
      if (!tpl) return res.status(404).json({ error: 'Not found' });
      await prisma.evaluationTemplate.delete({ where: { id: tpl.id } });
      res.status(204).send();
    } catch (e) {
      if (e?.code === 'P2003') return res.status(409).json({ error: 'Template is in use and cannot be deleted' });
      next(e);
    }
  });

  // Upsert competencies set for a template
  const ItemSchema = z.object({
    competencyId: z.string().uuid(),
    weight: z.number().min(0).max(1),
    expectedLvl: z.number().int().optional().nullable(),
  });
  const ItemsSchema = z.object({ items: z.array(ItemSchema).min(1) });

  router.post('/:id/competencies', requireAuth, requireRole('admin'), async (req, res, next) => {
    try {
      const orgId = req.organizationId;
      const { items } = ItemsSchema.parse(req.body);
      const tpl = await prisma.evaluationTemplate.findFirst({ where: { id: req.params.id, organizationId: orgId } });
      if (!tpl) return res.status(404).json({ error: 'Template not found' });

      // validate competencies belong to org
      const compIds = items.map(i => i.competencyId);
      const valid = await prisma.competency.count({ where: { id: { in: compIds }, organizationId: orgId } });
      if (valid !== compIds.length) return res.status(400).json({ error: 'Invalid competencyId in items' });

      await prisma.$transaction([
        prisma.templateCompetency.deleteMany({ where: { templateId: tpl.id } }),
        ...items.map(i => prisma.templateCompetency.create({ data: {
          templateId: tpl.id, competencyId: i.competencyId, weight: i.weight, expectedLvl: i.expectedLvl ?? null,
        }}))
      ]);

      const refreshed = await prisma.evaluationTemplate.findUnique({
        where: { id: tpl.id },
        include: { items: { include: { competency: true } } }
      });
      res.json(refreshed);
    } catch (e) { next(e); }
  });

  // Upsert indicators set for a template
  const TIItemSchema = z.object({ indicatorId: z.string().uuid(), weight: z.number().min(0).max(1) });
  const TIItemsSchema = z.object({ items: z.array(TIItemSchema).min(1) });

  router.post('/:id/indicators', requireAuth, requireRole('admin'), async (req, res, next) => {
    try {
      const orgId = req.organizationId;
      const { items } = TIItemsSchema.parse(req.body);
      const tpl = await prisma.evaluationTemplate.findFirst({ where: { id: req.params.id, organizationId: orgId } });
      if (!tpl) return res.status(404).json({ error: 'Template not found' });

      const indIds = items.map(i => i.indicatorId);
      const valid = await prisma.indicator.count({ where: { id: { in: indIds }, organizationId: orgId } });
      if (valid !== indIds.length) return res.status(400).json({ error: 'Invalid indicatorId in items' });

      await prisma.$transaction([
        prisma.templateIndicator.deleteMany({ where: { templateId: tpl.id } }),
        ...items.map(i => prisma.templateIndicator.create({ data: {
          templateId: tpl.id, indicatorId: i.indicatorId, weight: i.weight,
        }}))
      ]);

      const refreshed = await prisma.evaluationTemplate.findUnique({
        where: { id: tpl.id },
        include: { indicators: { include: { indicator: true } } }
      });
      res.json(refreshed);
    } catch (e) { next(e); }
  });

  return router;
}
