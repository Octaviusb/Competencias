import express from 'express';

const router = express.Router();

export default function publicRouter(prisma) {
  // Public endpoint to list organizations for selection
  router.get('/organizations', async (req, res, next) => {
    try {
      const items = await prisma.organization.findMany({ 
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, createdAt: true }
      });
      res.json(items);
    } catch (err) { 
      next(err); 
    }
  });

  // Public endpoint to create new organizations
  router.post('/organizations', async (req, res, next) => {
    try {
      const { name } = req.body;
      if (!name || name.length < 2) {
        return res.status(400).json({ error: 'Name is required (min 2 characters)' });
      }

      const org = await prisma.organization.create({ data: { name } });
      
      // Create default roles for this organization
      await prisma.role.createMany({ 
        data: [
          { name: 'admin', organizationId: org.id },
          { name: 'director', organizationId: org.id },
          { name: 'auditor', organizationId: org.id },
          { name: 'usuario', organizationId: org.id },
        ]
      });
      
      res.status(201).json(org);
    } catch (err) {
      if (err?.code === 'P2002') {
        return res.status(409).json({ error: 'Organization name already exists' });
      }
      next(err);
    }
  });

  // Ensure and return a single demo organization
  router.get('/demo-org', async (req, res, next) => {
    try {
      // Try to find an existing demo organization by common demo names
      let org = await prisma.organization.findFirst({
        where: { name: { in: ['demo-org', 'Empresa Demo'] } },
        orderBy: { createdAt: 'asc' }
      });

      if (!org) {
        // Create a single demo organization
        org = await prisma.organization.create({ data: { name: 'Empresa Demo' } });
      }

      // Ensure default roles exist for this organization
      const existingRoles = await prisma.role.findMany({ where: { organizationId: org.id } });
      if (existingRoles.length === 0) {
        await prisma.role.createMany({
          data: [
            { name: 'admin', organizationId: org.id },
            { name: 'director', organizationId: org.id },
            { name: 'auditor', organizationId: org.id },
            { name: 'usuario', organizationId: org.id },
          ]
        });
      }

      return res.json({ id: org.id, name: org.name, createdAt: org.createdAt });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
