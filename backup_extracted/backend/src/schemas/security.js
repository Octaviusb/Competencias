import { z } from 'zod';

// Esquemas de validación para endpoints críticos

export const employeeSchema = z.object({
  firstName: z.string().min(1).max(50).regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/),
  lastName: z.string().min(1).max(50).regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/),
  email: z.string().email().max(100),
  phone: z.string().regex(/^[\+]?[0-9\s\-\(\)]{7,15}$/).optional(),
  departmentId: z.string().uuid().optional(),
  positionId: z.string().uuid().optional(),
  status: z.enum(['active', 'inactive']).default('active')
});

export const departmentSchema = z.object({
  name: z.string().min(1).max(100).regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-\.]+$/),
  description: z.string().max(500).optional()
});

export const observationSchema = z.object({
  employeeId: z.string().uuid(),
  competencyId: z.string().uuid(),
  score: z.number().min(1).max(5),
  comments: z.string().max(1000).optional(),
  type: z.enum(['formal', 'informal']).default('informal')
});

export const loginSchema = z.object({
  email: z.string().email().max(100),
  password: z.string().min(6).max(100)
});

export const registerSchema = z.object({
  email: z.string().email().max(100),
  password: z.string().min(8).max(100).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  organizationId: z.string().uuid()
});

export const leaveRequestSchema = z.object({
  employeeId: z.string().uuid(),
  type: z.enum(['vacation', 'sick', 'personal', 'maternity', 'paternity']),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reason: z.string().max(500).optional()
});

export const payrollPeriodSchema = z.object({
  name: z.string().min(1).max(100),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  payDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
});

// Validación de IDs UUID
export const uuidSchema = z.string().uuid();

// Validación de paginación
export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10)
});

// Validación de búsqueda
export const searchSchema = z.object({
  q: z.string().min(1).max(100).regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-\.0-9]+$/),
  type: z.enum(['employees', 'departments', 'positions', 'all']).default('all')
});

export default {
  employeeSchema,
  departmentSchema,
  observationSchema,
  loginSchema,
  registerSchema,
  leaveRequestSchema,
  payrollPeriodSchema,
  uuidSchema,
  paginationSchema,
  searchSchema
};