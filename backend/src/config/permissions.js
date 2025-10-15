// Definición de permisos por rol
export const PERMISSIONS = {
  // Gestión de empleados
  'employees.create': ['superadmin', 'admin'],
  'employees.read': ['superadmin', 'admin', 'director', 'auditor', 'usuario'],
  'employees.update': ['superadmin', 'admin'],
  'employees.delete': ['superadmin', 'admin'],

  // Observaciones
  'observations.create': ['superadmin', 'admin', 'director'],
  'observations.read': ['superadmin', 'admin', 'director', 'auditor'],
  'observations.update': ['superadmin', 'admin', 'director'],
  'observations.delete': ['superadmin', 'admin'],

  // Entrevistas
  'interviews.create': ['superadmin', 'admin', 'director'],
  'interviews.read': ['superadmin', 'admin', 'director', 'auditor'],
  'interviews.update': ['superadmin', 'admin', 'director'],
  'interviews.delete': ['superadmin', 'admin'],

  // Análisis de puestos
  'job-analyses.create': ['superadmin', 'admin', 'director'],
  'job-analyses.read': ['superadmin', 'admin', 'director', 'auditor'],
  'job-analyses.update': ['superadmin', 'admin', 'director'],
  'job-analyses.delete': ['superadmin', 'admin'],

  // Planes de desarrollo
  'development-plans.create': ['superadmin', 'admin', 'director'],
  'development-plans.read': ['superadmin', 'admin', 'director', 'auditor', 'usuario'],
  'development-plans.update': ['superadmin', 'admin', 'director'],
  'development-plans.delete': ['superadmin', 'admin'],

  // Administración
  'admin.departments': ['superadmin', 'admin'],
  'admin.categories': ['superadmin', 'admin'],
  'admin.competencies': ['superadmin', 'admin'],
  'admin.positions': ['superadmin', 'admin'],

  // Reportes
  'reports.view': ['superadmin', 'admin', 'director', 'auditor'],
  'reports.export': ['superadmin', 'admin', 'director'],

  // Analytics
  'analytics.view': ['superadmin', 'admin', 'director'],
  'analytics.advanced': ['superadmin', 'admin'],

  // RRHH
  'hr.leave-requests': ['superadmin', 'admin', 'director'],
  'hr.attendance': ['superadmin', 'admin', 'director'],
  'hr.payroll': ['superadmin', 'admin'],
  'hr.recruitment': ['superadmin', 'admin', 'director'],
  'hr.training': ['superadmin', 'admin', 'director'],

  // Organizaciones (solo superadmin)
  'organizations.manage': ['superadmin']
};

export const hasPermission = (userRole, permission) => {
  return PERMISSIONS[permission]?.includes(userRole) || false;
};

export const getRoleHierarchy = () => ({
  superadmin: 5,
  admin: 4,
  director: 3,
  auditor: 2,
  usuario: 1
});

export const canAccessRole = (currentRole, targetRole) => {
  const hierarchy = getRoleHierarchy();
  return hierarchy[currentRole] >= hierarchy[targetRole];
};