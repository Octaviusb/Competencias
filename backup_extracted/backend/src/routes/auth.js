import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiting for login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many login attempts from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware to check superadmin access
const requireSuperadmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Token required' });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const SUPERADMIN_EMAILS = ['developer@competencias.com'];
    
    if (!SUPERADMIN_EMAILS.includes(payload.email?.toLowerCase())) {
      return res.status(403).json({ error: 'Superadmin access required' });
    }
    
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export default function authRouter(prisma) {
  // Register (initial simple version). Attaches to an organizationId.
  router.post('/register', async (req, res, next) => {
    try {
      const { email, password, firstName, lastName, organizationId } = req.body;
      if (!email || !password || !organizationId) {
        return res.status(400).json({ error: 'email, password, organizationId required' });
      }
      const org = await prisma.organization.findUnique({ where: { id: organizationId } });
      if (!org) return res.status(400).json({ error: 'Invalid organizationId' });

      const existing = await prisma.user.findFirst({ where: { email, organizationId } });
      if (existing) return res.status(409).json({ error: 'User already exists' });

      const passwordHash = await bcrypt.hash(password, 12);
      // If this is the first user in the organization, assign admin role; otherwise employee
      const userCount = await prisma.user.count({ where: { organizationId } });
      const roleName = userCount === 0 ? 'admin' : 'employee';
      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          isActive: true,
          organizationId,
          employee: {
            create: { firstName: firstName || '', lastName: lastName || '', organizationId },
          },
          roles: {
            create: [{ role: { connect: { name_organizationId: { name: roleName, organizationId } } } }],
          },
        },
        include: { employee: true, roles: { include: { role: true } } },
      });

      return res.status(201).json({ id: user.id, email: user.email });
    } catch (err) { next(err); }
  });

  // Login
  router.post('/login', loginLimiter, async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const organizationId = req.tenantId || req.body.organizationId;
      if (!email || !password || !organizationId) return res.status(400).json({ error: 'email, password, organizationId required' });

      const user = await prisma.user.findFirst({ where: { email, organizationId }, include: { roles: { include: { role: true } }, employee: true } });
      if (!user) return res.status(401).json({ error: 'Invalid credentials' });

      const ok = await bcrypt.compare(password, user.passwordHash || '');
      if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

      // Define restricted superadmin emails
      const SUPERADMIN_EMAILS = [
        'developer@competencias.com', // Tu email como desarrollador
      ];

      const userRoles = user.roles.map(r => r.role.name);
      let effectiveRole = 'usuario'; // Default role
      
      // Check organization roles first
      if (userRoles.includes('admin')) effectiveRole = 'admin';
      else if (userRoles.includes('director')) effectiveRole = 'director';
      else if (userRoles.includes('auditor')) effectiveRole = 'auditor';
      else if (userRoles.includes('usuario')) effectiveRole = 'usuario';
      else if (userRoles.includes('employee')) effectiveRole = 'usuario'; // Legacy
      
      // Superadmin overrides everything
      if (SUPERADMIN_EMAILS.includes(user.email.toLowerCase())) {
        effectiveRole = 'superadmin';
      }

      const accessToken = jwt.sign({ 
        sub: user.id, 
        org: user.organizationId, 
        roles: [effectiveRole],
        email: user.email 
      }, process.env.JWT_SECRET, { expiresIn: '15m' });
      
      const refreshToken = jwt.sign({ sub: user.id, org: user.organizationId }, process.env.JWT_SECRET, { expiresIn: '7d' });

      return res.json({
        token: accessToken, // Mantener compatibilidad
        accessToken,
        refreshToken,
        user: { id: user.id, email: user.email, role: effectiveRole }
      });
    } catch (err) { next(err); }
  });

  // Refresh token
  router.post('/refresh', async (req, res, next) => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) return res.status(400).json({ error: 'Refresh token required' });

      const payload = jwt.verify(refreshToken, process.env.JWT_SECRET);
      const user = await prisma.user.findUnique({ where: { id: payload.sub }, include: { roles: { include: { role: true } } } });
      if (!user) return res.status(401).json({ error: 'Invalid refresh token' });

      const newAccessToken = jwt.sign({ sub: user.id, org: user.organizationId, roles: user.roles.map(r => r.role.name) }, process.env.JWT_SECRET, { expiresIn: '15m' });
      return res.json({ accessToken: newAccessToken });
    } catch (err) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }
  });

  // Get user profile with role validation
  router.get('/profile', async (req, res, next) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) return res.status(401).json({ error: 'Token required' });

      const payload = jwt.verify(token, process.env.JWT_SECRET);
      const user = await prisma.user.findUnique({ 
        where: { id: payload.sub }, 
        include: { 
          roles: { include: { role: true } },
          employee: true 
        } 
      });
      
      if (!user) return res.status(401).json({ error: 'Invalid token' });

      // Define restricted superadmin emails (only developer and delegates)
      const SUPERADMIN_EMAILS = [
        'developer@competencias.com', // Tu email como desarrollador
        // Agrega aquí emails de personas a quienes delegues acceso
      ];

      // Determine effective role
      const userRoles = user.roles.map(r => r.role.name);
      let effectiveRole = 'usuario'; // Default role
      
      // Check organization roles first
      if (userRoles.includes('admin')) effectiveRole = 'admin';
      else if (userRoles.includes('director')) effectiveRole = 'director';
      else if (userRoles.includes('auditor')) effectiveRole = 'auditor';
      else if (userRoles.includes('usuario')) effectiveRole = 'usuario';
      else if (userRoles.includes('employee')) effectiveRole = 'usuario'; // Legacy
      
      // Superadmin overrides everything
      if (SUPERADMIN_EMAILS.includes(user.email.toLowerCase())) {
        effectiveRole = 'superadmin';
      }

      return res.json({
        id: user.id,
        email: user.email,
        role: effectiveRole,
        organizationId: user.organizationId,
        employee: user.employee
      });
    } catch (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  });

  // Protected route: Get all organizations (superadmin only)
  router.get('/organizations', requireSuperadmin, async (req, res, next) => {
    try {
      const organizations = await prisma.organization.findMany({
        select: { id: true, name: true, createdAt: true }
      });
      return res.json(organizations);
    } catch (err) {
      next(err);
    }
  });

  return router;
}
