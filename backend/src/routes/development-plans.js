import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';

export default function developmentPlansRouter(prisma) {
  const router = Router();

  // Get all development plans
  router.get('/', requireAuth, async (req, res) => {
    try {
      const { organizationId, employeeId, status, priority } = req.query;

      if (!organizationId) {
        return res.status(400).json({ error: 'Organization ID is required' });
      }

      const where = {
        organizationId,
        ...(employeeId && { employeeId }),
        ...(status && { status }),
        ...(priority && { priority })
      };

      const plans = await prisma.developmentPlan.findMany({
        where,
        include: {
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              user: {
                select: {
                  email: true
                }
              }
            }
          },
          manager: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              user: {
                select: {
                  email: true
                }
              }
            }
          },
          goals: {
            include: {
              competency: {
                select: {
                  id: true,
                  name: true,
                  category: true
                }
              },
              activities: true,
              reviews: true
            }
          },
          reviews: {
            include: {
              reviewer: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true
                }
              }
            }
          },
          resources: true
        },
        orderBy: {
          id: 'desc'
        }
      });

      res.json(plans);
    } catch (error) {
      console.error('Error fetching development plans:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get development plan by ID
  router.get('/:id', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;

      const plan = await prisma.developmentPlan.findUnique({
        where: { id },
        include: {
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              user: {
                select: {
                  email: true
                }
              }
            }
          },
          manager: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              user: {
                select: {
                  email: true
                }
              }
            }
          },
          goals: {
            include: {
              competency: {
                select: {
                  id: true,
                  name: true,
                  category: true
                }
              },
              activities: true,
              reviews: true
            }
          },
          reviews: {
            include: {
              reviewer: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true
                }
              }
            }
          },
          resources: true
        }
      });

      if (!plan) {
        return res.status(404).json({ error: 'Development plan not found' });
      }

      res.json(plan);
    } catch (error) {
      console.error('Error fetching development plan:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Create development plan
  router.post('/', requireAuth, async (req, res) => {
    try {
      const data = req.body;

      const plan = await prisma.developmentPlan.create({
        data: {
          id: data.id || undefined,
          employeeId: data.employeeId,
          managerId: data.managerId,
          title: data.title,
          description: data.description,
          startDate: new Date(data.startDate),
          targetDate: new Date(data.targetDate),
          status: data.status || 'draft',
          priority: data.priority || 'medium',
          budget: data.budget,
          organizationId: data.organizationId
        },
        include: {
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          manager: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      });

      res.status(201).json(plan);
    } catch (error) {
      console.error('Error creating development plan:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Update development plan
  router.put('/:id', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const data = req.body;

      const existingPlan = await prisma.developmentPlan.findUnique({
        where: { id }
      });

      if (!existingPlan) {
        return res.status(404).json({ error: 'Development plan not found' });
      }

      const updateData = {
        ...(data.employeeId && { employeeId: data.employeeId }),
        ...(data.managerId !== undefined && { managerId: data.managerId }),
        ...(data.title && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.startDate && { startDate: new Date(data.startDate) }),
        ...(data.targetDate && { targetDate: new Date(data.targetDate) }),
        ...(data.status && { status: data.status }),
        ...(data.priority && { priority: data.priority }),
        ...(data.budget !== undefined && { budget: data.budget })
      };

      const plan = await prisma.developmentPlan.update({
        where: { id },
        data: updateData,
        include: {
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          manager: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      });

      res.json(plan);
    } catch (error) {
      console.error('Error updating development plan:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Delete development plan
  router.delete('/:id', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;

      const existingPlan = await prisma.developmentPlan.findUnique({
        where: { id }
      });

      if (!existingPlan) {
        return res.status(404).json({ error: 'Development plan not found' });
      }

      await prisma.developmentPlan.delete({
        where: { id }
      });

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting development plan:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
}
