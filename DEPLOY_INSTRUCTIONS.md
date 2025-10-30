# 🚀 Instrucciones de Despliegue - Sistema de Gestión de Competencias

## ✅ Estado del Proyecto
- **Backup creado**: `backup_proyecto.zip`
- **Proyecto corriendo en local**: ✅ Backend (http://localhost:4000), Frontend (http://localhost:5173)
- **Preparado para despliegue**: ✅ Firebase (backend) y Vercel (frontend)

## 📋 Pasos para Despliegue

### 1. Configurar Firebase (Backend)
```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Login en Firebase
firebase login

# Inicializar proyecto (desde carpeta backend)
cd backend
firebase init functions --project tu-proyecto-firebase

# Configurar variables de entorno en Firebase
firebase functions:config:set app.jwt_secret="tu_clave_jwt_muy_segura_aqui"
firebase functions:config:set app.database_url="postgresql://tu_conexion_postgresql"
firebase functions:config:set app.node_env="production"

# Desplegar funciones
firebase deploy --only functions:api
```

### 2. Configurar Vercel (Frontend)
```bash
# Instalar Vercel CLI
npm install -g vercel

# Login en Vercel
vercel login

# Desplegar desde carpeta frontend
cd frontend
vercel --prod

# Configurar variables de entorno en Vercel
# VITE_API_URL=https://tu-proyecto-firebase.web.app
```

### 3. Configurar Base de Datos PostgreSQL
- Crear base de datos PostgreSQL (Railway, Supabase, etc.)
- Actualizar `DATABASE_URL` en variables de entorno
- Ejecutar migraciones: `npx prisma migrate deploy`

### 4. Configurar Dominio (Opcional)
- Configurar dominio personalizado en Vercel
- Configurar dominio en Firebase Hosting si es necesario

## 🔧 Archivos de Configuración Creados

### Backend (Firebase)
- `backend/firebase.json` - Configuración Firebase
- `backend/.firebaserc` - Proyecto Firebase
- `backend/functions.js` - Wrapper para Firebase Functions
- `backend/.env` - Variables de entorno actualizadas

### Frontend (Vercel)
- `frontend/vercel.json` - Configuración Vercel
- `frontend/.env.production` - Variables de producción
- `frontend/src/services/api.js` - API configurada para producción

## 📝 Variables de Entorno a Configurar

### Firebase Functions
```bash
DATABASE_URL=postgresql://...
JWT_SECRET=tu_clave_segura
NODE_ENV=production
FIREBASE_PROJECT_ID=tu-proyecto-firebase
```

### Vercel
```bash
VITE_API_URL=https://tu-proyecto-firebase.web.app
```

## 🧪 Probar Despliegue Local

### Backend con Firebase Emulator
```bash
cd backend
firebase emulators:start --only functions
```

### Frontend con Build de Producción
```bash
cd frontend
npm run build
npm run preview
```

## 📞 URLs después del Despliegue
- **Frontend**: https://tu-app.vercel.app
- **Backend API**: https://tu-proyecto-firebase.web.app/api
- **Documentación API**: https://tu-proyecto-firebase.web.app/api/docs

## 🔐 Credenciales de Acceso
- **Superadmin**: superadmin@competencymanager.com / superadmin123
- **Organización**: superadmin-org

## ⚠️ Notas Importantes
1. Cambiar todas las claves secretas antes del despliegue
2. Configurar base de datos PostgreSQL en producción
3. Actualizar URLs en archivos de configuración
4. Probar todas las funcionalidades después del despliegue
5. Configurar monitoreo y logging en producción

## 🆘 Solución de Problemas
- Verificar logs: `firebase functions:log`
- Revisar configuración de CORS
- Confirmar variables de entorno
- Verificar conexión a base de datos

¡El proyecto está listo para desplegarse en producción!