import jwt from 'jsonwebtoken';

export const requireAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Token requerido' });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    req.userId = payload.sub;

    // Check if user is superadmin (has superadmin role)
    if (payload.roles && payload.roles.includes('superadmin')) {
      // Superadmin can access any organization
      req.organizationId = req.headers['x-organization-id'] || payload.org;
      req.isSuperAdmin = true;
    } else {
      // Regular users are restricted to their organization
      req.organizationId = payload.org;
      req.isSuperAdmin = false;
    }

    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user?.roles) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const hasRole = roles.some(role => req.user.roles.includes(role));
    if (!hasRole) {
      return res.status(403).json({ error: 'Permisos insuficientes' });
    }

    next();
  };
};