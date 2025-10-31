import { hasPermission } from '../config/permissions.js';

export const requirePermission = (permission) => {
  return (req, res, next) => {
    const userRole = req.user?.roles?.[0] || 'usuario';
    
    if (!hasPermission(userRole, permission)) {
      return res.status(403).json({ 
        error: 'Permisos insuficientes',
        required: permission,
        userRole 
      });
    }
    
    next();
  };
};

export const checkPermission = (req, res, next) => {
  // Add permission checker to request
  req.hasPermission = (permission) => {
    const userRole = req.user?.roles?.[0] || 'usuario';
    return hasPermission(userRole, permission);
  };
  
  next();
};