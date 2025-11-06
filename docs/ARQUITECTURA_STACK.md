# Arquitectura del Stack - Competency Manager

## Resumen Ejecutivo
Sistema de gestión de talento humano con arquitectura de 3 capas: Frontend React, Backend Node.js y Base de Datos SQLite/PostgreSQL.

## Arquitectura General

```
┌─────────────────┐    HTTP/HTTPS     ┌─────────────────┐    Prisma ORM    ┌─────────────────┐
│                 │ ◄──────────────► │                 │ ◄──────────────► │                 │
│   FRONTEND      │                  │    BACKEND      │                  │   DATABASE      │
│   (React)       │                  │   (Node.js)     │                  │ (SQLite/PostgreSQL)│
│                 │                  │                 │                  │                 │
└─────────────────┘                  └─────────────────┘                  └─────────────────┘
```

## Capa Frontend (React)

### Tecnologías
- **React 18** con Vite
- **Ant Design** para componentes UI
- **React Router** para navegación
- **Axios** para comunicación HTTP

### Estructura
```
frontend/src/
├── components/          # Componentes reutilizables
├── pages/              # Páginas de la aplicación
├── services/           # Servicios API (api.js, hrApi.js)
├── utils/              # Utilidades (security.js)
├── App.jsx             # Componente principal
└── router.jsx          # Configuración de rutas
```

### Comunicación con Backend
- **Base URL**: `http://localhost:4000/api`
- **Autenticación**: JWT Bearer Token
- **Headers**: 
  - `Authorization: Bearer <token>`
  - `X-Organization-Id: <org-id>` (multi-tenant)

## Capa Backend (Node.js)

### Tecnologías
- **Node.js** con Express
- **Prisma ORM** para base de datos
- **JWT** para autenticación
- **Winston** para logging
- **Helmet** para seguridad
- **Swagger** para documentación API

### Estructura
```
backend/src/
├── routes/             # Endpoints REST API
├── middleware/         # Middleware de autenticación y validación
├── services/           # Servicios de negocio
├── schemas/            # Validación de datos
└── index.js            # Punto de entrada
```

### Middleware Stack
1. **Helmet** - Seguridad HTTP headers
2. **Rate Limiting** - 100 req/15min por IP
3. **CORS** - Cross-origin resource sharing
4. **JWT Auth** - Autenticación de usuarios
5. **Validation** - Sanitización de entrada
6. **Multi-tenant** - Aislamiento por organización

## Capa Base de Datos

### Tecnologías
- **SQLite** (desarrollo)
- **PostgreSQL** (producción)
- **Prisma ORM** como abstracción

### Esquema Principal
```
Organization (Multi-tenant)
├── Users & Roles
├── Employees & Departments
├── Competencies & Categories
├── Evaluations & Templates
├── Observations & Interviews
├── Job Analysis & Positions
├── Development Plans
├── HR Modules (Payroll, Attendance, Leave)
└── Audit Logs
```

## Flujo de Comunicación

### 1. Autenticación
```
Frontend → POST /api/auth/login → Backend
Backend → Valida credenciales → Database
Backend → Genera JWT → Frontend
Frontend → Almacena token → localStorage
```

### 2. Operaciones CRUD
```
Frontend → HTTP Request + JWT → Backend
Backend → Valida token → Middleware
Backend → Verifica permisos → Database
Backend → Ejecuta operación → Prisma ORM
Database → Retorna datos → Backend
Backend → Respuesta JSON → Frontend
```

### 3. Multi-tenancy
```
Frontend → Incluye X-Organization-Id → Backend
Backend → Filtra datos por organización → Database
Database → Solo datos de la org → Backend
Backend → Respuesta filtrada → Frontend
```

## Configuración de Entorno

### Variables Backend (.env)
```
DATABASE_URL="file:./dev.db"
JWT_SECRET="clave_secreta"
PORT=4000
FRONTEND_URL="http://localhost:5173"
```

### Variables Frontend (.env)
```
VITE_API_URL="http://localhost:4000/api"
```

## Puertos y Servicios

| Servicio | Puerto | URL |
|----------|--------|-----|
| Frontend | 5173 | http://localhost:5173 |
| Backend | 4000 | http://localhost:4000 |
| API Docs | 4000 | http://localhost:4000/api/docs |
| Database | - | file:./dev.db |

## Escalabilidad

### Horizontal
- Frontend: CDN + múltiples instancias
- Backend: Load balancer + cluster de servidores
- Database: Read replicas + sharding por organización

### Vertical
- Frontend: Code splitting + lazy loading
- Backend: Caching (Redis) + optimización de queries
- Database: Índices + particionamiento

## Monitoreo y Logs

### Backend Logging
- **Winston** para logs estructurados
- **Archivos**: error.log, combined.log
- **Niveles**: error, warn, info, debug

### Métricas
- Rate limiting por IP
- Tiempo de respuesta API
- Errores por endpoint
- Uso de memoria y CPU