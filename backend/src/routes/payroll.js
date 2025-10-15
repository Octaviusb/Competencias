import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import ElectronicPayrollService from '../services/electronicPayroll.js';

const router = express.Router();

export default function payrollRouter(prisma) {
  const electronicPayrollService = new ElectronicPayrollService(prisma);
  // Get payroll periods
  router.get('/periods', requireAuth, async (req, res, next) => {
    try {
      const { organizationId } = req.user;
      const periods = await prisma.payrollPeriod.findMany({
        where: { organizationId },
        include: { _count: { select: { payslips: true } } },
        orderBy: { startDate: 'desc' }
      });
      res.json(periods);
    } catch (error) {
      next(error);
    }
  });

  // Create payroll period
  router.post('/periods', requireAuth, async (req, res, next) => {
    try {
      const { organizationId } = req.user;
      const { name, startDate, endDate, payDate } = req.body;

      const period = await prisma.payrollPeriod.create({
        data: {
          name,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          payDate: new Date(payDate),
          organizationId
        }
      });

      res.status(201).json(period);
    } catch (error) {
      next(error);
    }
  });

  // Get payslips for period
  router.get('/periods/:periodId/payslips', requireAuth, async (req, res, next) => {
    try {
      const { periodId } = req.params;
      const payslips = await prisma.payslip.findMany({
        where: { periodId },
        include: {
          employee: { select: { firstName: true, lastName: true } },
          items: true
        }
      });
      res.json(payslips);
    } catch (error) {
      next(error);
    }
  });

  // Generate payslips for period
  router.post('/periods/:periodId/generate', requireAuth, async (req, res, next) => {
    try {
      const { periodId } = req.params;
      const { organizationId } = req.user;

      const period = await prisma.payrollPeriod.findUnique({
        where: { id: periodId }
      });

      if (!period) {
        return res.status(404).json({ error: 'Period not found' });
      }

      // Get all employees
      const employees = await prisma.employee.findMany({
        where: { organizationId, status: 'active' }
      });

      // Get attendance data for period
      const attendanceData = await prisma.attendanceRecord.findMany({
        where: {
          organizationId,
          date: { gte: period.startDate, lte: period.endDate }
        }
      });

      const payslips = [];
      
      for (const employee of employees) {
        const empAttendance = attendanceData.filter(a => a.employeeId === employee.id);
        const totalHours = empAttendance.reduce((sum, a) => sum + (a.hoursWorked || 0), 0);
        const overtimeHours = empAttendance.reduce((sum, a) => sum + (a.overtimeHours || 0), 0);

        // Basic salary calculation (simplified)
        const baseSalary = 50000; // Default base salary
        const hourlyRate = baseSalary / 160; // Assuming 160 hours per month
        const regularPay = Math.min(totalHours, 160) * hourlyRate;
        const overtimePay = overtimeHours * hourlyRate * 1.5;
        
        const grossPay = regularPay + overtimePay;
        const taxes = grossPay * 0.15; // 15% tax rate
        const netPay = grossPay - taxes;

        const payslip = await prisma.payslip.create({
          data: {
            employeeId: employee.id,
            periodId,
            baseSalary: regularPay,
            overtime: overtimePay,
            taxes,
            netPay,
            hoursWorked: totalHours,
            organizationId,
            items: {
              create: [
                { type: 'earning', description: 'Base Salary', amount: regularPay },
                { type: 'earning', description: 'Overtime', amount: overtimePay },
                { type: 'tax', description: 'Income Tax', amount: taxes }
              ]
            }
          },
          include: {
            employee: { select: { firstName: true, lastName: true } },
            items: true
          }
        });

        payslips.push(payslip);
      }

      await prisma.payrollPeriod.update({
        where: { id: periodId },
        data: { status: 'processing' }
      });

      res.json(payslips);
    } catch (error) {
      next(error);
    }
  });

  // Get employee payslips
  router.get('/employee/:employeeId', requireAuth, async (req, res, next) => {
    try {
      const { employeeId } = req.params;
      const payslips = await prisma.payslip.findMany({
        where: { employeeId },
        include: {
          period: { select: { name: true, payDate: true } },
          items: true
        },
        orderBy: { createdAt: 'desc' }
      });
      res.json(payslips);
    } catch (error) {
      next(error);
    }
  });

  // Generate electronic payroll document
  router.post('/electronic/:payslipId/generate', requireAuth, async (req, res, next) => {
    try {
      const { payslipId } = req.params;
      const { organizationId } = req.user;

      const document = await electronicPayrollService.generateElectronicDocument(payslipId, organizationId);
      res.status(201).json(document);
    } catch (error) {
      next(error);
    }
  });

  // Get electronic payroll documents
  router.get('/electronic', requireAuth, async (req, res, next) => {
    try {
      const { organizationId } = req.user;
      const documents = await prisma.electronicPayrollDocument.findMany({
        where: { organizationId },
        include: {
          payslip: {
            include: {
              employee: { select: { firstName: true, lastName: true } },
              period: { select: { name: true, payDate: true } }
            }
          }
        },
        orderBy: { generationDate: 'desc' }
      });
      res.json(documents);
    } catch (error) {
      next(error);
    }
  });

  // Sign electronic document
  router.post('/electronic/:documentId/sign', requireAuth, async (req, res, next) => {
    try {
      const { documentId } = req.params;
      const { privateKey } = req.body; // In production, this should be securely handled

      const signature = await electronicPayrollService.signDocument(documentId, privateKey);
      res.json({ signature });
    } catch (error) {
      next(error);
    }
  });

  // Transmit to DIAN
  router.post('/electronic/:documentId/transmit', requireAuth, async (req, res, next) => {
    try {
      const { documentId } = req.params;

      const result = await electronicPayrollService.transmitToDIAN(documentId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  // Check compliance calendar
  router.get('/compliance/check', requireAuth, async (req, res, next) => {
    try {
      const { organizationId } = req.user;

      const employeeCount = await prisma.employee.count({
        where: { organizationId, status: 'active' }
      });

      const isCompliant = electronicPayrollService.checkComplianceCalendar(employeeCount);
      res.json({
        employeeCount,
        isCompliant,
        message: isCompliant
          ? 'La organización está obligada a usar nómina electrónica'
          : 'La organización aún no está obligada a usar nómina electrónica'
      });
    } catch (error) {
      next(error);
    }
  });

  // Get transmission history
  router.get('/electronic/transmissions', requireAuth, async (req, res, next) => {
    try {
      const { organizationId } = req.user;
      const transmissions = await prisma.electronicPayrollTransmission.findMany({
        where: { organizationId },
        include: {
          document: {
            include: {
              payslip: {
                include: {
                  employee: { select: { firstName: true, lastName: true } }
                }
              }
            }
          }
        },
        orderBy: { transmissionDate: 'desc' }
      });
      res.json(transmissions);
    } catch (error) {
      next(error);
    }
  });

  return router;
}
