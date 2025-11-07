import { jest } from '@jest/globals';

// Mock del middleware de autenticación para las pruebas
jest.mock('../src/middleware/auth.js', () => ({
  requireAuth: (req, res, next) => {
    req.userId = 'test-user-id';
    req.organizationId = 'test-org-id';
    next();
  }
}));

// Configuración global para las pruebas
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};