# Diagrama de Módulos Core - Competency Manager

## Arquitectura de Módulos

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           COMPETENCY MANAGER - MÓDULOS CORE                        │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   AUTENTICACIÓN │    │   ORGANIZACIONES│    │    EMPLEADOS    │    │   COMPETENCIAS  │
│   & SEGURIDAD   │    │   & MULTI-TENANT│    │   & PERFILES    │    │   & CATEGORÍAS  │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ • JWT Auth      │    │ • Multi-tenancy │    │ • Gestión CRUD  │    │ • Definición    │
│ • Roles/Permisos│    │ • Aislamiento   │    │ • Departamentos │    │ • Categorización│
│ • Rate Limiting │    │ • Superadmin    │    │ • Posiciones    │    │ • Evaluación    │
│ • Audit Logs    │    │ • Org Switching │    │ • Jerarquías    │    │ • Niveles 1-5   │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │                       │
         └───────────────────────┼───────────────────────┼───────────────────────┘
                                 │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   OBSERVACIONES │    │   ENTREVISTAS   │    │ ANÁLISIS PUESTOS│    │ PLANES DESARROLLO│
│   360° FEEDBACK │    │   ESTRUCTURADAS │    │   & PERFILES    │    │   INDIVIDUALES  │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ • Formal/Informal│    │ • Templates     │    │ • 5 Secciones   │    │ • Metas/Objetivos│
│ • Comportamientos│    │ • Tipos múltiples│    │ • Funciones     │    │ • Actividades   │
│ • Competencias  │    │ • Evaluaciones  │    │ • Competencias  │    │ • Seguimiento   │
│ • Ratings 1-5   │    │ • Actas formales│    │ • Expectativas  │    │ • Reviews       │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │                       │
         └───────────────────────┼───────────────────────┼───────────────────────┘
                                 │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   VACACIONES    │    │   ASISTENCIA    │    │   NÓMINA DIAN   │    │  RECLUTAMIENTO  │
│   & PERMISOS    │    │   & TIEMPO      │    │   ELECTRÓNICA   │    │   & SELECCIÓN   │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ • Solicitudes   │    │ • Check-in/out  │    │ • CUNE automático│    │ • Vacantes      │
│ • Aprobaciones  │    │ • Horas trabajadas│    │ • Firma digital │    │ • Candidatos    │
│ • Saldos        │    │ • Horas extras  │    │ • Transmisión   │    │ • Aplicaciones  │
│ • Calendario    │    │ • Reportes      │    │ • Cumplimiento  │    │ • Proceso       │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │                       │
         └───────────────────────┼───────────────────────┼───────────────────────┘
                                 │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CAPACITACIÓN  │    │    ANALÍTICA    │    │   DOCUMENTOS    │    │    BÚSQUEDA     │
│   & DESARROLLO  │    │   & REPORTES    │    │   & TEMPLATES   │    │    GLOBAL       │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ • Cursos        │    │ • Dashboard     │    │ • Procedimientos│    │ • Multi-entidad │
│ • Inscripciones │    │ • Métricas      │    │ • Actas         │    │ • Filtros       │
│ • Certificaciones│    │ • Distribuciones│    │ • Sanciones     │    │ • Resultados    │
│ • Evaluaciones  │    │ • Tendencias    │    │ • Políticas     │    │ • Relevancia    │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Módulos Core Detallados

### 1. Módulo de Autenticación & Seguridad
**Responsabilidad**: Gestión de acceso y seguridad del sistema
- **JWT Authentication**: Tokens seguros con expiración
- **Sistema de Roles**: Admin, Manager, Employee, Superadmin
- **Rate Limiting**: Protección contra ataques DDoS
- **Audit Logs**: Trazabilidad completa de acciones

### 2. Módulo de Organizaciones & Multi-tenant
**Responsabilidad**: Aislamiento de datos por organización
- **Multi-tenancy**: Separación completa de datos
- **Superadmin**: Gestión cross-organizacional
- **Organization Switching**: Cambio dinámico de contexto

### 3. Módulo de Empleados & Perfiles
**Responsabilidad**: Gestión del capital humano
- **CRUD Empleados**: Creación, edición, desactivación
- **Departamentos**: Estructura organizacional
- **Posiciones**: Definición de roles laborales
- **Jerarquías**: Relaciones manager-subordinado

### 4. Módulo de Competencias & Categorías
**Responsabilidad**: Framework de competencias organizacionales
- **Definición**: Competencias técnicas y blandas
- **Categorización**: Agrupación lógica
- **Evaluación**: Escala 1-5 niveles
- **Reutilización**: Uso en múltiples contextos

### 5. Módulo de Observaciones 360°
**Responsabilidad**: Feedback continuo y evaluación
- **Tipos**: Formal, Informal, 360° Feedback
- **Comportamientos**: Registro de conductas observadas
- **Competencias**: Evaluación por competencia
- **Ratings**: Sistema de calificación 1-5

### 6. Módulo de Entrevistas Estructuradas
**Responsabilidad**: Evaluaciones formales programadas
- **Templates**: Plantillas reutilizables
- **Tipos**: Performance, Development, Exit, Promotion
- **Evaluaciones**: Por competencia con evidencia
- **Actas**: Documentación formal de resultados

### 7. Módulo de Análisis de Puestos
**Responsabilidad**: Definición detallada de posiciones
- **5 Secciones**: Propósito, Funciones, Contexto, Competencias, Expectativas
- **Funciones Esenciales**: Hasta 6 funciones principales
- **Competencias Requeridas**: Niveles esperados
- **Expectativas**: Criterios de desempeño

### 8. Módulo de Planes de Desarrollo
**Responsabilidad**: Crecimiento profesional individualizado
- **Metas/Objetivos**: Definición de targets
- **Actividades**: Training, mentoring, proyectos
- **Seguimiento**: Progress tracking
- **Reviews**: Evaluaciones periódicas

### 9. Módulo de Vacaciones & Permisos
**Responsabilidad**: Gestión de ausencias laborales
- **Solicitudes**: Workflow digital
- **Aprobaciones**: Proceso automático
- **Saldos**: Control por empleado
- **Calendario**: Vista unificada

### 10. Módulo de Asistencia & Tiempo
**Responsabilidad**: Control de tiempo trabajado
- **Check-in/out**: Registro de entrada/salida
- **Horas Trabajadas**: Cálculo automático
- **Horas Extras**: Tracking y aprobación
- **Reportes**: Análisis de asistencia

### 11. Módulo de Nómina DIAN Electrónica
**Responsabilidad**: Cumplimiento fiscal colombiano
- **CUNE Automático**: Código único de nómina
- **Firma Digital**: Autenticación segura
- **Transmisión**: Envío automático a DIAN
- **Cumplimiento**: Resolución 000013 de 2021

### 12. Módulo de Reclutamiento & Selección
**Responsabilidad**: Atracción y selección de talento
- **Vacantes**: Publicación de posiciones
- **Candidatos**: Base de datos de aplicantes
- **Aplicaciones**: Seguimiento de procesos
- **Proceso**: Workflow estructurado

### 13. Módulo de Capacitación & Desarrollo
**Responsabilidad**: Formación continua
- **Cursos**: Catálogo de formación
- **Inscripciones**: Gestión de participantes
- **Certificaciones**: Validación de competencias
- **Evaluaciones**: Efectividad de formación

### 14. Módulo de Analítica & Reportes
**Responsabilidad**: Inteligencia de negocio
- **Dashboard**: Métricas en tiempo real
- **Distribuciones**: Por departamento, competencia
- **Tendencias**: Análisis temporal
- **KPIs**: Indicadores clave de desempeño

### 15. Módulo de Documentos & Templates
**Responsabilidad**: Gestión documental
- **Procedimientos**: Documentación de procesos
- **Actas**: Registros formales
- **Sanciones**: Documentos disciplinarios
- **Políticas**: Normativas organizacionales

### 16. Módulo de Búsqueda Global
**Responsabilidad**: Localización de información
- **Multi-entidad**: Búsqueda cross-módulos
- **Filtros**: Refinamiento de resultados
- **Relevancia**: Ranking inteligente
- **Performance**: Búsqueda optimizada

## Interconexiones Clave

### Flujo de Competencias
```
Competencias → Análisis Puestos → Observaciones → Planes Desarrollo
```

### Flujo de Evaluación
```
Empleados → Observaciones → Entrevistas → Planes Desarrollo
```

### Flujo HR
```
Asistencia → Nómina → Vacaciones → Reportes
```

### Flujo de Reclutamiento
```
Vacantes → Candidatos → Entrevistas → Empleados
```