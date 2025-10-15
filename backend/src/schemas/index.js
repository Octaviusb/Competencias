import { z } from 'zod';

// Auth schemas
export const LoginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Contraseña mínimo 6 caracteres'),
  organizationId: z.string().uuid('ID de organización inválido')
});

export const RegisterSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Contraseña mínimo 8 caracteres'),
  firstName: z.string().min(2, 'Nombre mínimo 2 caracteres'),
  lastName: z.string().min(2, 'Apellido mínimo 2 caracteres'),
  organizationId: z.string().uuid('ID de organización inválido')
});

// Employee schemas
export const CreateEmployeeSchema = z.object({
  firstName: z.string().min(2, 'Nombre mínimo 2 caracteres'),
  lastName: z.string().min(2, 'Apellido mínimo 2 caracteres'),
  title: z.string().optional(),
  departmentId: z.string().uuid().optional(),
  status: z.enum(['active', 'inactive']).default('active')
});

// Organization schemas
export const CreateOrganizationSchema = z.object({
  name: z.string().min(2, 'Nombre mínimo 2 caracteres')
});

// Observation schemas
export const CreateObservationSchema = z.object({
  employeeId: z.string().uuid('ID de empleado inválido'),
  observerId: z.string().uuid('ID de observador inválido'),
  type: z.enum(['formal', 'informal', '360_feedback']),
  date: z.string().datetime('Fecha inválida'),
  duration: z.number().positive().optional(),
  context: z.string().optional(),
  overallRating: z.number().min(1).max(5).optional()
});