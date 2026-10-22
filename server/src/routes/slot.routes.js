// OWNER: Siddesh - #31 VPS-F-005, #32 VPS-F-006, #33 VPS-F-007
// SAD 4.3.2:
//   GET   /api/slots             (Authenticated) -> view slot states; support ?status=Available for the entry picker
//   POST  /api/slots             (Admin)         -> create slot
//   PATCH /api/slots/:id/status  (Admin)         -> update slot status
const { Router } = require('express');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/rbac');
const router = Router();

// router.get('/', auth, slotController.list);
// router.post('/', auth, requireRole('admin'), slotController.create);
// router.patch('/:id/status', auth, requireRole('admin'), slotController.updateStatus);

module.exports = router;
