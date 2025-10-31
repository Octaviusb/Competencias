import jwt from 'jsonwebtoken';

// Lista restringida de emails con acceso superadmin
const SUPERADMIN_EMAILS = [
  'developer@competencias.com', // Tu email como desarrollador principal
  // Agrega aquí emails de personas a quienes delegues acceso superadmin
  // 'trusted-admin@empresa.com',
];

export const requireSuperadmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Token requerido' });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verificar que el email esté en la lista de superadmins autorizados
    if (!SUPERADMIN_EMAILS.includes(payload.email?.toLowerCase())) {
      return res.status(403).json({ 
        error: 'Acceso denegado: Solo desarrolladores autorizados pueden realizar esta acción' 
      });
    }
    
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

export const isSuperadmin = (email) => {
  return SUPERADMIN_EMAILS.includes(email?.toLowerCase());
};