# Guía de Despliegue - Sistema de Gestión de Competencias

## Requisitos Previos

- Docker y Docker Compose
- Node.js 18+ (para desarrollo local)
- PostgreSQL (para producción)
- Cuenta en Docker Hub (opcional, para CI/CD)

## Variables de Entorno

Crear archivo `.env` en la carpeta `backend/`:

```env
# Base de datos
DATABASE_URL="postgresql://user:password@host:5432/dbname?schema=public"

# Autenticación
JWT_SECRET="tu_clave_jwt_muy_segura_aqui"
TENANT_HEADER="X-Organization-Id"

# Servidor
PORT=4000
NODE_ENV=production
```

## Despliegue Local con Docker Compose

1. **Clonar el repositorio:**
   ```bash
   git clone <repository-url>
   cd competencias
   ```

2. **Configurar variables de entorno:**
   ```bash
   cp backend/.env.example backend/.env
   # Editar backend/.env con valores reales
   ```

3. **Levantar servicios:**
   ```bash
   docker-compose up -d
   ```

4. **Verificar servicios:**
   - Backend: http://localhost:4000
   - Frontend: http://localhost:80
   - Base de datos: localhost:5432

5. **Ejecutar migraciones:**
   ```bash
   docker-compose exec backend npx prisma migrate deploy
   ```

6. **Crear organización inicial:**
   ```bash
   # Usar la API o el script de seed
   docker-compose exec backend npm run seed
   ```

## Despliegue en Producción

### Opción 1: Docker Compose en VPS

1. **Configurar servidor:**
   - Instalar Docker y Docker Compose
   - Configurar firewall (puertos 80, 443, 5432 si expuesto)
   - Configurar SSL con Let's Encrypt

2. **Configurar TLS/SSL:**
   - Instalar Certbot: `sudo apt install certbot python3-certbot-nginx`
   - Obtener certificado: `sudo certbot --nginx -d your-domain.com`
   - Configurar renovación automática: `sudo crontab -e` y agregar `0 12 * * * /usr/bin/certbot renew --quiet`
   - Actualizar nginx config para HTTPS:
     ```nginx
     server {
         listen 443 ssl http2;
         server_name your-domain.com;

         ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
         ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

         location / {
             proxy_pass http://localhost:80;
             proxy_set_header Host $host;
             proxy_set_header X-Real-IP $remote_addr;
             proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
             proxy_set_header X-Forwarded-Proto $scheme;
         }

         location /api {
             proxy_pass http://localhost:4000;
             proxy_set_header Host $host;
             proxy_set_header X-Real-IP $remote_addr;
             proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
             proxy_set_header X-Forwarded-Proto $scheme;
         }
     }

     server {
         listen 80;
         server_name your-domain.com;
         return 301 https://$server_name$request_uri;
     }
     ```

2. **Desplegar:**
   ```bash
   # En el servidor
   git clone <repository-url>
   cd competencias
   cp backend/.env.example backend/.env
   # Configurar .env con valores de producción
   docker-compose -f docker-compose.yml up -d
   ```

3. **Configurar reverse proxy (nginx):**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:80;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }

       location /api {
           proxy_pass http://localhost:4000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

### Opción 2: Servicios en la Nube

- **Backend:** Railway, Render, Heroku
- **Frontend:** Vercel, Netlify
- **Base de datos:** PostgreSQL en Railway, Supabase, PlanetScale

## Migraciones de Base de Datos

### Desarrollo:
```bash
cd backend
npx prisma migrate dev --name nombre_migracion
```

### Producción:
```bash
npx prisma migrate deploy
```

## Backups

### Automatizar backups de PostgreSQL:
```bash
# Script de backup
#!/bin/bash
BACKUP_DIR="/path/to/backups"
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -h localhost -U user -d dbname > $BACKUP_DIR/backup_$DATE.sql
```

### Configurar cron job:
```bash
crontab -e
# Agregar: 0 2 * * * /path/to/backup-script.sh
```

## Monitoreo y Logging

### Configurar Winston para logging estructurado:
```javascript
// En backend/src/index.js
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});
```

### Integrar Sentry para error tracking:
```javascript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

## Seguridad

### Configuraciones recomendadas:

1. **Rate Limiting:**
   ```bash
   npm install express-rate-limit
   ```
   ```javascript
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100 // limit each IP to 100 requests per windowMs
   });
   app.use('/api/auth', limiter);
   ```

2. **Helmet para headers seguros:**
   ```bash
   npm install helmet
   ```
   ```javascript
   import helmet from 'helmet';
   app.use(helmet());
   ```

3. **CORS configurado:**
   ```javascript
   app.use(cors({
     origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
     credentials: true
   }));
   ```

## CI/CD con GitHub Actions

El proyecto incluye workflow de CI/CD en `.github/workflows/ci.yml` que:
- Ejecuta tests en backend y frontend
- Construye imágenes Docker
- Publica en Docker Hub (requiere secrets configurados)

### Configurar secrets en GitHub:
- `DOCKER_USERNAME`
- `DOCKER_PASSWORD`

## Troubleshooting

### Problemas comunes:

1. **Error de conexión a DB:**
   - Verificar DATABASE_URL
   - Asegurar que PostgreSQL esté corriendo
   - Ejecutar `npx prisma generate`

2. **Errores de migración:**
   - Revisar logs: `docker-compose logs backend`
   - Resetear DB si es necesario: `npx prisma migrate reset`

3. **Problemas de permisos:**
   - Verificar ownership de archivos
   - Configurar usuario no-root para contenedores

## Escalado

Para mayor escala:
- Migrar a Kubernetes
- Usar Redis para sesiones/cache
- Implementar CDN para assets estáticos
- Configurar load balancer

## Contacto

Para soporte técnico, crear issue en el repositorio o contactar al equipo de desarrollo.