import express from 'express';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

export default function attendanceRouter(prisma) {
  // Get attendance records
  router.get('/', requireAuth, async (req, res, next) => {
    try {
      const { organizationId } = req.user;
      const { employeeId, startDate, endDate } = req.query;
      
      const where = { organizationId };
      if (employeeId) where.employeeId = employeeId;
      if (startDate && endDate) {
        where.date = {
          gte: new Date(startDate),
          lte: new Date(endDate)
        };
      }

      const records = await prisma.attendanceRecord.findMany({
        where,
        include: {
          employee: { select: { firstName: true, lastName: true } }
        },
        orderBy: { date: 'desc' }
      });
      
      res.json(records);
    } catch (error) {
      next(error);
    }
  });

  // Clock in/out
  router.post('/clock', requireAuth, async (req, res, next) => {
    try {
      const { employeeId, type } = req.body; // type: 'in' | 'out' | 'break_start' | 'break_end'
      const { organizationId } = req.user;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let record = await prisma.attendanceRecord.findUnique({
        where: { employeeId_date: { employeeId, date: today } }
      });

      const now = new Date();
      const updateData = {};

      switch (type) {
        case 'in':
          updateData.checkIn = now;
          updateData.status = 'present';
          break;
        case 'out':
          updateData.checkOut = now;
          if (record?.checkIn) {
            const hours = (now - record.checkIn) / (1000 * 60 * 60);
            updateData.hoursWorked = Math.round(hours * 100) / 100;
          }
          break;
        case 'break_start':
          updateData.breakStart = now;
          break;
        case 'break_end':
          updateData.breakEnd = now;
          break;
      }

      if (record) {
        record = await prisma.attendanceRecord.update({
          where: { id: record.id },
          data: updateData,
          include: {
            employee: { select: { firstName: true, lastName: true } }
          }
        });
      } else {
        record = await prisma.attendanceRecord.create({
          data: {
            employeeId,
            date: today,
            organizationId,
            ...updateData
          },
          include: {
            employee: { select: { firstName: true, lastName: true } }
          }
        });
      }

      res.json(record);
    } catch (error) {
      next(error);
    }
  });

  // Manual attendance entry
  router.post('/', requireAuth, async (req, res, next) => {
    try {
      const { employeeId, date, checkIn, checkOut, status, notes } = req.body;
      const { organizationId } = req.user;

      let hoursWorked = 0;
      if (checkIn && checkOut) {
        const start = new Date(`${date}T${checkIn}`);
        const end = new Date(`${date}T${checkOut}`);
        hoursWorked = (end - start) / (1000 * 60 * 60);
      }

      const record = await prisma.attendanceRecord.upsert({
        where: { employeeId_date: { employeeId, date: new Date(date) } },
        update: {
          checkIn: checkIn ? new Date(`${date}T${checkIn}`) : null,
          checkOut: checkOut ? new Date(`${date}T${checkOut}`) : null,
          hoursWorked: Math.round(hoursWorked * 100) / 100,
          status,
          notes
        },
        create: {
          employeeId,
          date: new Date(date),
          checkIn: checkIn ? new Date(`${date}T${checkIn}`) : null,
          checkOut: checkOut ? new Date(`${date}T${checkOut}`) : null,
          hoursWorked: Math.round(hoursWorked * 100) / 100,
          status,
          notes,
          organizationId
        },
        include: {
          employee: { select: { firstName: true, lastName: true } }
        }
      });

      res.json(record);
    } catch (error) {
      next(error);
    }
  });

  // Get attendance summary
  router.get('/summary', requireAuth, async (req, res, next) => {
    try {
      const { organizationId } = req.user;
      const { employeeId, month, year } = req.query;
      
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);

      const records = await prisma.attendanceRecord.findMany({
        where: {
          organizationId,
          employeeId,
          date: { gte: startDate, lte: endDate }
        }
      });

      const summary = {
        totalDays: records.length,
        presentDays: records.filter(r => r.status === 'present').length,
        absentDays: records.filter(r => r.status === 'absent').length,
        lateDays: records.filter(r => r.status === 'late').length,
        totalHours: records.reduce((sum, r) => sum + (r.hoursWorked || 0), 0),
        overtimeHours: records.reduce((sum, r) => sum + (r.overtimeHours || 0), 0)
      };

      res.json(summary);
    } catch (error) {
      next(error);
    }
  });

  return router;
}
