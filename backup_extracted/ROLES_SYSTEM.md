# 🔐 Sistema de Roles y Permisos

## 🏗️ **Estructura Jerárquica**

### **Nivel Global**
- **Superadmin**: Solo desarrollador (acceso multi-tenant)

### **Nivel Organización**
- **Admin**: Administrador completo de la organización
- **Director**: Gestión estratégica y supervisión
- **Auditor**: Solo lectura y auditoría
- **Usuario**: Empleado básico

## 📊 **Matriz de Permisos**

| Funcionalidad | Superadmin | Admin | Director | Auditor | Usuario |
|---------------|------------|-------|----------|---------|---------|
| **Empleados** |
| Crear | ✅ | ✅ | ❌ | ❌ | ❌ |
| Ver | ✅ | ✅ | ✅ | ✅ | ✅ |
| Editar | ✅ | ✅ | ❌ | ❌ | ❌ |
| Eliminar | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Observaciones** |
| Crear | ✅ | ✅ | ✅ | ❌ | ❌ |
| Ver | ✅ | ✅ | ✅ | ✅ | ❌ |
| Editar | ✅ | ✅ | ✅ | ❌ | ❌ |
| Eliminar | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Entrevistas** |
| Crear | ✅ | ✅ | ✅ | ❌ | ❌ |
| Ver | ✅ | ✅ | ✅ | ✅ | ❌ |
| Editar | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Planes Desarrollo** |
| Crear | ✅ | ✅ | ✅ | ❌ | ❌ |
| Ver | ✅ | ✅ | ✅ | ✅ | ✅ |
| Editar | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Administración** |
| Departamentos | ✅ | ✅ | ❌ | ❌ | ❌ |
| Competencias | ✅ | ✅ | ❌ | ❌ | ❌ |
| Puestos | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Reportes** |
| Ver | ✅ | ✅ | ✅ | ✅ | ❌ |
| Exportar | ✅ | ✅ | ✅ | ❌ | ❌ |
| **RRHH** |
| Vacaciones | ✅ | ✅ | ✅ | ❌ | ❌ |
| Asistencia | ✅ | ✅ | ✅ | ❌ | ❌ |
| Nóminas | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Organizaciones** |
| Gestionar | ✅ | ❌ | ❌ | ❌ | ❌ |

## 🚀 **Crear Usuarios de Prueba**

```bash
cd backend
node create-org-users.js
```

Esto creará:
- **Organización**: "Empresa Demo"
- **Admin**: admin@empresa.com / Admin123!
- **Director**: director@empresa.com / Director123!
- **Auditor**: auditor@empresa.com / Auditor123!
- **Usuario**: usuario@empresa.com / Usuario123!

## 🔧 **Uso en Backend**

```javascript
import { requirePermission } from '../middleware/permissions.js';

// Proteger endpoint
router.post('/employees', requirePermission('employees.create'), async (req, res) => {
  // Solo admin y superadmin pueden crear empleados
});

router.get('/reports', requirePermission('reports.view'), async (req, res) => {
  // Admin, director y auditor pueden ver reportes
});
```

## 🎨 **Uso en Frontend**

```jsx
import RoleGuard from '../components/RoleGuard';

// Mostrar botón solo si tiene permisos
<RoleGuard permission="employees.create" userRole={userRole}>
  <Button type="primary">Crear Empleado</Button>
</RoleGuard>

// Mostrar error si no tiene permisos
<RoleGuard 
  permission="admin.access" 
  userRole={userRole}
  showError={true}
>
  <AdminPanel />
</RoleGuard>
```

## 📋 **Flujo de Autenticación**

1. **Usuario hace login** en su organización
2. **Sistema determina rol** basado en asignación
3. **Token incluye rol** efectivo
4. **Cada request valida** permisos específicos
5. **Frontend oculta/muestra** elementos según rol

## 🔄 **Jerarquía de Roles**

```
Superadmin (5) → Acceso total multi-tenant
    ↓
Admin (4) → Control total de organización
    ↓  
Director (3) → Gestión y supervisión
    ↓
Auditor (2) → Solo lectura y reportes
    ↓
Usuario (1) → Acceso básico
```

## ⚙️ **Configuración**

### **Backend**
- `config/permissions.js` - Definición de permisos
- `middleware/permissions.js` - Validación de permisos
- `create-org-users.js` - Script de usuarios de prueba

### **Frontend**
- `components/RoleGuard.jsx` - Componente de protección
- Integración en páginas y componentes

## 🎯 **Casos de Uso**

### **Admin de Organización**
- Gestiona empleados, departamentos, competencias
- Configura sistema para su organización
- Ve todos los reportes y analytics

### **Director**
- Crea observaciones y entrevistas
- Ve reportes de su área
- Gestiona planes de desarrollo

### **Auditor**
- Solo lectura en todo el sistema
- Acceso a reportes y analytics
- No puede modificar datos

### **Usuario**
- Ve su propio plan de desarrollo
- Acceso limitado a información básica
- No puede crear ni modificar

**🔒 Sistema completo de roles implementado con permisos granulares por funcionalidad.**