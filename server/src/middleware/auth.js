// VPS-SR-001 (#27) - OWNER: Preksha
// TODO(Preksha): verify the JWT from the "Authorization: Bearer <token>" header with process.env.JWT_SECRET,
// set req.user = { userId, role }, and respond 401 when the token is missing or invalid.
// Until then this stub lets everyone wire routes as: router.post('/', auth, requireRole('admin'), handler)
module.exports = function auth(req, res, next) {
  next();
};
