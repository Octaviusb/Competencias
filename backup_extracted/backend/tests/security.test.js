import request from 'supertest';
import express from 'express';
import { PrismaClient } from '@prisma/client';
import authRouter from '../src/routes/auth.js';
import employeesRouter from '../src/routes/employees.js';

const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use('/auth', authRouter(prisma));
app.use('/employees', employeesRouter(prisma));

describe('Security Tests', () => {
  describe('XSS Protection', () => {
    it('should sanitize malicious input', async () => {
      const maliciousInput = '<script>alert("xss")</script>';
      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'test@test.com',
          password: 'password123',
          firstName: maliciousInput,
          lastName: 'User',
          organizationId: 'test-org'
        });
      
      expect(response.status).toBe(400);
    });
  });

  describe('Rate Limiting', () => {
    it('should block excessive requests', async () => {
      const requests = Array(10).fill().map(() => 
        request(app).post('/auth/login').send({
          email: 'test@test.com',
          password: 'wrong',
          organizationId: 'test-org'
        })
      );
      
      const responses = await Promise.all(requests);
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).toBe(true);
    });
  });

  describe('Authentication', () => {
    it('should reject requests without token', async () => {
      const response = await request(app).get('/employees');
      expect(response.status).toBe(401);
    });
  });
});