import winston from 'winston';

const auditLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/audit.log' }),
    new winston.transports.Console()
  ]
});

export const auditLog = (action, userId, organizationId, details = {}) => {
  auditLogger.info({
    action,
    userId,
    organizationId,
    timestamp: new Date().toISOString(),
    ip: details.ip,
    userAgent: details.userAgent,
    resource: details.resource,
    resourceId: details.resourceId,
    changes: details.changes
  });
};

export const auditMiddleware = (action) => {
  return (req, res, next) => {
    const originalSend = res.send;
    res.send = function(data) {
      if (res.statusCode < 400) {
        auditLog(action, req.userId, req.organizationId, {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          resource: req.route?.path,
          resourceId: req.params?.id
        });
      }
      originalSend.call(this, data);
    };
    next();
  };
};