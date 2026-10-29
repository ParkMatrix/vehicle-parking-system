// OWNER: Nishant - #24 VPS-F-001, #25 VPS-F-002
// AUDIT: Preksha - #47 VPS-F-017, #48 VPS-SR-005
const authService = require('../services/auth.service');
const auditService = require('../services/audit.service');

async function register(req, res) {
  const user = await authService.register(req.body);
  res.status(201).json({ user });
}

async function login(req, res, next) {
  try {
    const result = await authService.login(req.body);
    await auditService.recordAudit({
      actorId: result.user?.id,
      action: 'AUTH_LOGIN',
      result: 'success',
      details: { email: result.user?.email },
    });
    res.json(result);
  } catch (err) {
    await auditService.recordAudit({
      actorId: null,
      action: 'AUTH_LOGIN',
      result: 'failure',
      details: { email: req.body?.email, reason: err.message },
    });
    next(err);
  }
}

module.exports = { register, login };
