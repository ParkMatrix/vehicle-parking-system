// VPS-SR-002 (#30) - OWNER: Preksha
// Usage: requireRole('admin') or requireRole('staff', 'admin')
// TODO(Preksha): respond 403 when req.user.role is not in the allowed roles.
module.exports = function requireRole(...allowedRoles) {
  return function (req, res, next) {
    next();
  };
};
