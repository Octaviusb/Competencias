# 🚀 Guía de Despliegue - Competency Manager

## 📋 Requisitos Previos

1. **Fly.io CLI**: `curl -L https://fly.io/install.sh | sh`
2. **Vercel CLI**: `npm i -g vercel`
3. **Cuentas**: Fly.io y Vercel

## 🔧 Configuración Inicial

### Backend (Fly.io)
```bash
cd backend
fly auth login
fly launch --name competency-manager
```

### Frontend (Vercel)
```bash
cd frontend
vercel login
vercel link
```

## 🚀 Despliegue Automático

```bash
chmod +x deploy.sh
./deploy.sh
```

## 🔧 Despliegue Manual

### 1. Backend a Fly.io
```bash
cd backend
fly deploy
fly ssh console -C "npm run setup-prod"
```

### 2. Frontend a Vercel
```bash
cd frontend
vercel --prod
```

## 🔑 Credenciales de Demo

Una vez desplegado, usa estas credenciales:

### 👤 Administrador
- **Email**: admin@demo.com
- **Contraseña**: demo123
- **Organización**: demo-org

### 🧠 Psicólogo/RRHH
- **Email**: psicologo@demo.com
- **Contraseña**: psycho123
- **Organización**: demo-org

## 🌐 URLs de Producción

- **Backend**: https://competency-manager.fly.dev
- **Frontend**: https://competencias-frontend.vercel.app
- **API Docs**: https://competency-manager.fly.dev/api/docs

## 📊 Funcionalidades Disponibles

### ✅ Módulos Implementados
- 🧠 **Pruebas Psicométricas Big Five**
- 📊 **Carga Masiva de Datos**
- 👥 **Gestión de Empleados**
- 🎯 **Análisis de Puestos**
- 💰 **Nómina Electrónica DIAN**
- 📈 **Sistema de Competencias**
- 🔍 **Observaciones y Entrevistas**

### 🔗 Rutas Principales
- `/dashboard` - Panel principal
- `/psychometric` - Pruebas psicométricas
- `/bulk-import` - Carga masiva
- `/employees` - Gestión de empleados
- `/job-analyses` - Análisis de puestos

## 🛠️ Comandos Útiles

### Fly.io
```bash
fly logs                    # Ver logs
fly ssh console            # Acceso SSH
fly status                 # Estado de la app
fly scale count 1          # Escalar instancias
```

### Vercel
```bash
vercel logs                # Ver logs
vercel env ls              # Ver variables de entorno
vercel --prod              # Desplegar a producción
```

## 🔧 Variables de Entorno

### Backend (.env.production)
```
NODE_ENV=production
PORT=8080
JWT_SECRET=competency_manager_prod_secret_2024_secure_key
DATABASE_URL="file:/data/prod.db"
TENANT_HEADER=X-Organization-Id
LOG_LEVEL=info
```

### Frontend (.env.production)
```
VITE_API_URL=https://competency-manager.fly.dev
```

## 📝 Notas Importantes

1. **Base de Datos**: SQLite con volumen persistente en Fly.io
2. **Autenticación**: JWT con multi-tenancy
3. **CORS**: Configurado para Vercel
4. **SSL**: Automático en ambas plataformas
5. **Escalabilidad**: Configurado para auto-scale

## 🆘 Solución de Problemas

### Backend no responde
```bash
fly logs
fly restart
```

### Frontend no carga
```bash
vercel logs
vercel redeploy
```

### Base de datos corrupta
```bash
fly ssh console -C "npm run setup-prod"
```