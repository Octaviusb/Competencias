# 🔒 Configuración de Superadmin

## 1. Crear Usuario Superadmin

```bash
cd backend
node create-superadmin.js
```

Esto creará:
- ✅ Usuario con email: `developer@competencias.com`
- ✅ Contraseña temporal: `SuperAdmin2024!`
- ✅ Organización central del sistema
- ✅ Acceso completo multi-tenant

## 2. Configurar Emails Autorizados

Edita el archivo `backend/src/middleware/superadmin.js`:

```javascript
const SUPERADMIN_EMAILS = [
  'developer@competencias.com', // Tu email principal
  'admin@tuempresa.com',        // Email de confianza
  // Agrega más emails según necesites
];
```

## 3. Seguridad Implementada

### ✅ **Restricciones de Acceso**
- Solo emails en la lista pueden ser superadmin
- Validación en backend y frontend
- Middleware de autorización en endpoints críticos

### ✅ **Endpoints Protegidos**
- `GET /auth/organizations` - Solo superadmin
- `POST /organizations` - Solo superadmin
- `GET /auth/profile` - Determina rol efectivo

### ✅ **Frontend Seguro**
- Selector de organizaciones solo visible para superadmin
- Página SelectOrganization con validación de acceso
- Mensajes de error específicos para acceso denegado

## 4. Flujo de Seguridad

```
Usuario Normal:
Login → role: 'admin'/'employee' → No ve selector de orgs

Superadmin:
Login → email en lista → role: 'superadmin' → Ve selector de orgs
```

## 5. Delegación de Acceso

Para dar acceso superadmin a alguien más:

1. Agrega su email a `SUPERADMIN_EMAILS` en `superadmin.js`
2. Reinicia el servidor backend
3. El usuario podrá cambiar entre organizaciones

## 6. Auditoría

- Todos los cambios de organización se pueden loggear
- Solo emails específicos tienen acceso multi-tenant
- Separación completa entre organizaciones para usuarios normales

## ⚠️ IMPORTANTE

- **Cambia la contraseña** después del primer login
- **Mantén la lista de emails actualizada** y restringida
- **Solo delega acceso** a personas de máxima confianza
- **Revisa regularmente** quién tiene acceso superadmin