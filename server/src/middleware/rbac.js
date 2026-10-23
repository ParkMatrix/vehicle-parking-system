// VPS-SR-002 (#30) - OWNER: Preksha
// Usage: requireRole('admin') or requireRole('staff', 'admin')
// Responds 403 when req.user.role is not in the allowed roles.
module.exports = function requireRole(...allowedRoles) {
  return function (req, res, next) {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: insufficient permissions.' });
    }
    next();
  };
};
