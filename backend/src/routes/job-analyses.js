import { Router } from 'express';

/**
 * @swagger
 * components:
 *   schemas:
 *     JobAnalysis:
 *       type: object
 *       required:
 *         - positionId
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         positionId:
 *           type: string
 *           format: uuid
 *         occupantEmployeeId:
 *           type: string
 *           format: uuid
 *         supervisorEmployeeId:
 *           type: string
 *           format: uuid
 *         departmentId:
 *           type: string
 *           format: uuid
 *         purpose:
 *           type: string
 *           description: Section I - Propósito del Trabajo
 *         primaryDutyIndex:
 *           type: integer
 *           description: Selected primary function 1..6
 *         observations:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         functions:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/EssentialFunction'
 *         context:
 *           $ref: '#/components/schemas/JobAnalysisContext'
 *         competencies:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/JobAnalysisCompetency'
 *         expectations:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/JobAnalysisExpectation'
 *     EssentialFunction:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - importance
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         importance:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         timePercent:
 *           type: integer
 *           minimum: 0
 *           maximum: 100
 *     JobAnalysisContext:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         workEnvironment:
 *           type: string
 *         interpersonalRelationships:
 *           type: string
 *         toolsAndResources:
 *           type: string
 *         trainingRequired:
 *           type: string
 *         physicalDemands:
 *           type: string
 *         workingConditions:
 *           type: string
 *         travelRequirements:
 *           type: string
 *         safetyConsiderations:
 *           type: string
 *     JobAnalysisCompetency:
 *       type: object
 *       required:
 *         - competencyId
 *         - importance
 *         - requiredLevel
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         competencyId:
 *           type: string
 *           format: uuid
 *         importance:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         requiredLevel:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         acquisitionMethod:
 *           type: string
 *           enum: [experience, training, education, certification]
 *         validationMethod:
 *           type: string
 *         competency:
 *           $ref: '#/components/schemas/Competency'
 *     JobAnalysisExpectation:
 *       type: object
 *       required:
 *         - title
 *         - description
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         measurementCriteria:
 *           type: string
 *         timeframe:
 *           type: string
 *         weight:
 *           type: number
 */

/**
 * @swagger
 * /api/job-analyses:
 *   get:
 *     summary: Get all job analyses
 *     tags: [Job Analyses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: positionId
 *         schema:
 *           type: string
 *         description: Filter by position ID
 *       - in: query
 *         name: departmentId
 *         schema:
 *           type: string
 *         description: Filter by department ID
 *     responses:
 *       200:
 *         description: List of job analyses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/JobAnalysis'
 *   post:
 *     summary: Create a new job analysis
 *     tags: [Job Analyses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/JobAnalysis'
 *     responses:
 *       201:
 *         description: Job analysis created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JobAnalysis'
 * 
 * /api/job-analyses/{id}:
 *   get:
 *     summary: Get job analysis by ID
 *     tags: [Job Analyses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job analysis ID
 *     responses:
 *       200:
 *         description: Job analysis details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JobAnalysis'
 *       404:
 *         description: Job analysis not found
 *   put:
 *     summary: Update job analysis
 *     tags: [Job Analyses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job analysis ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/JobAnalysis'
 *     responses:
 *       200:
 *         description: Job analysis updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JobAnalysis'
 *       404:
 *         description: Job analysis not found
 *   delete:
 *     summary: Delete job analysis
 *     tags: [Job Analyses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job analysis ID
 *     responses:
 *       204:
 *         description: Job analysis deleted successfully
 *       404:
 *         description: Job analysis not found
 */

export default function createJobAnalysesRouter(prisma) {
  const router = Router();

  // Get all job analyses
  router.get('/', async (req, res) => {
    try {
      const { positionId, departmentId } = req.query;
      const tenantId = req.tenantId;

      const where = {
        organizationId: tenantId,
        ...(positionId && { positionId }),
        ...(departmentId && { departmentId }),
      };

      const jobAnalyses = await prisma.jobAnalysis.findMany({
        where,
        include: {
          position: {
            select: {
              id: true,
              name: true,
              description: true,
              level: true,
              department: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          occupant: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              title: true,
            },
          },
          supervisor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              title: true,
            },
          },
          department: {
            select: {
              id: true,
              name: true,
            },
          },
          functions: {
            orderBy: {
              index: 'asc',
            },
          },
          context: true,
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
          expectations: {
            orderBy: {
              weight: 'desc',
            },
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
      });

      res.json(jobAnalyses);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create job analysis
  router.post('/', async (req, res) => {
    try {
      const {
        positionId,
        occupantEmployeeId,
        supervisorEmployeeId,
        departmentId,
        purpose,
        primaryDutyIndex,
        observations,
        functions,
        context,
        competencies,
        expectations,
      } = req.body;

      const tenantId = req.tenantId;

      // Validate required fields
      if (!positionId) {
        return res.status(400).json({ error: 'positionId is required' });
      }

      // Validate position exists and belongs to the same organization
      const position = await prisma.position.findFirst({
        where: { id: positionId, organizationId: tenantId },
      });

      if (!position) {
        return res.status(404).json({ error: 'Position not found' });
      }

      // Check if job analysis already exists for this position
      const existingAnalysis = await prisma.jobAnalysis.findFirst({
        where: { positionId, organizationId: tenantId },
      });

      if (existingAnalysis) {
        return res.status(400).json({ 
          error: 'Job analysis already exists for this position' 
        });
      }

      const jobAnalysis = await prisma.jobAnalysis.create({
        data: {
          positionId,
          occupantEmployeeId,
          supervisorEmployeeId,
          departmentId,
          purpose,
          primaryDutyIndex,
          observations,
          organizationId: tenantId,
          functions: functions
            ? {
                create: functions.map((func) => ({
                  index: func.index,
                  title: func.title,
                  description: func.description,
                  importance: func.importance,
                  timePercent: func.timePercent,
                })),
              }
            : undefined,
          context: context
            ? {
                create: {
                  workEnvironment: context.workEnvironment,
                  interpersonalRelationships: context.interpersonalRelationships,
                  toolsAndResources: context.toolsAndResources,
                  trainingRequired: context.trainingRequired,
                  physicalDemands: context.physicalDemands,
                  workingConditions: context.workingConditions,
                  travelRequirements: context.travelRequirements,
                  safetyConsiderations: context.safetyConsiderations,
                },
              }
            : undefined,
          competencies: competencies
            ? {
                create: competencies.map((comp) => ({
                  competencyId: comp.competencyId,
                  importance: comp.importance,
                  requiredLevel: comp.requiredLevel,
                  acquisitionMethod: comp.acquisitionMethod,
                  validationMethod: comp.validationMethod,
                })),
              }
            : undefined,
          expectations: expectations
            ? {
                create: expectations.map((exp) => ({
                  title: exp.title,
                  description: exp.description,
                  measurementCriteria: exp.measurementCriteria,
                  timeframe: exp.timeframe,
                  weight: exp.weight,
                })),
              }
            : undefined,
        },
        include: {
          position: {
            select: {
              id: true,
              name: true,
              description: true,
              level: true,
              department: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          occupant: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              title: true,
            },
          },
          supervisor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              title: true,
            },
          },
          department: {
            select: {
              id: true,
              name: true,
            },
          },
          functions: {
            orderBy: {
              index: 'asc',
            },
          },
          context: true,
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
          expectations: {
            orderBy: {
              weight: 'desc',
            },
          },
        },
      });

      res.status(201).json(jobAnalysis);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get job analysis by ID
  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const tenantId = req.tenantId;

      const jobAnalysis = await prisma.jobAnalysis.findFirst({
        where: { id, organizationId: tenantId },
        include: {
          position: {
            select: {
              id: true,
              name: true,
              description: true,
              level: true,
              department: {
                select: {
                  id: true,
                  name: true,
                },
              },
              profile: true,
            },
          },
          occupant: {
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
          supervisor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              title: true,
            },
          },
          department: {
            select: {
              id: true,
              name: true,
            },
          },
          functions: {
            orderBy: {
              index: 'asc',
            },
          },
          context: true,
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
          expectations: {
            orderBy: {
              weight: 'desc',
            },
          },
        },
      });

      if (!jobAnalysis) {
        return res.status(404).json({ error: 'Job analysis not found' });
      }

      res.json(jobAnalysis);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update job analysis
  router.put('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const {
        occupantEmployeeId,
        supervisorEmployeeId,
        departmentId,
        purpose,
        primaryDutyIndex,
        observations,
      } = req.body;

      const tenantId = req.tenantId;

      // Check if job analysis exists
      const existingJobAnalysis = await prisma.jobAnalysis.findFirst({
        where: { id, organizationId: tenantId },
      });

      if (!existingJobAnalysis) {
        return res.status(404).json({ error: 'Job analysis not found' });
      }

      const jobAnalysis = await prisma.jobAnalysis.update({
        where: { id },
        data: {
          ...(occupantEmployeeId !== undefined && { occupantEmployeeId }),
          ...(supervisorEmployeeId !== undefined && { supervisorEmployeeId }),
          ...(departmentId !== undefined && { departmentId }),
          ...(purpose !== undefined && { purpose }),
          ...(primaryDutyIndex !== undefined && { primaryDutyIndex }),
          ...(observations !== undefined && { observations }),
        },
        include: {
          position: {
            select: {
              id: true,
              name: true,
              description: true,
              level: true,
              department: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          occupant: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              title: true,
            },
          },
          supervisor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              title: true,
            },
          },
          department: {
            select: {
              id: true,
              name: true,
            },
          },
          functions: {
            orderBy: {
              index: 'asc',
            },
          },
          context: true,
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
          expectations: {
            orderBy: {
              weight: 'desc',
            },
          },
        },
      });

      res.json(jobAnalysis);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Delete job analysis
  router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const tenantId = req.tenantId;

      const existingJobAnalysis = await prisma.jobAnalysis.findFirst({
        where: { id, organizationId: tenantId },
      });

      if (!existingJobAnalysis) {
        return res.status(404).json({ error: 'Job analysis not found' });
      }

      await prisma.jobAnalysis.delete({
        where: { id },
      });

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update job analysis context
  router.put('/:id/context', async (req, res) => {
    try {
      const { id } = req.params;
      const {
        workEnvironment,
        interpersonalRelationships,
        toolsAndResources,
        trainingRequired,
        physicalDemands,
        workingConditions,
        travelRequirements,
        safetyConsiderations,
      } = req.body;

      const tenantId = req.tenantId;

      const jobAnalysis = await prisma.jobAnalysis.findFirst({
        where: { id, organizationId: tenantId },
      });

      if (!jobAnalysis) {
        return res.status(404).json({ error: 'Job analysis not found' });
      }

      const context = await prisma.jobAnalysisContext.upsert({
        where: { jobAnalysisId: id },
        update: {
          workEnvironment,
          interpersonalRelationships,
          toolsAndResources,
          trainingRequired,
          physicalDemands,
          workingConditions,
          travelRequirements,
          safetyConsiderations,
        },
        create: {
          jobAnalysisId: id,
          workEnvironment,
          interpersonalRelationships,
          toolsAndResources,
          trainingRequired,
          physicalDemands,
          workingConditions,
          travelRequirements,
          safetyConsiderations,
        },
      });

      res.json(context);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Add essential function
  router.post('/:id/functions', async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description, importance, timePercent } = req.body;
      const tenantId = req.tenantId;

      if (!title || !description || importance === undefined) {
        return res.status(400).json({ 
          error: 'title, description, and importance are required' 
        });
      }

      const jobAnalysis = await prisma.jobAnalysis.findFirst({
        where: { id, organizationId: tenantId },
      });

      if (!jobAnalysis) {
        return res.status(404).json({ error: 'Job analysis not found' });
      }

      // Get the next index
      const lastFunction = await prisma.essentialFunction.findFirst({
        where: { jobAnalysisId: id },
        orderBy: { index: 'desc' },
      });

      const nextIndex = lastFunction ? lastFunction.index + 1 : 1;

      const functionData = await prisma.essentialFunction.create({
        data: {
          jobAnalysisId: id,
          index: nextIndex,
          title,
          description,
          importance,
          timePercent,
        },
      });

      res.status(201).json(functionData);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Add competency to job analysis
  router.post('/:id/competencies', async (req, res) => {
    try {
      const { id } = req.params;
      const { 
        competencyId, 
        importance, 
        requiredLevel, 
        acquisitionMethod, 
        validationMethod 
      } = req.body;
      const tenantId = req.tenantId;

      if (!competencyId || importance === undefined || requiredLevel === undefined) {
        return res.status(400).json({ 
          error: 'competencyId, importance, and requiredLevel are required' 
        });
      }

      const jobAnalysis = await prisma.jobAnalysis.findFirst({
        where: { id, organizationId: tenantId },
      });

      if (!jobAnalysis) {
        return res.status(404).json({ error: 'Job analysis not found' });
      }

      // Check if competency exists and belongs to the same organization
      const competency = await prisma.competency.findFirst({
        where: { id: competencyId, organizationId: tenantId },
      });

      if (!competency) {
        return res.status(404).json({ error: 'Competency not found' });
      }

      // Check if competency already exists for this job analysis
      const existingCompetency = await prisma.jobAnalysisCompetency.findFirst({
        where: { jobAnalysisId: id, competencyId },
      });

      if (existingCompetency) {
        return res.status(400).json({ 
          error: 'Competency already exists for this job analysis' 
        });
      }

      const competencyData = await prisma.jobAnalysisCompetency.create({
        data: {
          jobAnalysisId: id,
          competencyId,
          importance,
          requiredLevel,
          acquisitionMethod,
          validationMethod,
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

      res.status(201).json(competencyData);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Add expectation to job analysis
  router.post('/:id/expectations', async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description, measurementCriteria, timeframe, weight } = req.body;
      const tenantId = req.tenantId;

      if (!title || !description) {
        return res.status(400).json({ error: 'title and description are required' });
      }

      const jobAnalysis = await prisma.jobAnalysis.findFirst({
        where: { id, organizationId: tenantId },
      });

      if (!jobAnalysis) {
        return res.status(404).json({ error: 'Job analysis not found' });
      }

      const expectation = await prisma.jobAnalysisExpectation.create({
        data: {
          jobAnalysisId: id,
          title,
          description,
          measurementCriteria,
          timeframe,
          weight,
        },
      });

      res.status(201).json(expectation);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Generate competency gap analysis
  router.get('/:id/gap-analysis', async (req, res) => {
    try {
      const { id } = req.params;
      const tenantId = req.tenantId;

      const jobAnalysis = await prisma.jobAnalysis.findFirst({
        where: { id, organizationId: tenantId },
        include: {
          competencies: {
            include: {
              competency: true,
            },
          },
          position: {
            include: {
              holders: {
                where: {
                  effectiveTo: null, // Only current position holders
                },
                include: {
                  employee: {
                    include: {
                      evaluations: {
                        include: {
                          results: {
                            include: {
                              competency: true,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!jobAnalysis) {
        return res.status(404).json({ error: 'Job analysis not found' });
      }

      // Analyze gaps for each employee in the position
      const gapAnalysis = jobAnalysis.position.holders.map(holder => {
        const employee = holder.employee;
        const employeeCompetencies = new Map();
        
        // Aggregate employee's competency ratings from evaluations
        employee.evaluations.forEach(evaluation => {
          evaluation.results.forEach(result => {
            const existing = employeeCompetencies.get(result.competencyId);
            if (!existing || result.score > existing.rating) {
              employeeCompetencies.set(result.competencyId, {
                competency: result.competency,
                rating: result.score,
              });
            }
          });
        });

        // Compare with required competencies
        const gaps = jobAnalysis.competencies.map(required => {
          const employeeCompetency = employeeCompetencies.get(required.competencyId);
          const gap = employeeCompetency 
            ? required.requiredLevel - employeeCompetency.rating
            : required.requiredLevel;

          return {
            competency: required.competency,
            requiredLevel: required.requiredLevel,
            currentLevel: employeeCompetency?.rating || 0,
            gap: Math.max(0, gap),
            importance: required.importance,
            acquisitionMethod: required.acquisitionMethod,
          };
        });

        return {
          employee: {
            id: employee.id,
            firstName: employee.firstName,
            lastName: employee.lastName,
            title: employee.title,
          },
          gaps,
          totalGap: gaps.reduce((sum, g) => sum + g.gap, 0),
          priorityGaps: gaps.filter(g => g.gap > 0 && g.importance >= 4),
        };
      });

      res.json({
        jobAnalysis: {
          id: jobAnalysis.id,
          position: jobAnalysis.position,
        },
        gapAnalysis,
        summary: {
          totalEmployees: gapAnalysis.length,
          employeesWithGaps: gapAnalysis.filter(emp => emp.totalGap > 0).length,
          averageGap: gapAnalysis.reduce((sum, emp) => sum + emp.totalGap, 0) / gapAnalysis.length || 0,
          criticalGaps: gapAnalysis.reduce((sum, emp) => sum + emp.priorityGaps.length, 0),
        },
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get job analysis statistics
  router.get('/stats/overview', async (req, res) => {
    try {
      const tenantId = req.tenantId;

      const totalAnalyses = await prisma.jobAnalysis.count({
        where: { organizationId: tenantId },
      });

      const analysesByDepartment = await prisma.jobAnalysis.groupBy({
        by: ['departmentId'],
        where: { organizationId: tenantId },
        _count: {
          id: true,
        },
      });

      const avgCompetencies = await prisma.jobAnalysisCompetency.aggregate({
        where: {
          jobAnalysis: {
            organizationId: tenantId,
          },
        },
        _avg: {
          importance: true,
          requiredLevel: true,
        },
      });

      res.json({
        totalAnalyses,
        analysesByDepartment,
        averageCompetencyImportance: avgCompetencies._avg.importance,
        averageRequiredLevel: avgCompetencies._avg.requiredLevel,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}
