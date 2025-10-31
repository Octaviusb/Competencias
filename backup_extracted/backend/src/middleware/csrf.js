import crypto from 'crypto';

const tokens = new Map();

export const generateCSRFToken = (req, res, next) => {
  const token = crypto.randomBytes(32).toString('hex');
  const userId = req.user?.sub || 'anonymous';
  
  tokens.set(userId, token);
  
  // Clean old tokens (simple cleanup)
  if (tokens.size > 1000) {
    const keys = Array.from(tokens.keys());
    keys.slice(0, 100).forEach(key => tokens.delete(key));
  }
  
  res.locals.csrfToken = token;
  next();
};

export const validateCSRFToken = (req, res, next) => {
  const token = req.headers['x-csrf-token'] || req.body._csrf;
  const userId = req.user?.sub || 'anonymous';
  
  if (!token || tokens.get(userId) !== token) {
    return res.status(403).json({ error: 'Token CSRF inválido' });
  }
  
  next();
};