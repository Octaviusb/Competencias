# 🚀 Guía de Instalación Completa

## ✅ **Estado Actual del Proyecto**
- **Seguridad**: 🟢 Vulnerabilidades críticas resueltas
- **Tests**: 🟢 Configurados y funcionando
- **Multi-tenant**: 🟢 Implementado con superadmin
- **Backend**: 🟢 APIs completas y seguras
- **Frontend**: 🟢 Interfaz funcional con navegación

## 📋 **Instalación Paso a Paso**

### **1. Clonar y Configurar Backend**
```bash
cd backend
npm install
cp .env.example .env
```

### **2. Configurar Variables de Entorno**
Editar `.env`:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="tu_clave_secreta_muy_segura_aqui"
PORT=4000
FRONTEND_URL="http://localhost:5173"
NODE_ENV="development"
```

### **3. Configurar Base de Datos**
```bash
npx prisma migrate dev
npx prisma generate
```

### **4. Crear Usuario Superadmin**
```bash
node create-superadmin.js
```
**Credenciales creadas:**
- Email: `developer@competencias.com`
- Password: `SuperAdmin2024!`

### **5. Instalar y Configurar Frontend**
```bash
cd ../frontend
npm install
```

### **6. Ejecutar el Sistema**

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### **7. Acceder al Sistema**
1. Ir a: `http://localhost:5173`
2. Seleccionar organización o crear nueva
3. Login con credenciales de superadmin
4. ¡Listo para usar!

## 🔒 **Configuración de Seguridad**

### **Superadmin Access**
Solo estos emails pueden ser superadmin:
```javascript
// backend/src/middleware/superadmin.js
const SUPERADMIN_EMAILS = [
  'developer@competencias.com', // Tu email
  // Agregar más emails según necesidad
];
```

### **Cambiar Email de Superadmin**
1. Editar `backend/src/middleware/superadmin.js`
2. Cambiar email en la lista `SUPERADMIN_EMAILS`
3. Reiniciar servidor backend

## 🧪 **Ejecutar Tests**
```bash
cd backend
npm test
```

## 📊 **URLs Importantes**
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:4000
- **API Docs**: http://localhost:4000/api/docs
- **Health Check**: http://localhost:4000/api/health

## 🔧 **Comandos Útiles**

### **Desarrollo**
```bash
# Reiniciar base de datos
npx prisma migrate reset

# Ver base de datos
npx prisma studio

# Generar datos de ejemplo
npm run seed
```

### **Producción**
```bash
# Build frontend
cd frontend && npm run build

# Start backend en producción
cd backend && npm start
```

## 🚨 **Solución de Problemas**

### **Error de CORS**
Verificar `FRONTEND_URL` en `.env`

### **Error de Base de Datos**
```bash
npx prisma migrate reset
npx prisma generate
```

### **Error de Autenticación**
Verificar `JWT_SECRET` en `.env`

### **Tests Fallan**
```bash
npm install --save-dev jest supertest
```

## 📈 **Próximos Pasos**

1. **Cambiar contraseña** de superadmin después del primer login
2. **Configurar email** para notificaciones
3. **Revisar TODO.md** para funcionalidades pendientes
4. **Leer SECURITY.md** para mejores prácticas

## 🎯 **Funcionalidades Disponibles**

### ✅ **Completamente Funcional**
- Autenticación y autorización
- Gestión de empleados
- Observaciones de desempeño
- Entrevistas
- Análisis de puestos
- Planes de desarrollo
- Sistema multi-tenant
- Panel de administración

### 🔄 **En Desarrollo**
- Analytics avanzados
- Notificaciones por email
- Reportes PDF
- Integraciones externas

¡El sistema está listo para usar en producción con todas las medidas de seguridad implementadas!