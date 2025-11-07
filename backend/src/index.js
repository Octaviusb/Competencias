import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import { PrismaClient } from '@prisma/client';
import winston from 'winston';
import { sanitizeInput, csrfProtection, validateRequest } from './middleware/validation.js';
dotenv.config();

// Configure Winston logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'competencias-backend' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

const app = express();
const prisma = new PrismaClient();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Demasiadas solicitudes desde esta IP',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://competencias-hk6sne7ts-octaviusbs-projects.vercel.app',
    /\.vercel\.app$/
  ],
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));
app.use(validateRequest);
app.use(sanitizeInput);
// app.use(csrfProtection); // Uncomment for CSRF protection

// Multi-tenant: extract organization from header
const TENANT_HEADER = process.env.TENANT_HEADER || 'X-Organization-Id';
app.use((req, res, next) => {
  req.tenantId = req.header(TENANT_HEADER) || null;
  next();
});

// Swagger setup
const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Competencias API',
      version: '0.1.0',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.js'],
});
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Favicon
app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Competency Manager API', status: 'running' });
});

// Admin endpoint to manage organizations
app.get('/api/admin/organizations', async (req, res) => {
  try {
    const orgs = await prisma.organization.findMany({
      include: { _count: { select: { users: true } } }
    });
    res.json(orgs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete specific organization
app.delete('/api/admin/organizations/:id', async (req, res) => {
  try {
    await prisma.organization.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Organization deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Clean database and create only demo company
app.post('/api/reset-demo', async (req, res) => {
  try {
    // Delete all organizations
    await prisma.organization.deleteMany({});
    
    // Create only demo organization
    const org = await prisma.organization.create({
      data: { name: 'Empresa Demo' }
    });
    
    // Create default roles
    await prisma.role.createMany({ 
      data: [
        { name: 'admin', organizationId: org.id },
        { name: 'manager', organizationId: org.id },
        { name: 'employee', organizationId: org.id },
      ]
    });
    
    res.json({ success: true, organizationId: org.id, name: org.name, message: 'Database reset with demo company only' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Routes
import authRouter from './routes/auth.js';
import orgRouter from './routes/organizations.js';
import protectedRouter from './routes/protected-example.js';
import departmentsRouter from './routes/departments.js';
import categoriesRouter from './routes/categories.js';
import competenciesRouter from './routes/competencies.js';
import employeesRouter from './routes/employees.js';
import seedRouter from './routes/seed.js';
import positionsRouter from './routes/positions.js';
import employeePositionsRouter from './routes/employee-positions.js';
import templatesRouter from './routes/templates.js';
import indicatorsRouter from './routes/indicators.js';
import observationsRouter from './routes/observations.js';
import interviewsRouter from './routes/interviews.js';
import jobAnalysesRouter from './routes/job-analyses.js';
import developmentPlansRouter from './routes/development-plans.js';
import auditLogsRouter from './routes/audit-logs.js';
import interviewTemplatesRouter from './routes/interview-templates.js';
import documentsRouter from './routes/documents.js';
import leaveRequestsRouter from './routes/leave-requests.js';
import attendanceRouter from './routes/attendance.js';
import payrollRouter from './routes/payroll.js';
import recruitmentRouter from './routes/recruitment.js';
import trainingRouter from './routes/training.js';
import searchRouter from './routes/search.js';
import publicRouter from './routes/public.js';
import { auditMiddleware } from './services/audit.js';
// import cache from './services/cache.js'; // Optional - requires Redis

// Apply audit logging to all routes
// app.use('/api/', auditMiddleware('api_access')); // Optional - enable when needed

// Public routes (no authentication required)
app.use('/api/public', publicRouter(prisma));

app.use('/api/auth', authRouter(prisma));
app.use('/api/organizations', orgRouter(prisma));
app.use('/api', protectedRouter(prisma));
app.use('/api/departments', departmentsRouter(prisma));
app.use('/api/categories', categoriesRouter(prisma));
app.use('/api/competencies', competenciesRouter(prisma));
app.use('/api/employees', employeesRouter(prisma));
app.use('/api/seed', seedRouter(prisma));
app.use('/api/positions', positionsRouter(prisma));
app.use('/api/employee-positions', employeePositionsRouter(prisma));
app.use('/api/templates', templatesRouter(prisma));
app.use('/api/indicators', indicatorsRouter(prisma));
app.use('/api/observations', observationsRouter(prisma));
app.use('/api/interviews', interviewsRouter(prisma));
app.use('/api/job-analyses', jobAnalysesRouter(prisma));
app.use('/api/development-plans', developmentPlansRouter(prisma));
app.use('/api/audit-logs', auditLogsRouter(prisma));
app.use('/api/interview-templates', interviewTemplatesRouter(prisma));
app.use('/api/documents', documentsRouter(prisma));
app.use('/api/leave-requests', leaveRequestsRouter(prisma));
app.use('/api/attendance', attendanceRouter(prisma));
app.use('/api/payroll', payrollRouter(prisma));
app.use('/api/recruitment', recruitmentRouter(prisma));
app.use('/api/training', trainingRouter(prisma));
app.use('/api/search', searchRouter(prisma));

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Error handler
app.use((err, req, res, next) => {
  const sanitizedUrl = req.url?.replace(/[\r\n]/g, '') || '';
  const sanitizedMethod = req.method?.replace(/[\r\n]/g, '') || '';
  logger.error('Unhandled error', { error: err.message, stack: err.stack, url: sanitizedUrl, method: sanitizedMethod });
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  const sanitizedPort = String(PORT).replace(/[\r\n]/g, '');
  logger.info(`Backend running on http://localhost:${sanitizedPort}`);
  logger.info(`Swagger docs at http://localhost:${sanitizedPort}/api/docs`);
});
