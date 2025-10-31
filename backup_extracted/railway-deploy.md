# 🚂 Deploy en Railway - Guía Paso a Paso

## 📋 **Preparación (5 minutos)**

### **1. Crear archivo de configuración para Railway:**

```bash
# En la raíz del proyecto
touch railway.json
```

### **2. Configurar variables de entorno para producción:**

```bash
# backend/.env.production
DATABASE_URL=postgresql://postgres:password@host:port/database
JWT_SECRET=super-secret-key-256-bits-minimum-length
NODE_ENV=production
PORT=4000
FRONTEND_URL=https://tu-dominio.railway.app
```

### **3. Actualizar package.json del backend:**

```json
{
  "scripts": {
    "start": "node src/index.js",
    "build": "prisma generate && prisma migrate deploy",
    "dev": "nodemon src/index.js"
  }
}
```

## 🚀 **Deploy en Railway (15 minutos)**

### **Paso 1: Crear cuenta en Railway**
1. Ir a https://railway.app
2. Registrarse con GitHub
3. Conectar repositorio

### **Paso 2: Configurar Backend**
1. New Project → Deploy from GitHub
2. Seleccionar tu repositorio
3. Configurar variables de entorno:
   - `NODE_ENV=production`
   - `JWT_SECRET=tu-clave-super-segura-aqui`
   - `PORT=4000`

### **Paso 3: Configurar Base de Datos**
1. Add Service → PostgreSQL
2. Copiar DATABASE_URL generada
3. Agregar a variables de entorno del backend

### **Paso 4: Configurar Frontend**
1. Add Service → GitHub Repo (mismo repo)
2. Root Directory: `/frontend`
3. Build Command: `npm run build`
4. Start Command: `npm run preview`

## 🔧 **Configuración Automática**

### **railway.json (en raíz del proyecto):**
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "numReplicas": 1,
    "sleepApplication": false,
    "restartPolicyType": "ON_FAILURE"
  }
}
```

### **Dockerfile para backend (opcional):**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx prisma generate
EXPOSE 4000
CMD ["npm", "start"]
```

## ✅ **Verificación del Deploy**

### **URLs a verificar:**
- Backend: `https://tu-backend.railway.app/api/health`
- Frontend: `https://tu-frontend.railway.app`
- API Docs: `https://tu-backend.railway.app/api/docs`

### **Comandos de verificación:**
```bash
# Verificar que la API responde
curl https://tu-backend.railway.app/api/health

# Verificar base de datos
curl https://tu-backend.railway.app/api/public/organizations
```

## 🎯 **Próximo Paso: Poblar Demo**

Una vez que el deploy esté funcionando, ejecutar:

```bash
# Poblar datos demo en producción
curl -X POST https://tu-backend.railway.app/api/seed \
  -H "Content-Type: application/json" \
  -d '{"orgId": "demo-org"}'
```

## 💡 **Tips de Railway**

- **Gratis:** $5 de crédito inicial
- **Dominio:** Personalizable después
- **SSL:** Automático
- **Logs:** Disponibles en dashboard
- **Escalado:** Automático según uso

¡Listo para el siguiente paso! 🚀