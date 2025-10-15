import express from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

export default function documentsRouter(prisma) {
  // List documents
  router.get('/', requireAuth, async (req, res, next) => {
    try {
      const orgId = req.organizationId;
      const { type, relatedEntityType, relatedEntityId } = req.query;

      const where = { organizationId: orgId };
      if (type) where.type = type;
      if (relatedEntityType) where.relatedEntityType = relatedEntityType;
      if (relatedEntityId) where.relatedEntityId = relatedEntityId;

      const items = await prisma.document.findMany({
        where,
        include: { createdBy: { select: { firstName: true, lastName: true } } },
        orderBy: { createdAt: 'desc' },
      });

      res.json(items);
    } catch (e) { next(e); }
  });

  // Get specific document
  router.get('/:id', requireAuth, async (req, res, next) => {
    try {
      const { id } = req.params;
      const orgId = req.organizationId;

      const document = await prisma.document.findUnique({
        where: { id },
        include: { createdBy: { select: { firstName: true, lastName: true } } },
      });

      if (!document || document.organizationId !== orgId) return res.status(404).json({ error: 'Document not found' });

      res.json(document);
    } catch (e) { next(e); }
  });

  // Create document
  const CreateSchema = z.object({
    title: z.string().min(1),
    type: z.string().min(1),
    content: z.string().min(1),
    relatedEntityType: z.string().optional(),
    relatedEntityId: z.string().uuid().optional(),
  });

  router.post('/', requireAuth, async (req, res, next) => {
    try {
      const { title, type, content, relatedEntityType, relatedEntityId } = CreateSchema.parse(req.body);
      const orgId = req.organizationId;
      const userId = req.user.id;

      // Verify related entity exists if provided
      if (relatedEntityType && relatedEntityId) {
        // Basic validation - could be expanded
        if (relatedEntityType === 'Employee') {
          const emp = await prisma.employee.findFirst({ where: { id: relatedEntityId, organizationId: orgId } });
          if (!emp) return res.status(400).json({ error: 'Related employee not found' });
        } else if (relatedEntityType === 'DisciplinaryAction') {
          const action = await prisma.disciplinaryAction.findFirst({ where: { id: relatedEntityId, organizationId: orgId } });
          if (!action) return res.status(400).json({ error: 'Related disciplinary action not found' });
        }
      }

      const created = await prisma.document.create({
        data: {
          title,
          type,
          content,
          relatedEntityType: relatedEntityType || null,
          relatedEntityId: relatedEntityId || null,
          organizationId: orgId,
          createdById: userId,
        },
        include: { createdBy: { select: { firstName: true, lastName: true } } },
      });

      res.status(201).json(created);
    } catch (e) { next(e); }
  });

  // Update document
  const UpdateSchema = z.object({
    title: z.string().min(1).optional(),
    type: z.string().min(1).optional(),
    content: z.string().min(1).optional(),
  });

  router.put('/:id', requireAuth, async (req, res, next) => {
    try {
      const { id } = req.params;
      const updates = UpdateSchema.parse(req.body);
      const orgId = req.organizationId;

      const document = await prisma.document.findUnique({ where: { id } });
      if (!document || document.organizationId !== orgId) return res.status(404).json({ error: 'Document not found' });

      // Only creator or admin can update
      if (document.createdById !== req.user.id && !req.user.roles?.includes('admin')) {
        return res.status(403).json({ error: 'Not authorized to update this document' });
      }

      const updated = await prisma.document.update({
        where: { id },
        data: updates,
        include: { createdBy: { select: { firstName: true, lastName: true } } },
      });

      res.json(updated);
    } catch (e) { next(e); }
  });

  // Delete document
  router.delete('/:id', requireAuth, async (req, res, next) => {
    try {
      const { id } = req.params;
      const orgId = req.organizationId;

      const document = await prisma.document.findUnique({ where: { id } });
      if (!document || document.organizationId !== orgId) return res.status(404).json({ error: 'Document not found' });

      // Only creator or admin can delete
      if (document.createdById !== req.user.id && !req.user.roles?.includes('admin')) {
        return res.status(403).json({ error: 'Not authorized to delete this document' });
      }

      await prisma.document.delete({ where: { id } });
      res.status(204).send();
    } catch (e) { next(e); }
  });

  return router;
}
