import express from 'express';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

export default function recruitmentRouter(prisma) {
  // Get job postings
  router.get('/jobs', requireAuth, async (req, res, next) => {
    try {
      const { organizationId } = req.user;
      const jobs = await prisma.jobPosting.findMany({
        where: { organizationId },
        include: {
          position: { select: { name: true } },
          department: { select: { name: true } },
          _count: { select: { applications: true } }
        },
        orderBy: { createdAt: 'desc' }
      });
      res.json(jobs);
    } catch (error) {
      next(error);
    }
  });

  // Create job posting
  router.post('/jobs', requireAuth, async (req, res, next) => {
    try {
      const { organizationId } = req.user;
      const job = await prisma.jobPosting.create({
        data: { ...req.body, organizationId },
        include: {
          position: { select: { name: true } },
          department: { select: { name: true } }
        }
      });
      res.status(201).json(job);
    } catch (error) {
      next(error);
    }
  });

  // Update job posting
  router.put('/jobs/:id', requireAuth, async (req, res, next) => {
    try {
      const { id } = req.params;
      const job = await prisma.jobPosting.update({
        where: { id },
        data: req.body,
        include: {
          position: { select: { name: true } },
          department: { select: { name: true } }
        }
      });
      res.json(job);
    } catch (error) {
      next(error);
    }
  });

  // Get candidates
  router.get('/candidates', requireAuth, async (req, res, next) => {
    try {
      const { organizationId } = req.user;
      const candidates = await prisma.candidate.findMany({
        where: { organizationId },
        include: {
          _count: { select: { applications: true } }
        },
        orderBy: { createdAt: 'desc' }
      });
      res.json(candidates);
    } catch (error) {
      next(error);
    }
  });

  // Create candidate
  router.post('/candidates', requireAuth, async (req, res, next) => {
    try {
      const { organizationId } = req.user;
      const candidate = await prisma.candidate.create({
        data: { ...req.body, organizationId }
      });
      res.status(201).json(candidate);
    } catch (error) {
      next(error);
    }
  });

  // Get applications
  router.get('/applications', requireAuth, async (req, res, next) => {
    try {
      const { organizationId } = req.user;
      const { jobPostingId, status } = req.query;
      
      const where = { organizationId };
      if (jobPostingId) where.jobPostingId = jobPostingId;
      if (status) where.status = status;

      const applications = await prisma.application.findMany({
        where,
        include: {
          candidate: { select: { firstName: true, lastName: true, email: true } },
          jobPosting: { select: { title: true } },
          stages: { orderBy: { id: 'asc' } }
        },
        orderBy: { appliedDate: 'desc' }
      });
      res.json(applications);
    } catch (error) {
      next(error);
    }
  });

  // Create application
  router.post('/applications', requireAuth, async (req, res, next) => {
    try {
      const { organizationId } = req.user;
      const { candidateId, jobPostingId, notes } = req.body;

      const application = await prisma.application.create({
        data: {
          candidateId,
          jobPostingId,
          notes,
          organizationId,
          stages: {
            create: {
              stage: 'application',
              status: 'pending'
            }
          }
        },
        include: {
          candidate: { select: { firstName: true, lastName: true, email: true } },
          jobPosting: { select: { title: true } },
          stages: true
        }
      });

      res.status(201).json(application);
    } catch (error) {
      next(error);
    }
  });

  // Update application status
  router.patch('/applications/:id/status', requireAuth, async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      const application = await prisma.application.update({
        where: { id },
        data: { status, notes },
        include: {
          candidate: { select: { firstName: true, lastName: true, email: true } },
          jobPosting: { select: { title: true } }
        }
      });

      res.json(application);
    } catch (error) {
      next(error);
    }
  });

  // Add application stage
  router.post('/applications/:id/stages', requireAuth, async (req, res, next) => {
    try {
      const { id } = req.params;
      const stage = await prisma.applicationStage.create({
        data: { applicationId: id, ...req.body }
      });
      res.status(201).json(stage);
    } catch (error) {
      next(error);
    }
  });

  return router;
}
