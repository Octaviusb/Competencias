import { z } from 'zod';

export const validate = (schema) => {
  return (req, res, next) => {
    try {
      const result = schema.parse(req.body);
      req.body = result; // Use validated data
      next();
    } catch (error) {
      return res.status(400).json({ 
        error: 'Datos inválidos',
        details: error.errors?.map(e => ({
          field: e.path.join('.'),
          message: e.message
        })) || ['Formato de datos incorrecto']
      });
    }
  };
};

// Función mejorada de sanitización
const sanitizeHtml = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
};

// Middleware mejorado de sanitización
export const sanitizeInput = (req, res, next) => {
  const sanitize = (obj) => {
    if (typeof obj === 'string') {
      return sanitizeHtml(obj);
    }
    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }
    if (typeof obj === 'object' && obj !== null) {
      const sanitized = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          sanitized[key] = sanitize(obj[key]);
        }
      }
      return sanitized;
    }
    return obj;
  };

  if (req.body) req.body = sanitize(req.body);
  if (req.query) req.query = sanitize(req.query);
  if (req.params) req.params = sanitize(req.params);
  
  next();
};

// Middleware CSRF
export const csrfProtection = (req, res, next) => {
  // Skip CSRF for GET requests and public endpoints
  if (req.method === 'GET' || req.path.startsWith('/api/public') || req.path.startsWith('/api/auth/login')) {
    return next();
  }

  const token = req.headers['x-csrf-token'] || req.body._csrf;
  const sessionToken = req.session?.csrfToken;

  if (!token || !sessionToken || token !== sessionToken) {
    return res.status(403).json({ error: 'Token CSRF inválido' });
  }

  next();
};

// Middleware de validación de entrada mejorado
export const validateRequest = (req, res, next) => {
  // Validar Content-Type para requests con body
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.get('Content-Type');
    if (!contentType || !contentType.includes('application/json')) {
      return res.status(400).json({ error: 'Content-Type debe ser application/json' });
    }
  }

  // Validar tamaño del body
  const bodySize = JSON.stringify(req.body || {}).length;
  if (bodySize > 1024 * 1024) { // 1MB limit
    return res.status(413).json({ error: 'Request demasiado grande' });
  }

  // Validar caracteres peligrosos en URLs
  if (req.url.match(/[<>"']/)) {
    return res.status(400).json({ error: 'URL contiene caracteres no válidos' });
  }

  next();
};