// OWNER: Salasha - #34 VPS-F-008, #35 VPS-F-009, #36 VPS-F-010, #38 VPS-F-013, #39 VPS-F-014
// SAD 4.3.2:
//   POST /api/parking/entry  (Staff) -> record entry + allocate slot (session create and slot->Occupied must be atomic)
//   POST /api/parking/exit   (Staff) -> record exit + release slot  (session complete and slot->Available must be atomic)
// Sprint 2: GET /api/parking/active/:registration (Siddesh, #42)
const { Router } = require('express');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/rbac');
const router = Router();

// router.post('/entry', auth, requireRole('staff', 'admin'), parkingController.entry);
// router.post('/exit', auth, requireRole('staff', 'admin'), parkingController.exit);

module.exports = router;
