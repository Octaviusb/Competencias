import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Función para sanitizar HTML y prevenir XSS
export function sanitizeHtml(input) {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// Función para validar entrada
export function validateInput(input, type = 'string', maxLength = 255) {
  if (!input) return null;
  
  switch (type) {
    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(input) ? input.toLowerCase().trim() : null;
    
    case 'phone':
      const phoneRegex = /^[\+]?[0-9\s\-\(\)]{7,15}$/;
      return phoneRegex.test(input) ? input.trim() : null;
    
    case 'number':
      const num = parseFloat(input);
      return !isNaN(num) && isFinite(num) ? num : null;
    
    case 'string':
    default:
      const sanitized = sanitizeHtml(input.toString().trim());
      return sanitized.length <= maxLength ? sanitized : sanitized.substring(0, maxLength);
  }
}

// Función para generar token CSRF
export function generateCSRFToken() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

// Middleware de validación mejorado
export function createValidationMiddleware() {
  return (req, res, next) => {
    // Sanitizar body
    if (req.body && typeof req.body === 'object') {
      for (const key in req.body) {
        if (typeof req.body[key] === 'string') {
          req.body[key] = sanitizeHtml(req.body[key]);
        }
      }
    }

    // Sanitizar query params
    if (req.query && typeof req.query === 'object') {
      for (const key in req.query) {
        if (typeof req.query[key] === 'string') {
          req.query[key] = sanitizeHtml(req.query[key]);
        }
      }
    }

    // Validar Content-Type para POST/PUT
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      const contentType = req.get('Content-Type');
      if (!contentType || !contentType.includes('application/json')) {
        return res.status(400).json({ error: 'Content-Type debe ser application/json' });
      }
    }

    next();
  };
}

// Función para crear configuración de seguridad mejorada
export function createSecurityConfig() {
  return {
    // Headers de seguridad
    helmet: {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
      crossOriginEmbedderPolicy: false,
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      }
    },

    // Rate limiting mejorado
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutos
      max: 100, // máximo 100 requests por ventana
      message: {
        error: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde'
      },
      standardHeaders: true,
      legacyHeaders: false,
      skip: (req) => {
        // Permitir más requests para endpoints de salud
        return req.path === '/api/health';
      }
    },

    // CORS mejorado
    cors: {
      origin: function (origin, callback) {
        const allowedOrigins = [
          'http://localhost:5173',
          'http://localhost:3000',
          process.env.FRONTEND_URL
        ].filter(Boolean);

        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('No permitido por CORS'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Organization-Id']
    }
  };
}

// Función para validar archivos subidos
export function validateFileUpload(file, allowedTypes = [], maxSize = 5 * 1024 * 1024) {
  if (!file) return { valid: false, error: 'No se proporcionó archivo' };

  // Validar tipo
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.mimetype)) {
    return { valid: false, error: 'Tipo de archivo no permitido' };
  }

  // Validar tamaño
  if (file.size > maxSize) {
    return { valid: false, error: 'Archivo demasiado grande' };
  }

  // Validar nombre
  const filename = sanitizeHtml(file.originalname);
  if (filename.length > 255) {
    return { valid: false, error: 'Nombre de archivo demasiado largo' };
  }

  return { valid: true, filename };
}

// Función para logging seguro
export function createSecureLogger() {
  return {
    info: (message, meta = {}) => {
      const sanitizedMessage = sanitizeHtml(message.toString());
      const sanitizedMeta = {};
      
      for (const key in meta) {
        if (typeof meta[key] === 'string') {
          sanitizedMeta[key] = sanitizeHtml(meta[key]);
        } else {
          sanitizedMeta[key] = meta[key];
        }
      }
      
      console.log(`[INFO] ${sanitizedMessage}`, sanitizedMeta);
    },
    
    error: (message, error = {}) => {
      const sanitizedMessage = sanitizeHtml(message.toString());
      console.error(`[ERROR] ${sanitizedMessage}`, {
        message: error.message,
        stack: error.stack
      });
    }
  };
}

console.log('✅ Funciones de seguridad creadas');
console.log('📋 Para usar estas funciones:');
console.log('1. Importar en tus rutas: import { sanitizeHtml, validateInput } from "./fix-security-issues.js"');
console.log('2. Usar sanitizeHtml() antes de guardar datos');
console.log('3. Usar validateInput() para validar entradas');
console.log('4. Aplicar createValidationMiddleware() en rutas');

export default {
  sanitizeHtml,
  validateInput,
  generateCSRFToken,
  createValidationMiddleware,
  createSecurityConfig,
  validateFileUpload,
  createSecureLogger
};