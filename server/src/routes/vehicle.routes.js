// OWNER: Preksha - #28 VPS-F-003, #29 VPS-F-004
// SAD 4.3.2:
//   GET   /api/vehicles      (User/Staff/Admin) -> list permitted vehicles
//   POST  /api/vehicles      (User)             -> register vehicle
//   PATCH /api/vehicles/:id  (Owner/Admin)      -> update permitted vehicle
// Sprint 2 (other owners) will add: GET /:id/current-slot (Siddesh), GET /:id/history (Preksha)
const { Router } = require('express');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/rbac');
const router = Router();

// router.get('/', auth, vehicleController.list);
// router.post('/', auth, requireRole('owner'), vehicleController.create);
// router.patch('/:id', auth, vehicleController.update);

module.exports = router;
