const request = require('supertest');
const app = require('../src/index');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

describe('Psychometric Tests', () => {
  let authToken;
  let organizationId;
  let jobAnalysisId;
  let profileId;
  let candidateId;

  beforeAll(async () => {
    // Crear organización de prueba
    const org = await prisma.organization.create({
      data: { name: 'Test Org Psychometric' }
    });
    organizationId = org.id;

    // Crear usuario de prueba
    const user = await prisma.user.create({
      data: {
        email: 'test@psychometric.com',
        passwordHash: '$2b$10$test',
        organizationId
      }
    });

    // Crear departamento
    const department = await prisma.department.create({
      data: {
        name: 'Test Department',
        organizationId
      }
    });

    // Crear posición
    const position = await prisma.position.create({
      data: {
        name: 'Test Position',
        organizationId,
        departmentId: department.id
      }
    });

    // Crear análisis de puesto
    const jobAnalysis = await prisma.jobAnalysis.create({
      data: {
        positionId: position.id,
        organizationId,
        purpose: 'Test purpose'
      }
    });
    jobAnalysisId = jobAnalysis.id;

    // Crear candidato
    const candidate = await prisma.candidate.create({
      data: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@test.com',
        organizationId
      }
    });
    candidateId = candidate.id;

    authToken = 'Bearer test-token';
  });

  afterAll(async () => {
    await prisma.psychometricResult.deleteMany({ where: { organizationId } });
    await prisma.psychometricProfile.deleteMany({ where: { organizationId } });
    await prisma.jobAnalysis.deleteMany({ where: { organizationId } });
    await prisma.position.deleteMany({ where: { organizationId } });
    await prisma.department.deleteMany({ where: { organizationId } });
    await prisma.candidate.deleteMany({ where: { organizationId } });
    await prisma.user.deleteMany({ where: { organizationId } });
    await prisma.organization.delete({ where: { id: organizationId } });
    await prisma.$disconnect();
  });

  describe('POST /api/psychometric/profiles', () => {
    it('should create a psychometric profile with valid weights', async () => {
      const profileData = {
        jobAnalysisId,
        opennessWeight: 20,
        conscientiousnessWeight: 25,
        extraversionWeight: 20,
        agreeablenessWeight: 15,
        neuroticismWeight: 20
      };

      const response = await request(app)
        .post('/api/psychometric/profiles')
        .set('Authorization', authToken)
        .send(profileData)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body.opennessWeight).toBe(20);
      profileId = response.body.id;
    });

    it('should reject profile with weights not summing to 100%', async () => {
      const profileData = {
        jobAnalysisId,
        opennessWeight: 20,
        conscientiousnessWeight: 20,
        extraversionWeight: 20,
        agreeablenessWeight: 20,
        neuroticismWeight: 15
      };

      await request(app)
        .post('/api/psychometric/profiles')
        .set('Authorization', authToken)
        .send(profileData)
        .expect(400);
    });
  });

  describe('POST /api/psychometric/results/import', () => {
    it('should import psychometric test results', async () => {
      const resultData = {
        profileId,
        candidateId,
        openness: 75,
        conscientiousness: 85,
        extraversion: 60,
        agreeableness: 70,
        neuroticism: 40
      };

      const response = await request(app)
        .post('/api/psychometric/results/import')
        .set('Authorization', authToken)
        .send(resultData)
        .expect(200);

      expect(response.body).toHaveProperty('fitScore');
      expect(response.body.openness).toBe(75);
    });
  });
});