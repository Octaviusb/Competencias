# 🔐 Credenciales del Sistema

## 👤 **Usuario Superadmin**

### **Paso 1: Seleccionar Organización**
1. Ir a: `http://localhost:5173`
2. Seleccionar: **"Sistema Central"**
3. O usar ID: `e855a7b2-f858-4587-8e7f-997eda8bee17`

### **Paso 2: Login**
- **Email**: `developer@competencias.com`
- **Contraseña**: `SuperAdmin2024!`
- **Organización**: Ya seleccionada en paso 1

## 🔄 **Flujo Completo**

1. **Abrir**: http://localhost:5173
2. **Página**: "Seleccionar Organización"
3. **Acción**: Click en "Seleccionar" junto a "Sistema Central"
4. **Redirección**: Automática a login
5. **Login**: Usar credenciales de arriba
6. **Resultado**: Acceso completo como superadmin

## ⚠️ **Si No Funciona**

### **Verificar Backend**
```bash
cd backend
npm start
```

### **Verificar Organización**
```bash
node check-superadmin.js
```

### **Recrear Usuario**
```bash
node create-superadmin.js
```

## 🎯 **Funcionalidades de Superadmin**

- ✅ Cambiar entre organizaciones
- ✅ Crear nuevas organizaciones  
- ✅ Acceso a todas las funciones
- ✅ Panel de administración completo

## 🔧 **URLs Importantes**

- **Frontend**: http://localhost:5173
- **Seleccionar Org**: http://localhost:5173/select-organization
- **Login**: http://localhost:5173/login
- **Dashboard**: http://localhost:5173/dashboard