// Sprint 2
//   GET /api/admin/occupancy  (Admin) -> Nishant, #50 VPS-F-016
//   GET /api/admin/audit      (Admin) -> Preksha, #47/#49 VPS-F-017, VPS-NF-006
const { Router } = require('express');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/rbac');
const auditService = require('../services/audit.service');

const router = Router();

// VPS-NF-006 (#49): Inspect audit retention policy (Admin only)
router.get('/audit/retention', auth, requireRole('admin'), (req, res) => {
  res.json(auditService.getRetentionConfig());
});

// VPS-F-017 (#47) / VPS-NF-006 (#49): Review audit records (Admin only)
router.get('/audit', auth, requireRole('admin'), async (req, res, next) => {
  try {
    const logs = await auditService.getAuditLogs(req.query);
    res.json({ logs });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
