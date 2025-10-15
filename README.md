# 🇨🇴 Competency Manager - Sistema Colombiano de Gestión de Talento Humano

**Software nacional colombiano** que revoluciona la gestión del talento humano con **cumplimiento total** de la normatividad laboral, contable y tributaria colombiana. La única solución integral que combina desarrollo profesional con **nómina electrónica DIAN** y cumplimiento fiscal automático.

## 🏆 **Certificación DIAN - Nómina Electrónica**
- ✅ **Documento Soporte de Pago de Nómina Electrónica** (Resolución 000013 de 2021)
- ✅ **Integración completa con DIAN** para transmisión automática
- ✅ **Firma digital** y autenticación segura
- ✅ **CUNE automático** y trazabilidad fiscal completa
- ✅ **Calendario de cumplimiento** según tamaño de empresa
- ✅ **Reintentos automáticos** y gestión de rechazos

## 🚀 Características Principales

### 📊 Dashboard Interactivo
- Métricas en tiempo real del sistema
- Accesos rápidos a funciones principales
- Interfaz responsiva y moderna

### 👥 Gestión de Empleados
- Registro y administración de empleados
- Asignación de departamentos y posiciones
- Seguimiento de información personal

### 👁️ Sistema de Observaciones
- Registro de observaciones de desempeño
- Evaluaciones formales e informales
- Seguimiento de comportamientos y competencias

### 💬 Gestión de Entrevistas
- Programación de entrevistas de desempeño
- Seguimiento de diferentes tipos de entrevistas
- Registro de resultados y feedback

### 📋 Análisis de Puestos
- Análisis detallado de posiciones laborales
- Definición de funciones esenciales
- Identificación de competencias requeridas
- Establecimiento de expectativas de desempeño

### 🏆 Planes de Desarrollo
- Creación de planes de desarrollo individualizados
- Seguimiento de metas y objetivos
- Gestión de actividades de capacitación

### 📈 Analítica y Reportes
- Estadísticas del sistema
- Distribuciones por departamento
- Métricas de rendimiento

### 📅 Gestión de Vacaciones y Permisos
- Solicitud digital de vacaciones
- Workflow de aprobación automático
- Control de saldos por empleado
- Calendario de ausencias

### ⏰ Control de Asistencia
- Registro de entrada y salida
- Control de tiempo trabajado
- Reportes de asistencia
- Gestión de horas extras

### 💰 Gestión de Nóminas con DIAN
- ✅ **Nómina electrónica DIAN** con CUNE automático
- ✅ **Documento Soporte de Pago** conforme a normatividad
- ✅ **Transmisión automática** a sistemas DIAN
- ✅ **Firma digital** y autenticación segura
- ✅ **Calendario de cumplimiento** por tamaño de empresa
- ✅ **Reintentos y gestión de rechazos** automáticos
- ✅ **Trazabilidad fiscal completa** con auditoría

### 👥 Reclutamiento y Selección
- Publicación de vacantes
- Gestión de candidatos
- Seguimiento de aplicaciones
- Proceso de selección estructurado

### 📚 Capacitación y Desarrollo
- Catálogo de cursos
- Inscripciones y seguimiento
- Evaluación de efectividad
- Gestión de certificaciones

## 🏛️ **Cumplimiento Normativo Colombiano**

### 📋 **Normatividad Laboral**
- ✅ **Código Sustantivo del Trabajo**
- ✅ **Ley 50 de 1990** (Negociación colectiva)
- ✅ **Ley 1010 de 2006** (Higiene y seguridad laboral)
- ✅ **Decreto 1072 de 2015** (Sistema de Gestión de Seguridad y Salud en el Trabajo)

### 💼 **Normatividad Contable**
- ✅ **Decreto 2420 de 2015** (Marco técnico normativo de contabilidad)
- ✅ **Ley 1314 de 2009** (Modernización del régimen de inversiones)
- ✅ **Normas Internacionales de Información Financiera (NIIF)**

### 🏦 **Normatividad Tributaria**
- ✅ **Estatuto Tributario Nacional** (Ley 1607 de 2012)
- ✅ **Resolución 000013 de 2021** (Nómina Electrónica DIAN)
- ✅ **Decreto 358 de 2020** (Facturación Electrónica)
- ✅ **Resolución 000042 de 2020** (Integración DIAN)

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js** con Express
- **Prisma ORM** con SQLite
- **JWT** para autenticación
- **Zod** para validación
- **Swagger** para documentación API

### Frontend
- **React** con Vite
- **Ant Design** para componentes UI
- **React Query** para gestión de estado
- **React Router** para navegación

## 📁 Estructura del Proyecto

```
competencias/
├── backend/
│   ├── src/
│   │   ├── routes/          # Endpoints de la API
│   │   ├── middleware/      # Middleware de autenticación
│   │   └── index.js         # Punto de entrada
│   ├── prisma/
│   │   ├── schema.prisma    # Esquema de base de datos
│   │   └── migrations/      # Migraciones de BD
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/           # Páginas de la aplicación
│   │   ├── services/        # Servicios API
│   │   └── App.jsx          # Componente principal
│   ├── public/
│   └── package.json
└── README.md
```

## 🚀 Instalación y Ejecución

### Prerrequisitos
- Node.js 18+
- npm o yarn

### Backend
```bash
cd backend
npm install
cp .env.example .env  # Configurar variables de entorno
npx prisma migrate dev
npx prisma generate
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Variables de Entorno
Crear archivo `.env` en la carpeta backend:
```
DATABASE_URL="file:./dev.db"
JWT_SECRET="tu_clave_secreta_aqui"
PORT=4000
```

## 🔧 Configuración

### Base de Datos
El sistema utiliza SQLite por defecto. Para cambiar a otra base de datos, modificar `DATABASE_URL` en el archivo `.env` y actualizar `schema.prisma`.

### Puerto del Servidor
- Backend: `http://localhost:4000`
- Frontend: `http://localhost:5173`

## 🚀 Inicio Rápido

### Cuenta Demo
Para probar el sistema, usa la cuenta demo:
- **Email:** admin@demo.com
- **Contraseña:** demo123
- **Organización:** demo-org

Ejecuta el seed para crear datos de ejemplo:
```bash
cd backend
npm run seed
```

## � API Documentation

La documentación completa de la API está disponible en:
`http://localhost:4000/api/docs`

## 🔐 Autenticación

El sistema utiliza JWT para autenticación. Los endpoints protegidos requieren un token válido en el header `Authorization: Bearer <token>`.

## 🌐 Despliegue

### Opción 1: Docker
```bash
# Construir imágenes
docker build -t competencias-backend ./backend
docker build -t competencias-frontend ./frontend

# Ejecutar contenedores
docker run -p 4000:4000 competencias-backend
docker run -p 80:80 competencias-frontend
```

### Opción 2: Servicios en la Nube
- **Backend**: Desplegar en Heroku, Railway, o Vercel
- **Frontend**: Desplegar en Vercel, Netlify, o GitHub Pages
- **Base de Datos**: Usar PostgreSQL en producción

## 📊 Funcionalidades Clave

### Análisis de Puestos
1. **Sección I**: Propósito del trabajo
2. **Sección II**: Funciones esenciales
3. **Sección III**: Contexto organizacional
4. **Sección IV**: Competencias requeridas
5. **Sección V**: Expectativas de desempeño

### Sistema de Competencias
- Categorización de competencias
- Evaluación por niveles
- Análisis de brechas
- Planes de desarrollo personalizados

### Observaciones 360°
- Autoevaluación
- Evaluación por pares
- Feedback de superiores
- Evaluación de subordinados

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama para feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 📞 Soporte

Para soporte técnico o preguntas:
- Crear issue en GitHub
- Contactar al equipo de desarrollo

---

**Desarrollado con ❤️ para potenciar el talento humano**
# competency-manager
