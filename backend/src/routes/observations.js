import { Router } from 'express';
import notificationService from '../services/notifications.js';

/**
 * @swagger
 * components:
 *   schemas:
 *     Observation:
 *       type: object
 *       required:
 *         - employeeId
 *         - observerId
 *         - type
 *         - scheduledDate
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         employeeId:
 *           type: string
 *           format: uuid
 *         observerId:
 *           type: string
 *           format: uuid
 *         type:
 *           type: string
 *           enum: [formal, informal, 360_feedback]
 *         date:
 *           type: string
 *           format: date-time
 *         duration:
 *           type: integer
 *           description: Duration in minutes
 *         context:
 *           type: string
 *         overallRating:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         status:
 *           type: string
 *           enum: [draft, completed, archived]
 *         notes:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ObservationNote'
 *         behaviors:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ObservationBehavior'
 *         competencies:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ObservationCompetency'
 *     ObservationNote:
 *       type: object
 *       required:
 *         - content
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         content:
 *           type: string
 *         timestamp:
 *           type: string
 *           format: date-time
 *         category:
 *           type: string
 *           enum: [positive, negative, neutral, suggestion]
 *     ObservationBehavior:
 *       type: object
 *       required:
 *         - description
 *         - category
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         description:
 *           type: string
 *         category:
 *           type: string
 *           enum: [technical, soft_skill, leadership, communication, teamwork]
 *         rating:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         impact:
 *           type: string
 *           enum: [low, medium, high]
 *     ObservationCompetency:
 *       type: object
 *       required:
 *         - competencyId
 *         - rating
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         competencyId:
 *           type: string
 *           format: uuid
 *         rating:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         evidence:
 *           type: string
 *         suggestions:
 *           type: string
 */

/**
 * @swagger
 * /api/observations:
 *   get:
 *     summary: Get all observations
 *     tags: [Observations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: employeeId
 *         schema:
 *           type: string
 *         description: Filter by employee ID
 *       - in: query
 *         name: observerId
 *         schema:
 *           type: string
 *         description: Filter by observer ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by observation type
 *     responses:
 *       200:
 *         description: List of observations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Observation'
 *   post:
 *     summary: Create a new observation
 *     tags: [Observations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Observation'
 *     responses:
 *       201:
 *         description: Observation created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Observation'
 * 
 * /api/observations/{id}:
 *   get:
 *     summary: Get observation by ID
 *     tags: [Observations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Observation ID
 *     responses:
 *       200:
 *         description: Observation details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Observation'
 *       404:
 *         description: Observation not found
 *   put:
 *     summary: Update observation
 *     tags: [Observations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Observation ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Observation'
 *     responses:
 *       200:
 *         description: Observation updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Observation'
 *       404:
 *         description: Observation not found
 *   delete:
 *     summary: Delete observation
 *     tags: [Observations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Observation ID
 *     responses:
 *       204:
 *         description: Observation deleted successfully
 *       404:
 *         description: Observation not found
 */

export default function createObservationsRouter(prisma) {
  const router = Router();

  // Get all observations
  router.get('/', async (req, res) => {
    try {
      const { employeeId, observerId, status, type } = req.query;
      const tenantId = req.tenantId;

      const where = {
        organizationId: tenantId,
        ...(employeeId && { employeeId }),
        ...(observerId && { observerId }),
        ...(status && { status }),
        ...(type && { type }),
      };

      const observations = await prisma.observation.findMany({
        where,
        include: {
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              title: true,
            },
          },
          observer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              title: true,
            },
          },
          notes: true,
          behaviors: true,
          competencies: {
            include: {
              competency: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                },
              },
            },
          },
        },
        orderBy: {
          date: 'desc',
        },
      });

      res.json(observations);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create observation
  router.post('/', async (req, res) => {
    try {
      const {
        employeeId,
        observerId,
        type,
        date,
        duration,
        context,
        overallRating,
        status,
        notes,
        behaviors,
        competencies,
      } = req.body;

      const tenantId = req.tenantId;

      // Validate required fields
      if (!employeeId || !observerId || !type) {
        return res.status(400).json({ error: 'employeeId, observerId, and type are required' });
      }

      // Validate employee and observer exist and belong to the same organization
      const [employee, observer] = await Promise.all([
        prisma.employee.findFirst({
          where: { id: employeeId, organizationId: tenantId },
        }),
        prisma.employee.findFirst({
          where: { id: observerId, organizationId: tenantId },
        }),
      ]);

      if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
      }

      if (!observer) {
        return res.status(404).json({ error: 'Observer not found' });
      }

      const observation = await prisma.observation.create({
        data: {
          employeeId,
          observerId,
          type,
          date: date || new Date(),
          duration,
          context,
          overallRating,
          status: status || 'draft',
          organizationId: tenantId,
          notes: notes
            ? {
                create: notes.map((note) => ({
                  content: note.content,
                  category: note.category,
                })),
              }
            : undefined,
          behaviors: behaviors
            ? {
                create: behaviors.map((behavior) => ({
                  description: behavior.description,
                  category: behavior.category,
                  rating: behavior.rating,
                  impact: behavior.impact,
                })),
              }
            : undefined,
          competencies: competencies
            ? {
                create: competencies.map((comp) => ({
                  competencyId: comp.competencyId,
                  rating: comp.rating,
                  evidence: comp.evidence,
                  suggestions: comp.suggestions,
                })),
              }
            : undefined,
        },
        include: {
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              title: true,
            },
          },
          observer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              title: true,
            },
          },
          notes: true,
          behaviors: true,
          competencies: {
            include: {
              competency: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                },
              },
            },
          },
        },
      });

      // Send email notification
      try {
        await notificationService.notifyObservationCreated(observation, employee, observer);
      } catch (emailError) {
        console.warn('Failed to send observation notification email:', emailError);
        // Don't fail the request if email fails
      }

      res.status(201).json(observation);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get observation by ID
  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const tenantId = req.tenantId;

      const observation = await prisma.observation.findFirst({
        where: { id, organizationId: tenantId },
        include: {
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              title: true,
              department: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          observer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              title: true,
            },
          },
          notes: {
            orderBy: {
              timestamp: 'asc',
            },
          },
          behaviors: true,
          competencies: {
            include: {
              competency: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                  category: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!observation) {
        return res.status(404).json({ error: 'Observation not found' });
      }

      res.json(observation);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update observation
  router.put('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const {
        employeeId,
        observerId,
        type,
        date,
        duration,
        context,
        overallRating,
        status,
        notes,
        behaviors,
        competencies,
      } = req.body;

      const tenantId = req.tenantId;

      // Check if observation exists
      const existingObservation = await prisma.observation.findFirst({
        where: { id, organizationId: tenantId },
      });

      if (!existingObservation) {
        return res.status(404).json({ error: 'Observation not found' });
      }

      const observation = await prisma.observation.update({
        where: { id },
        data: {
          ...(employeeId && { employeeId }),
          ...(observerId && { observerId }),
          ...(type && { type }),
          ...(date && { date: new Date(date) }),
          ...(duration !== undefined && { duration }),
          ...(context !== undefined && { context }),
          ...(overallRating !== undefined && { overallRating }),
          ...(status && { status }),
        },
        include: {
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              title: true,
            },
          },
          observer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              title: true,
            },
          },
          notes: true,
          behaviors: true,
          competencies: {
            include: {
              competency: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                },
              },
            },
          },
        },
      });

      res.json(observation);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Delete observation
  router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const tenantId = req.tenantId;

      const existingObservation = await prisma.observation.findFirst({
        where: { id, organizationId: tenantId },
      });

      if (!existingObservation) {
        return res.status(404).json({ error: 'Observation not found' });
      }

      await prisma.observation.delete({
        where: { id },
      });

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Add note to observation
  router.post('/:id/notes', async (req, res) => {
    try {
      const { id } = req.params;
      const { content, category } = req.body;
      const tenantId = req.tenantId;

      if (!content) {
        return res.status(400).json({ error: 'content is required' });
      }

      const observation = await prisma.observation.findFirst({
        where: { id, organizationId: tenantId },
      });

      if (!observation) {
        return res.status(404).json({ error: 'Observation not found' });
      }

      const note = await prisma.observationNote.create({
        data: {
          observationId: id,
          content,
          category,
        },
      });

      res.status(201).json(note);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Add behavior to observation
  router.post('/:id/behaviors', async (req, res) => {
    try {
      const { id } = req.params;
      const { description, category, rating, impact } = req.body;
      const tenantId = req.tenantId;

      if (!description || !category) {
        return res.status(400).json({ error: 'description and category are required' });
      }

      const observation = await prisma.observation.findFirst({
        where: { id, organizationId: tenantId },
      });

      if (!observation) {
        return res.status(404).json({ error: 'Observation not found' });
      }

      const behavior = await prisma.observationBehavior.create({
        data: {
          observationId: id,
          description,
          category,
          rating,
          impact,
        },
      });

      res.status(201).json(behavior);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Add competency evaluation to observation
  router.post('/:id/competencies', async (req, res) => {
    try {
      const { id } = req.params;
      const { competencyId, rating, evidence, suggestions } = req.body;
      const tenantId = req.tenantId;

      if (!competencyId || rating === undefined) {
        return res.status(400).json({ error: 'competencyId and rating are required' });
      }

      const observation = await prisma.observation.findFirst({
        where: { id, organizationId: tenantId },
      });

      if (!observation) {
        return res.status(404).json({ error: 'Observation not found' });
      }

      // Check if competency exists and belongs to the same organization
      const competency = await prisma.competency.findFirst({
        where: { id: competencyId, organizationId: tenantId },
      });

      if (!competency) {
        return res.status(404).json({ error: 'Competency not found' });
      }

      const competencyEvaluation = await prisma.observationCompetency.create({
        data: {
          observationId: id,
          competencyId,
          rating,
          evidence,
          suggestions,
        },
        include: {
          competency: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
        },
      });

      res.status(201).json(competencyEvaluation);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get observation statistics
  router.get('/stats/overview', async (req, res) => {
    try {
      const tenantId = req.tenantId;

      const stats = await prisma.observation.groupBy({
        by: ['status', 'type'],
        where: { organizationId: tenantId },
        _count: {
          id: true,
        },
      });

      const totalObservations = await prisma.observation.count({
        where: { organizationId: tenantId },
      });

      const avgRating = await prisma.observation.aggregate({
        where: { 
          organizationId: tenantId,
          overallRating: { not: null },
        },
        _avg: {
          overallRating: true,
        },
      });

      res.json({
        totalObservations,
        averageRating: avgRating._avg.overallRating,
        breakdown: stats,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}
