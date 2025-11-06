# Especificación de Seguridad - Competency Manager

## Resumen Ejecutivo
Sistema de seguridad multicapa con autenticación JWT, autorización basada en roles, cifrado de datos sensibles y cumplimiento normativo colombiano.

## 1. Autenticación

### 1.1 JWT (JSON Web Tokens)
**Implementación**: Tokens firmados con HS256
```javascript
// Estructura del Token
{
  "sub": "user-id",
  "org": "organization-id", 
  "roles": ["admin", "manager"],
  "iat": 1640995200,
  "exp": 1641081600
}
```

**Configuración**:
- **Algoritmo**: HS256
- **Expiración**: 24 horas
- **Secret**: Variable de entorno `JWT_SECRET`
- **Storage**: localStorage (frontend)

### 1.2 Flujo de Autenticación
```
1. Usuario → POST /api/auth/login → Backend
2. Backend → Valida credenciales → Database
3. Backend → Genera JWT → Usuario
4. Usuario → Incluye Bearer token → Requests
5. Backend → Valida token → Middleware
```

### 1.3 Middleware de Autenticación
```javascript
// backend/src/middleware/auth.js
export const requireAuth = async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const payload = jwt.verify(token, process.env.JWT_SECRET);
  req.user = payload;
  req.organizationId = payload.org;
}
```

## 2. Autorización (Roles y Permisos)

### 2.1 Sistema de Roles
```
┌─────────────────┐
│   SUPERADMIN    │ ← Acceso cross-organizacional
├─────────────────┤
│     ADMIN       │ ← Gestión completa de organización
├─────────────────┤
│    MANAGER      │ ← Gestión de equipo y evaluaciones
├─────────────────┤
│   EMPLOYEE      │ ← Acceso limitado a datos propios
└─────────────────┘
```

### 2.2 Matriz de Permisos

| Recurso | Superadmin | Admin | Manager | Employee |
|---------|------------|-------|---------|----------|
| Organizaciones | CRUD | R | R | R |
| Empleados | CRUD | CRUD | RU (equipo) | R (propio) |
| Competencias | CRUD | CRUD | R | R |
| Observaciones | CRUD | CRUD | CRUD (equipo) | R (propias) |
| Entrevistas | CRUD | CRUD | CRUD (equipo) | R (propias) |
| Nóminas | CRUD | CRUD | R (equipo) | R (propia) |
| Reportes | R | R | R (equipo) | R (propios) |

### 2.3 Middleware de Autorización
```javascript
// backend/src/middleware/permissions.js
export const requireRole = (roles) => {
  return (req, res, next) => {
    const hasRole = roles.some(role => req.user.roles.includes(role));
    if (!hasRole) {
      return res.status(403).json({ error: 'Permisos insuficientes' });
    }
    next();
  };
};
```

### 2.4 Multi-tenancy y Aislamiento
```javascript
// Filtrado automático por organización
const employees = await prisma.employee.findMany({
  where: {
    organizationId: req.organizationId // Aislamiento automático
  }
});
```

## 3. Cifrado de Datos Sensibles

### 3.1 Datos Sensibles Identificados
- **Información Personal**: Nombres, documentos, contactos
- **Datos Salariales**: Salarios, bonificaciones, deducciones
- **Información Médica**: Permisos médicos, incapacidades
- **Evaluaciones**: Observaciones, feedback, calificaciones
- **Documentos Legales**: Actas, sanciones, contratos

### 3.2 Cifrado en Tránsito
**HTTPS/TLS 1.3**:
- Certificados SSL/TLS en producción
- Redirección automática HTTP → HTTPS
- HSTS headers para seguridad adicional

```javascript
// Helmet configuration
app.use(helmet({
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

### 3.3 Cifrado en Reposo
**Base de Datos**:
- SQLite: Cifrado a nivel de archivo
- PostgreSQL: Cifrado de columnas sensibles
- Backups cifrados con AES-256

**Implementación**:
```javascript
// Cifrado de campos sensibles
const crypto = require('crypto');

const encryptSensitiveData = (data) => {
  const cipher = crypto.createCipher('aes-256-cbc', process.env.ENCRYPTION_KEY);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
};
```

### 3.4 Hashing de Contraseñas
```javascript
import bcrypt from 'bcrypt';

// Hash de contraseña
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 12);
};

// Verificación
const verifyPassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};
```

## 4. Protección de Datos Personales

### 4.1 Cumplimiento GDPR/LOPD
- **Consentimiento**: Registro explícito de consentimientos
- **Derecho al Olvido**: Funcionalidad de eliminación de datos
- **Portabilidad**: Exportación de datos en formato estándar
- **Minimización**: Solo datos necesarios para la función

### 4.2 Anonimización y Pseudonimización
```javascript
// Anonimización para reportes
const anonymizeEmployee = (employee) => ({
  id: hashId(employee.id),
  department: employee.department,
  position: employee.position,
  // Datos personales removidos
});
```

### 4.3 Retención de Datos
```javascript
// Políticas de retención
const DATA_RETENTION = {
  employees: '7 years', // Normativa laboral colombiana
  payroll: '5 years',   // Normativa fiscal
  evaluations: '3 years',
  audit_logs: '2 years'
};
```

## 5. Seguridad de Red y Aplicación

### 5.1 Rate Limiting
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requests por IP
  message: 'Demasiadas solicitudes desde esta IP'
});
```

### 5.2 Validación y Sanitización
```javascript
// Sanitización de entrada
const sanitizeInput = (req, res, next) => {
  for (let key in req.body) {
    if (typeof req.body[key] === 'string') {
      req.body[key] = req.body[key].replace(/[<>]/g, '');
    }
  }
  next();
};
```

### 5.3 Headers de Seguridad
```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  },
  crossOriginEmbedderPolicy: false
}));
```

## 6. Auditoría y Monitoreo

### 6.1 Audit Logs
```javascript
// Modelo de auditoría
model AuditLog {
  id             String   @id @default(uuid())
  organizationId String
  userId         String?
  action         String   // CREATE, UPDATE, DELETE, LOGIN
  entityType     String   // Employee, Observation, etc.
  entityId       String
  details        String?  // JSON con cambios
  timestamp      DateTime @default(now())
}
```

### 6.2 Logging de Seguridad
```javascript
// Winston logger configuration
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/security.log', level: 'warn' })
  ]
});
```

### 6.3 Monitoreo de Eventos Críticos
- **Intentos de login fallidos**
- **Accesos no autorizados**
- **Cambios en datos sensibles**
- **Exportación masiva de datos**
- **Cambios en permisos de usuario**

## 7. Cumplimiento Normativo Colombiano

### 7.1 Nómina Electrónica DIAN
**Seguridad Fiscal**:
- **Firma Digital**: Certificados digitales DIAN
- **CUNE**: Código único de nómina electrónica
- **Trazabilidad**: Registro completo de transmisiones
- **Integridad**: Hash SHA-256 de documentos

```javascript
// Generación de CUNE
const generateCUNE = (payrollData) => {
  const hash = crypto.createHash('sha256');
  hash.update(JSON.stringify(payrollData));
  return hash.digest('hex').substring(0, 16);
};
```

### 7.2 Protección de Datos Laborales
**Normativa Aplicable**:
- Ley 1581 de 2012 (Protección de Datos Personales)
- Decreto 1377 de 2013
- Código Sustantivo del Trabajo

**Implementación**:
- Consentimiento informado para tratamiento de datos
- Políticas de privacidad específicas
- Procedimientos de ejercicio de derechos ARCO

## 8. Configuración de Seguridad

### 8.1 Variables de Entorno Críticas
```bash
# Autenticación
JWT_SECRET="clave-ultra-secreta-256-bits"
ENCRYPTION_KEY="clave-cifrado-aes-256"

# Base de datos
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"

# DIAN
DIAN_CERTIFICATE_PATH="/path/to/cert.p12"
DIAN_CERTIFICATE_PASSWORD="cert-password"
```

### 8.2 Configuración de Producción
```javascript
// Configuración segura para producción
if (process.env.NODE_ENV === 'production') {
  app.use(helmet({
    contentSecurityPolicy: true,
    hsts: true,
    noSniff: true,
    frameguard: { action: 'deny' }
  }));
  
  // Disable server signature
  app.disable('x-powered-by');
}
```

## 9. Plan de Respuesta a Incidentes

### 9.1 Clasificación de Incidentes
- **Crítico**: Brecha de datos, acceso no autorizado
- **Alto**: Falla de autenticación, corrupción de datos
- **Medio**: Rate limiting activado, errores de validación
- **Bajo**: Intentos de login fallidos normales

### 9.2 Procedimientos de Respuesta
1. **Detección**: Monitoreo automático + alertas
2. **Contención**: Bloqueo automático de IPs sospechosas
3. **Investigación**: Análisis de logs de auditoría
4. **Recuperación**: Restauración desde backups cifrados
5. **Lecciones**: Actualización de medidas preventivas

## 10. Checklist de Seguridad

### 10.1 Desarrollo
- [ ] Validación de entrada en todos los endpoints
- [ ] Sanitización de datos de salida
- [ ] Manejo seguro de errores (sin exposición de stack traces)
- [ ] Logging de eventos de seguridad
- [ ] Tests de seguridad automatizados

### 10.2 Despliegue
- [ ] HTTPS configurado correctamente
- [ ] Variables de entorno seguras
- [ ] Base de datos con cifrado
- [ ] Backups cifrados y probados
- [ ] Monitoreo de seguridad activo

### 10.3 Operación
- [ ] Rotación regular de secrets
- [ ] Revisión de logs de auditoría
- [ ] Actualizaciones de seguridad aplicadas
- [ ] Pruebas de penetración periódicas
- [ ] Capacitación de usuarios en seguridad