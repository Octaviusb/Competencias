import React from 'react';
import { Alert } from 'antd';

const PERMISSIONS = {
  'employees.create': ['superadmin', 'admin'],
  'employees.read': ['superadmin', 'admin', 'director', 'auditor', 'usuario'],
  'employees.update': ['superadmin', 'admin'],
  'employees.delete': ['superadmin', 'admin'],
  'observations.create': ['superadmin', 'admin', 'director'],
  'observations.read': ['superadmin', 'admin', 'director', 'auditor'],
  'admin.access': ['superadmin', 'admin'],
  'reports.view': ['superadmin', 'admin', 'director', 'auditor'],
  'analytics.view': ['superadmin', 'admin', 'director']
};

export const hasPermission = (userRole, permission) => {
  return PERMISSIONS[permission]?.includes(userRole) || false;
};

export default function RoleGuard({ 
  children, 
  permission, 
  userRole, 
  fallback = null,
  showError = false 
}) {
  if (!hasPermission(userRole, permission)) {
    if (showError) {
      return (
        <Alert
          message="Acceso Denegado"
          description={`No tienes permisos para acceder a esta funcionalidad. Rol requerido: ${PERMISSIONS[permission]?.join(', ')}`}
          type="error"
          showIcon
        />
      );
    }
    return fallback;
  }

  return children;
}