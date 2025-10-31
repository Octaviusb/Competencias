import express from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

export default function positionsRouter(prisma) {
  // List positions (tenant scoped)
  router.get('/', requireAuth, async (req, res, next) => {
    try {
      const orgId = req.organizationId;
      const items = await prisma.position.findMany({
        where: { organizationId: orgId },
        include: { department: true },
        orderBy: { name: 'asc' },
      });
      res.json(items);
    } catch (e) { next(e); }
  });
  // Position Profile schemas
  const ProfileSchema = z.object({
    knowledge: z.string().optional().nullable(),
    specificSkills: z.string().optional().nullable(),
    experienceYears: z.number().int().min(0).max(60).optional().nullable(),
    educationLevel: z.string().optional().nullable(),
    responsibilities: z.string().optional().nullable(),
    authorityLevel: z.string().optional().nullable(),
  });

  // Get Position Profile
  router.get('/:id/profile', requireAuth, async (req, res, next) => {
    try {
      const orgId = req.organizationId;
      const position = await prisma.position.findFirst({ where: { id: req.params.id, organizationId: orgId } });
      if (!position) return res.status(404).json({ error: 'Position not found' });
      const profile = await prisma.positionProfile.findUnique({ where: { positionId: position.id } });
      res.json(profile || null);
    } catch (e) { next(e); }
  });

  // Create Position Profile (admin)
  router.post('/:id/profile', requireAuth, requireRole('admin'), async (req, res, next) => {
    try {
      const orgId = req.organizationId;
      const position = await prisma.position.findFirst({ where: { id: req.params.id, organizationId: orgId } });
      if (!position) return res.status(404).json({ error: 'Position not found' });
      const exists = await prisma.positionProfile.findUnique({ where: { positionId: position.id } });
      if (exists) return res.status(409).json({ error: 'Profile already exists for this position' });
      const p = ProfileSchema.parse(req.body);
      const created = await prisma.positionProfile.create({
        data: {
          positionId: position.id,
          organizationId: orgId,
          knowledge: p.knowledge || null,
          specificSkills: p.specificSkills || null,
          experienceYears: p.experienceYears ?? null,
          educationLevel: p.educationLevel || null,
          responsibilities: p.responsibilities || null,
          authorityLevel: p.authorityLevel || null,
        },
      });
      res.status(201).json(created);
    } catch (e) { next(e); }
  });

  // Update Position Profile (admin)
  router.put('/:id/profile', requireAuth, requireRole('admin'), async (req, res, next) => {
    try {
      const orgId = req.organizationId;
      const position = await prisma.position.findFirst({ where: { id: req.params.id, organizationId: orgId } });
      if (!position) return res.status(404).json({ error: 'Position not found' });
      const p = ProfileSchema.parse(req.body);
      const up = await prisma.positionProfile.upsert({
        where: { positionId: position.id },
        update: {
          knowledge: p.knowledge || null,
          specificSkills: p.specificSkills || null,
          experienceYears: p.experienceYears ?? null,
          educationLevel: p.educationLevel || null,
          responsibilities: p.responsibilities || null,
          authorityLevel: p.authorityLevel || null,
        },
        create: {
          positionId: position.id,
          organizationId: orgId,
          knowledge: p.knowledge || null,
          specificSkills: p.specificSkills || null,
          experienceYears: p.experienceYears ?? null,
          educationLevel: p.educationLevel || null,
          responsibilities: p.responsibilities || null,
          authorityLevel: p.authorityLevel || null,
        },
      });
      res.json(up);
    } catch (e) { next(e); }
  });

  // Job Analysis schemas
  const FuncSchema = z.object({
    index: z.number().int().min(1).max(6),
    title: z.string().min(2),
    description: z.string().optional().nullable(),
    importance: z.number().int().min(1).max(5),
    timePercent: z.number().int().min(0).max(100).optional().nullable(),
  });
  const JobAnalysisSchema = z.object({
    occupantEmployeeId: z.string().uuid().optional().nullable(),
    supervisorEmployeeId: z.string().uuid().optional().nullable(),
    departmentId: z.string().uuid().optional().nullable(),
    purpose: z.string().optional().nullable(),
    observations: z.string().optional().nullable(),
    primaryDutyIndex: z.number().int().min(1).max(6).optional().nullable(),
    functions: z.array(FuncSchema).max(6).optional().default([]),
  });

  // Get Job Analysis for a position
  router.get('/:id/job-analysis', requireAuth, async (req, res, next) => {
    try {
      const orgId = req.organizationId;
      const position = await prisma.position.findFirst({ where: { id: req.params.id, organizationId: orgId } });
      if (!position) return res.status(404).json({ error: 'Position not found' });
      const ja = await prisma.jobAnalysis.findUnique({
        where: { positionId: position.id },
        include: { functions: { orderBy: { index: 'asc' } } },
      });
      res.json(ja || null);
    } catch (e) { next(e); }
  });

  // Create Job Analysis (admin)
  router.post('/:id/job-analysis', requireAuth, requireRole('admin'), async (req, res, next) => {
    try {
      const orgId = req.organizationId;
      const position = await prisma.position.findFirst({ where: { id: req.params.id, organizationId: orgId } });
      if (!position) return res.status(404).json({ error: 'Position not found' });
      const exists = await prisma.jobAnalysis.findUnique({ where: { positionId: position.id } });
      if (exists) return res.status(409).json({ error: 'Job analysis already exists for this position' });
      const payload = JobAnalysisSchema.parse(req.body);

      const created = await prisma.$transaction(async (tx) => {
        const ja = await tx.jobAnalysis.create({
          data: {
            positionId: position.id,
            organizationId: orgId,
            occupantEmployeeId: payload.occupantEmployeeId || null,
            supervisorEmployeeId: payload.supervisorEmployeeId || null,
            departmentId: payload.departmentId || null,
            purpose: payload.purpose || null,
            observations: payload.observations || null,
            primaryDutyIndex: payload.primaryDutyIndex || null,
          },
        });
        if (payload.functions && payload.functions.length) {
          await tx.essentialFunction.createMany({
            data: payload.functions.map((f) => ({
              jobAnalysisId: ja.id,
              index: f.index,
              title: f.title,
              description: f.description || null,
              importance: f.importance,
              timePercent: f.timePercent ?? null,
            })),
            skipDuplicates: true,
          });
        }
        return ja;
      });

      const withFuncs = await prisma.jobAnalysis.findUnique({ where: { positionId: position.id }, include: { functions: { orderBy: { index: 'asc' } } } });
      res.status(201).json(withFuncs);
    } catch (e) { next(e); }
  });

  // Update Job Analysis (admin)
  router.put('/:id/job-analysis', requireAuth, requireRole('admin'), async (req, res, next) => {
    try {
      const orgId = req.organizationId;
      const position = await prisma.position.findFirst({ where: { id: req.params.id, organizationId: orgId } });
      if (!position) return res.status(404).json({ error: 'Position not found' });
      const payload = JobAnalysisSchema.parse(req.body);
      const ja = await prisma.jobAnalysis.upsert({
        where: { positionId: position.id },
        update: {
          occupantEmployeeId: payload.occupantEmployeeId || null,
          supervisorEmployeeId: payload.supervisorEmployeeId || null,
          departmentId: payload.departmentId || null,
          purpose: payload.purpose || null,
          observations: payload.observations || null,
          primaryDutyIndex: payload.primaryDutyIndex || null,
        },
        create: {
          positionId: position.id,
          organizationId: orgId,
          occupantEmployeeId: payload.occupantEmployeeId || null,
          supervisorEmployeeId: payload.supervisorEmployeeId || null,
          departmentId: payload.departmentId || null,
          purpose: payload.purpose || null,
          observations: payload.observations || null,
          primaryDutyIndex: payload.primaryDutyIndex || null,
        },
      });

      // Replace functions set with provided payload.functions if present
      if (payload.functions) {
        await prisma.$transaction([
          prisma.essentialFunction.deleteMany({ where: { jobAnalysisId: ja.id } }),
          ...(payload.functions.map((f) => prisma.essentialFunction.create({
            data: {
              jobAnalysisId: ja.id,
              index: f.index,
              title: f.title,
              description: f.description || null,
              importance: f.importance,
              timePercent: f.timePercent ?? null,
            },
          }))),
        ]);
      }

      const withFuncs = await prisma.jobAnalysis.findUnique({ where: { positionId: position.id }, include: { functions: { orderBy: { index: 'asc' } } } });
      res.json(withFuncs);
    } catch (e) { next(e); }
  });

  // Update position (admin)
  const UpdateSchema = z.object({
    name: z.string().min(2),
    description: z.string().optional().nullable(),
    level: z.string().optional().nullable(),
    departmentId: z.string().uuid().optional().nullable(),
  });
  router.put('/:id', requireAuth, requireRole('admin'), async (req, res, next) => {
    try {
      const { id } = req.params;
      const { name, description, level, departmentId } = UpdateSchema.parse(req.body);
      const orgId = req.organizationId;

      const pos = await prisma.position.findUnique({ where: { id } });
      if (!pos || pos.organizationId !== orgId) return res.status(404).json({ error: 'Position not found' });

      if (departmentId) {
        const dep = await prisma.department.findFirst({ where: { id: departmentId, organizationId: orgId } });
        if (!dep) return res.status(400).json({ error: 'Invalid departmentId for this organization' });
      }

      const updated = await prisma.position.update({
        where: { id },
        data: { name, description: description ?? null, level: level ?? null, departmentId: departmentId ?? null },
      });
      res.json(updated);
    } catch (e) {
      if (e?.code === 'P2002') return res.status(409).json({ error: 'Position name already exists' });
      if (e?.code === 'P2025') return res.status(404).json({ error: 'Position not found' });
      next(e);
    }
  });

  // Delete position (admin)
  router.delete('/:id', requireAuth, requireRole('admin'), async (req, res, next) => {
    try {
      const { id } = req.params;
      const orgId = req.organizationId;
      const pos = await prisma.position.findUnique({ where: { id } });
      if (!pos || pos.organizationId !== orgId) return res.status(404).json({ error: 'Position not found' });
      await prisma.position.delete({ where: { id } });
      res.status(204).send();
    } catch (e) {
      if (e?.code === 'P2003') return res.status(409).json({ error: 'Position is in use and cannot be deleted' });
      next(e);
    }
  });

  // Create position (admin)
  const CreateSchema = z.object({
    name: z.string().min(2),
    description: z.string().optional(),
    level: z.string().optional(),
    departmentId: z.string().uuid().optional().nullable(),
  });
  router.post('/', requireAuth, requireRole('admin'), async (req, res, next) => {
    try {
      const { name, description, level, departmentId } = CreateSchema.parse(req.body);
      const orgId = req.organizationId;
      if (departmentId) {
        const dep = await prisma.department.findFirst({ where: { id: departmentId, organizationId: orgId } });
        if (!dep) return res.status(400).json({ error: 'Invalid departmentId for this organization' });
      }
      const created = await prisma.position.create({
        data: { name, description: description || null, level: level || null, departmentId: departmentId || null, organizationId: orgId },
      });
      res.status(201).json(created);
    } catch (e) { next(e); }
  });

  // Get position with requirements
  router.get('/:id', requireAuth, async (req, res, next) => {
    try {
      const orgId = req.organizationId;
      const pos = await prisma.position.findFirst({
        where: { id: req.params.id, organizationId: orgId },
        include: { requirements: { include: { competency: true } }, department: true },
      });
      if (!pos) return res.status(404).json({ error: 'Not found' });
      res.json(pos);
    } catch (e) { next(e); }
  });

  // Upsert requirements (array of {competencyId, weight, expectedLvl}) (admin)
  const ReqSchema = z.object({
    items: z.array(z.object({
      competencyId: z.string().uuid(),
      weight: z.number().min(0).max(1),
      expectedLvl: z.number().int().min(1).max(5),
    })).min(1),
  });
  router.post('/:id/requirements', requireAuth, requireRole('admin'), async (req, res, next) => {
    try {
      const { items } = ReqSchema.parse(req.body);
      const orgId = req.organizationId;
      const position = await prisma.position.findFirst({ where: { id: req.params.id, organizationId: orgId } });
      if (!position) return res.status(404).json({ error: 'Position not found' });

      // Validate competencies belong to org
      const compIds = items.map(i => i.competencyId);
      const validCount = await prisma.competency.count({ where: { id: { in: compIds }, organizationId: orgId } });
      if (validCount !== compIds.length) return res.status(400).json({ error: 'Invalid competencyId in items' });

      // Upsert items
      const ops = items.map(i => prisma.positionCompetency.upsert({
        where: { positionId_competencyId: { positionId: position.id, competencyId: i.competencyId } },
        update: { weight: i.weight, expectedLvl: i.expectedLvl },
        create: { positionId: position.id, competencyId: i.competencyId, weight: i.weight, expectedLvl: i.expectedLvl },
      }));
      await prisma.$transaction(ops);

      const updated = await prisma.position.findUnique({
        where: { id: position.id },
        include: { requirements: { include: { competency: true } } },
      });
      res.json(updated);
    } catch (e) { next(e); }
  });

  return router;
}
