import express from 'express';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

export default function leaveRequestsRouter(prisma) {
  // Get all leave requests
  router.get('/', requireAuth, async (req, res, next) => {
    try {
      const organizationId = req.organizationId;
      const requests = await prisma.leaveRequest.findMany({
        where: { organizationId },
        include: {
          employee: { select: { firstName: true, lastName: true } },
          approvedBy: { select: { firstName: true, lastName: true } }
        },
        orderBy: { createdAt: 'desc' }
      });
      res.json(requests);
    } catch (error) {
      next(error);
    }
  });

  // Create leave request
  router.post('/', requireAuth, async (req, res, next) => {
    try {
      const organizationId = req.organizationId;
      const { employeeId, type, startDate, endDate, reason } = req.body;
      
      const start = new Date(startDate);
      const end = new Date(endDate);
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

      const request = await prisma.leaveRequest.create({
        data: {
          employeeId,
          type,
          startDate: start,
          endDate: end,
          days,
          reason,
          organizationId
        },
        include: {
          employee: { select: { firstName: true, lastName: true } }
        }
      });
      
      res.status(201).json(request);
    } catch (error) {
      next(error);
    }
  });

  // Approve/reject leave request
  router.patch('/:id/status', requireAuth, async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status, rejectionReason } = req.body;
      const { employee } = req.user;

      const updateData = {
        status,
        approvedById: employee?.id,
        approvedAt: new Date()
      };

      if (status === 'rejected' && rejectionReason) {
        updateData.rejectionReason = rejectionReason;
      }

      const request = await prisma.leaveRequest.update({
        where: { id },
        data: updateData,
        include: {
          employee: { select: { firstName: true, lastName: true } },
          approvedBy: { select: { firstName: true, lastName: true } }
        }
      });

      res.json(request);
    } catch (error) {
      next(error);
    }
  });

  // Get leave balances
  router.get('/balances', requireAuth, async (req, res, next) => {
    try {
      const organizationId = req.organizationId;
      const year = parseInt(req.query.year) || new Date().getFullYear();
      
      const balances = await prisma.leaveBalance.findMany({
        where: { organizationId, year },
        include: {
          employee: { select: { firstName: true, lastName: true } }
        }
      });
      
      res.json(balances);
    } catch (error) {
      next(error);
    }
  });

  // Update leave balance
  router.put('/balances/:employeeId', requireAuth, async (req, res, next) => {
    try {
      const { employeeId } = req.params;
      const organizationId = req.organizationId;
      const { year, vacationDays, sickDays, personalDays } = req.body;

      const balance = await prisma.leaveBalance.upsert({
        where: { employeeId_year: { employeeId, year } },
        update: { vacationDays, sickDays, personalDays },
        create: {
          employeeId,
          year,
          vacationDays,
          sickDays,
          personalDays,
          organizationId
        },
        include: {
          employee: { select: { firstName: true, lastName: true } }
        }
      });

      res.json(balance);
    } catch (error) {
      next(error);
    }
  });

  return router;
}
