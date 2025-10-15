import request from 'supertest';
import express from 'express';
import { PrismaClient } from '@prisma/client';
import authRouter from '../src/routes/auth.js';

const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use('/auth', authRouter(prisma));

describe('Auth Routes', () => {
  beforeAll(async () => {
    // Setup test database
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /auth/login', () => {
    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'invalid@test.com',
          password: 'wrongpassword',
          organizationId: 'test-org'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should reject missing fields', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@test.com'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /auth/register', () => {
    it('should reject invalid email', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'invalid-email',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User',
          organizationId: 'test-org'
        });

      expect(response.status).toBe(400);
    });
  });
});