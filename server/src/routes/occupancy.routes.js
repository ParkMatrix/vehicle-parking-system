// OWNER: Nishant - #50 VPS-F-016
// SAD 4.3.2:  GET /api/admin/occupancy  (Admin) -> occupancy summary + active vehicles
// Kept in its own file (mounted at /api/admin in app.js) so it never conflicts with admin.routes.js (audit).
const { Router } = require('express');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/rbac');
const occupancyService = require('../services/occupancy.service');

const router = Router();

router.get('/occupancy', auth, requireRole('admin'), async (req, res) => {
  const occupancy = await occupancyService.getOccupancy();
  res.json(occupancy);
});

module.exports = router;
