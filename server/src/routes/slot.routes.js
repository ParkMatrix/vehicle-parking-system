const { Router } = require('express');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/rbac');
const slotController = require('../controllers/slot.controller');

const router = Router();

router.get('/', auth, slotController.list);
router.post('/', auth, requireRole('admin'), slotController.create);
router.patch('/:id/status', auth, requireRole('admin'), slotController.updateStatus);

module.exports = router;
