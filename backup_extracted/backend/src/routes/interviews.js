import { Router } from 'express';
import notificationService from '../services/notifications.js';

/**
 * @swagger
 * components:
 *   schemas:
 *     Interview:
 *       type: object
 *       required:
 *         - employeeId
 *         - interviewerId
 *         - type
 *         - scheduledDate
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         employeeId:
 *           type: string
 *           format: uuid
 *         interviewerId:
 *           type: string
 *           format: uuid
 *         type:
 *           type: string
 *           enum: [performance, development, exit, promotion, onboarding]
 *         purpose:
 *           type: string
 *         scheduledDate:
 *           type: string
 *           format: date-time
 *         actualDate:
 *           type: string
 *           format: date-time
 *         duration:
 *           type: integer
 *           description: Duration in minutes
 *         status:
 *           type: string
 *           enum: [scheduled, in_progress, completed, cancelled, postponed]
 *         location:
 *           type: string
 *         virtualLink:
 *           type: string
 *         questions:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/InterviewQuestion'
 *         evaluations:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/InterviewEvaluation'
 *         notes:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/InterviewNote'
 *     InterviewQuestion:
 *       type: object
 *       required:
 *         - question
 *         - category
 *         - order
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         question:
 *           type: string
 *         category:
 *           type: string
 *           enum: [technical, behavioral, situational, competency, experience]
 *         order:
 *           type: integer
 *         required:
 *           type: boolean
 *         answers:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/InterviewAnswer'
 *     InterviewAnswer:
 *       type: object
 *       required:
 *         - answer
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         answer:
 *           type: string
 *         rating:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         followUp:
 *           type: string
 *     InterviewEvaluation:
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
 *         comments:
 *           type: string
 *         strengths:
 *           type: string
 *         improvements:
 *           type: string
 *     InterviewNote:
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
 *           enum: [general, concern, strength, action_item]
 */

/**
 * @swagger
 * /api/interviews:
 *   get:
 *     summary: Get all interviews
 *     tags: [Interviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: employeeId
 *         schema:
 *           type: string
 *         description: Filter by employee ID
 *       - in: query
 *         name: interviewerId
 *         schema:
 *           type: string
 *         description: Filter by interviewer ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by interview type
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by start date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by end date
 *     responses:
 *       200:
 *         description: List of interviews
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Interview'
 *   post:
 *     summary: Create a new interview
 *     tags: [Interviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Interview'
 *     responses:
 *       201:
 *         description: Interview created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Interview'
 * 
 * /api/interviews/{id}:
 *   get:
 *     summary: Get interview by ID
 *     tags: [Interviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Interview ID
 *     responses:
 *       200:
 *         description: Interview details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Interview'
 *       404:
 *         description: Interview not found
 *   put:
 *     summary: Update interview
 *     tags: [Interviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Interview ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Interview'
 *     responses:
 *       200:
 *         description: Interview updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Interview'
 *       404:
 *         description: Interview not found
 *   delete:
 *     summary: Delete interview
 *     tags: [Interviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Interview ID
 *     responses:
 *       204:
 *         description: Interview deleted successfully
 *       404:
 *         description: Interview not found
 */

export default function createInterviewsRouter(prisma) {
  const router = Router();

  // Get all interviews
  router.get('/', async (req, res) => {
    try {
      const { 
        employeeId, 
        interviewerId, 
        status, 
        type, 
        startDate, 
        endDate 
      } = req.query;
      const tenantId = req.tenantId;

      const where = {
        organizationId: tenantId,
        ...(employeeId && { employeeId }),
        ...(interviewerId && { interviewerId }),
        ...(status && { status }),
        ...(type && { type }),
        ...(startDate && endDate && {
          scheduledDate: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        }),
      };

      const interviews = await prisma.interview.findMany({
        where,
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
          interviewer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              title: true,
            },
          },
          questions: {
            include: {
              answers: true,
            },
            orderBy: {
              order: 'asc',
            },
          },
          evaluations: {
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
          notes: {
            orderBy: {
              timestamp: 'desc',
            },
          },
        },
        orderBy: {
          scheduledDate: 'desc',
        },
      });

      res.json(interviews);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create interview
  router.post('/', async (req, res) => {
    try {
      const {
        employeeId,
        interviewerId,
        type,
        purpose,
        scheduledDate,
        duration,
        location,
        virtualLink,
        acta,
        questions,
      } = req.body;

      const tenantId = req.tenantId;

      // Validate required fields
      if (!employeeId || !interviewerId || !type || !scheduledDate) {
        return res.status(400).json({ 
          error: 'employeeId, interviewerId, type, and scheduledDate are required' 
        });
      }

      // Validate employee and interviewer exist and belong to the same organization
      const [employee, interviewer] = await Promise.all([
        prisma.employee.findFirst({
          where: { id: employeeId, organizationId: tenantId },
        }),
        prisma.employee.findFirst({
          where: { id: interviewerId, organizationId: tenantId },
        }),
      ]);

      if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
      }

      if (!interviewer) {
        return res.status(404).json({ error: 'Interviewer not found' });
      }

      const interview = await prisma.interview.create({
        data: {
          employeeId,
          interviewerId,
          type,
          purpose,
          scheduledDate: new Date(scheduledDate),
          duration,
          location,
          virtualLink,
          acta,
          organizationId: tenantId,
          questions: questions
            ? {
                create: questions.map((q, index) => ({
                  question: q.question,
                  category: q.category,
                  order: q.order || index + 1,
                  required: q.required || false,
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
          interviewer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              title: true,
            },
          },
          questions: {
            include: {
              answers: true,
            },
            orderBy: {
              order: 'asc',
            },
          },
          evaluations: {
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
          notes: {
            orderBy: {
              timestamp: 'desc',
            },
          },
        },
      });

      // Send email notification
      try {
        await notificationService.notifyInterviewScheduled(interview, employee, interviewer);
      } catch (emailError) {
        console.warn('Failed to send interview notification email:', emailError);
        // Don't fail the request if email fails
      }

      res.status(201).json(interview);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get interview by ID
  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const tenantId = req.tenantId;

      const interview = await prisma.interview.findFirst({
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
          interviewer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              title: true,
            },
          },
          questions: {
            include: {
              answers: true,
            },
            orderBy: {
              order: 'asc',
            },
          },
          evaluations: {
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
          notes: {
            orderBy: {
              timestamp: 'desc',
            },
          },
        },
      });

      if (!interview) {
        return res.status(404).json({ error: 'Interview not found' });
      }

      res.json(interview);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update interview
  router.put('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const {
        employeeId,
        interviewerId,
        type,
        purpose,
        scheduledDate,
        actualDate,
        duration,
        status,
        location,
        virtualLink,
        acta,
      } = req.body;

      const tenantId = req.tenantId;

      // Check if interview exists
      const existingInterview = await prisma.interview.findFirst({
        where: { id, organizationId: tenantId },
      });

      if (!existingInterview) {
        return res.status(404).json({ error: 'Interview not found' });
      }

      const interview = await prisma.interview.update({
        where: { id },
        data: {
          ...(employeeId && { employeeId }),
          ...(interviewerId && { interviewerId }),
          ...(type && { type }),
          ...(purpose !== undefined && { purpose }),
          ...(scheduledDate && { scheduledDate: new Date(scheduledDate) }),
          ...(actualDate && { actualDate: new Date(actualDate) }),
          ...(duration !== undefined && { duration }),
          ...(status && { status }),
          ...(location !== undefined && { location }),
          ...(virtualLink !== undefined && { virtualLink }),
          ...(acta !== undefined && { acta }),
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
          interviewer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              title: true,
            },
          },
          questions: {
            include: {
              answers: true,
            },
            orderBy: {
              order: 'asc',
            },
          },
          evaluations: {
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
          notes: {
            orderBy: {
              timestamp: 'desc',
            },
          },
        },
      });

      res.json(interview);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Delete interview
  router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const tenantId = req.tenantId;

      const existingInterview = await prisma.interview.findFirst({
        where: { id, organizationId: tenantId },
      });

      if (!existingInterview) {
        return res.status(404).json({ error: 'Interview not found' });
      }

      await prisma.interview.delete({
        where: { id },
      });

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Start interview (change status to in_progress and set actualDate)
  router.post('/:id/start', async (req, res) => {
    try {
      const { id } = req.params;
      const tenantId = req.tenantId;

      const interview = await prisma.interview.findFirst({
        where: { id, organizationId: tenantId },
      });

      if (!interview) {
        return res.status(404).json({ error: 'Interview not found' });
      }

      if (interview.status !== 'scheduled') {
        return res.status(400).json({ 
          error: 'Interview must be in scheduled status to start' 
        });
      }

      const updatedInterview = await prisma.interview.update({
        where: { id },
        data: {
          status: 'in_progress',
          actualDate: new Date(),
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
          interviewer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              title: true,
            },
          },
          questions: {
            include: {
              answers: true,
            },
            orderBy: {
              order: 'asc',
            },
          },
        },
      });

      res.json(updatedInterview);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Complete interview (change status to completed)
  router.post('/:id/complete', async (req, res) => {
    try {
      const { id } = req.params;
      const tenantId = req.tenantId;

      const interview = await prisma.interview.findFirst({
        where: { id, organizationId: tenantId },
      });

      if (!interview) {
        return res.status(404).json({ error: 'Interview not found' });
      }

      if (interview.status !== 'in_progress') {
        return res.status(400).json({ 
          error: 'Interview must be in progress to complete' 
        });
      }

      const updatedInterview = await prisma.interview.update({
        where: { id },
        data: {
          status: 'completed',
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
          interviewer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              title: true,
            },
          },
          questions: {
            include: {
              answers: true,
            },
            orderBy: {
              order: 'asc',
            },
          },
          evaluations: {
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
          notes: {
            orderBy: {
              timestamp: 'desc',
            },
          },
        },
      });

      res.json(updatedInterview);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Add answer to question
  router.post('/:id/questions/:questionId/answers', async (req, res) => {
    try {
      const { id, questionId } = req.params;
      const { answer, rating, followUp } = req.body;
      const tenantId = req.tenantId;

      if (!answer) {
        return res.status(400).json({ error: 'answer is required' });
      }

      const question = await prisma.interviewQuestion.findFirst({
        where: { 
          id: questionId,
          interview: { 
            id, 
            organizationId: tenantId 
          },
        },
      });

      if (!question) {
        return res.status(404).json({ error: 'Question not found' });
      }

      const answerData = await prisma.interviewAnswer.create({
        data: {
          questionId,
          answer,
          rating,
          followUp,
        },
      });

      res.status(201).json(answerData);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Add competency evaluation
  router.post('/:id/evaluations', async (req, res) => {
    try {
      const { id } = req.params;
      const { competencyId, rating, comments, strengths, improvements } = req.body;
      const tenantId = req.tenantId;

      if (!competencyId || rating === undefined) {
        return res.status(400).json({ error: 'competencyId and rating are required' });
      }

      const interview = await prisma.interview.findFirst({
        where: { id, organizationId: tenantId },
      });

      if (!interview) {
        return res.status(404).json({ error: 'Interview not found' });
      }

      // Check if competency exists and belongs to the same organization
      const competency = await prisma.competency.findFirst({
        where: { id: competencyId, organizationId: tenantId },
      });

      if (!competency) {
        return res.status(404).json({ error: 'Competency not found' });
      }

      const evaluation = await prisma.interviewEvaluation.create({
        data: {
          interviewId: id,
          competencyId,
          rating,
          comments,
          strengths,
          improvements,
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

      res.status(201).json(evaluation);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Add note to interview
  router.post('/:id/notes', async (req, res) => {
    try {
      const { id } = req.params;
      const { content, category } = req.body;
      const tenantId = req.tenantId;

      if (!content) {
        return res.status(400).json({ error: 'content is required' });
      }

      const interview = await prisma.interview.findFirst({
        where: { id, organizationId: tenantId },
      });

      if (!interview) {
        return res.status(404).json({ error: 'Interview not found' });
      }

      const note = await prisma.interviewNote.create({
        data: {
          interviewId: id,
          content,
          category,
        },
      });

      res.status(201).json(note);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get interview statistics
  router.get('/stats/overview', async (req, res) => {
    try {
      const tenantId = req.tenantId;

      const stats = await prisma.interview.groupBy({
        by: ['status', 'type'],
        where: { organizationId: tenantId },
        _count: {
          id: true,
        },
      });

      const totalInterviews = await prisma.interview.count({
        where: { organizationId: tenantId },
      });

      const completedInterviews = await prisma.interview.count({
        where: { 
          organizationId: tenantId,
          status: 'completed',
        },
      });

      const avgDuration = await prisma.interview.aggregate({
        where: { 
          organizationId: tenantId,
          duration: { not: null },
        },
        _avg: {
          duration: true,
        },
      });

      res.json({
        totalInterviews,
        completedInterviews,
        completionRate: totalInterviews > 0 ? (completedInterviews / totalInterviews) * 100 : 0,
        averageDuration: avgDuration._avg.duration,
        breakdown: stats,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get interview templates by type
  router.get('/templates/{type}', async (req, res) => {
    try {
      const { type } = req.params;
      const tenantId = req.tenantId;

      // Return predefined question templates based on interview type
      const templates = {
        performance: [
          {
            category: 'behavioral',
            questions: [
              'Describe una situación en la que superaste las expectativas en tu trabajo.',
              '¿Cuáles consideras que son tus mayores fortalezas en este puesto?',
              '¿En qué áreas crees que necesitas mejorar?',
            ],
          },
          {
            category: 'competency',
            questions: [
              '¿Cómo manejas situaciones de presión o plazos ajustados?',
              'Describe tu experiencia trabajando en equipo.',
              '¿Cómo tomas decisiones importantes?',
            ],
          },
        ],
        development: [
          {
            category: 'development',
            questions: [
              '¿Cuáles son tus objetivos de desarrollo profesional a corto plazo?',
              '¿Qué habilidades te gustaría desarrollar en los próximos 6 meses?',
              '¿Cómo podemos apoyarte en tu crecimiento profesional?',
            ],
          },
        ],
        exit: [
          {
            category: 'experience',
            questions: [
              '¿Cuáles fueron los aspectos más positivos de tu experiencia aquí?',
              '¿Qué áreas crees que podrían mejorar en la empresa?',
              '¿Cuál fue la razón principal de tu decisión de irte?',
            ],
          },
        ],
        promotion: [
          {
            category: 'leadership',
            questions: [
              '¿Cómo te ves liderando equipos en el futuro?',
              'Describe tu experiencia tomando decisiones estratégicas.',
              '¿Cómo manejas conflictos dentro de un equipo?',
            ],
          },
        ],
        onboarding: [
          {
            category: 'experience',
            questions: [
              '¿Cuál ha sido tu experiencia hasta ahora en la empresa?',
              '¿Has recibido el apoyo y entrenamiento necesario?',
              '¿Hay algo que necesites para adaptarte mejor?',
            ],
          },
        ],
      };

      const template = templates[type];
      if (!template) {
        return res.status(404).json({ error: 'Template not found for this interview type' });
      }

      res.json(template);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}
