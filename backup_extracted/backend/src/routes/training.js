import express from 'express';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

export default function trainingRouter(prisma) {
  // Get training courses
  router.get('/courses', requireAuth, async (req, res, next) => {
    try {
      const { organizationId } = req.user;
      const courses = await prisma.trainingCourse.findMany({
        where: { organizationId },
        include: {
          _count: { select: { enrollments: true } }
        },
        orderBy: { createdAt: 'desc' }
      });
      res.json(courses);
    } catch (error) {
      next(error);
    }
  });

  // Create training course
  router.post('/courses', requireAuth, async (req, res, next) => {
    try {
      const { organizationId } = req.user;
      const course = await prisma.trainingCourse.create({
        data: { ...req.body, organizationId }
      });
      res.status(201).json(course);
    } catch (error) {
      next(error);
    }
  });

  // Update training course
  router.put('/courses/:id', requireAuth, async (req, res, next) => {
    try {
      const { id } = req.params;
      const course = await prisma.trainingCourse.update({
        where: { id },
        data: req.body
      });
      res.json(course);
    } catch (error) {
      next(error);
    }
  });

  // Get enrollments
  router.get('/enrollments', requireAuth, async (req, res, next) => {
    try {
      const { organizationId } = req.user;
      const { courseId, employeeId, status } = req.query;
      
      const where = { organizationId };
      if (courseId) where.courseId = courseId;
      if (employeeId) where.employeeId = employeeId;
      if (status) where.status = status;

      const enrollments = await prisma.trainingEnrollment.findMany({
        where,
        include: {
          employee: { select: { firstName: true, lastName: true } },
          course: { select: { title: true, duration: true } }
        },
        orderBy: { enrolledDate: 'desc' }
      });
      res.json(enrollments);
    } catch (error) {
      next(error);
    }
  });

  // Enroll employee in course
  router.post('/enrollments', requireAuth, async (req, res, next) => {
    try {
      const { organizationId } = req.user;
      const { employeeId, courseId, startDate } = req.body;

      const enrollment = await prisma.trainingEnrollment.create({
        data: {
          employeeId,
          courseId,
          startDate: startDate ? new Date(startDate) : null,
          organizationId
        },
        include: {
          employee: { select: { firstName: true, lastName: true } },
          course: { select: { title: true, duration: true } }
        }
      });

      res.status(201).json(enrollment);
    } catch (error) {
      next(error);
    }
  });

  // Update enrollment status
  router.patch('/enrollments/:id', requireAuth, async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status, completedDate, score, feedback } = req.body;

      const updateData = { status };
      if (completedDate) updateData.completedDate = new Date(completedDate);
      if (score !== undefined) updateData.score = score;
      if (feedback) updateData.feedback = feedback;

      const enrollment = await prisma.trainingEnrollment.update({
        where: { id },
        data: updateData,
        include: {
          employee: { select: { firstName: true, lastName: true } },
          course: { select: { title: true, duration: true } }
        }
      });

      res.json(enrollment);
    } catch (error) {
      next(error);
    }
  });

  // Get training statistics
  router.get('/stats', requireAuth, async (req, res, next) => {
    try {
      const { organizationId } = req.user;
      
      const totalCourses = await prisma.trainingCourse.count({
        where: { organizationId, status: 'active' }
      });

      const totalEnrollments = await prisma.trainingEnrollment.count({
        where: { organizationId }
      });

      const completedEnrollments = await prisma.trainingEnrollment.count({
        where: { organizationId, status: 'completed' }
      });

      const inProgressEnrollments = await prisma.trainingEnrollment.count({
        where: { organizationId, status: 'in_progress' }
      });

      const stats = {
        totalCourses,
        totalEnrollments,
        completedEnrollments,
        inProgressEnrollments,
        completionRate: totalEnrollments > 0 ? (completedEnrollments / totalEnrollments * 100).toFixed(1) : 0
      };

      res.json(stats);
    } catch (error) {
      next(error);
    }
  });

  return router;
}
