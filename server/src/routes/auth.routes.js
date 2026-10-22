// OWNER: Nishant - #24 VPS-F-001, #25 VPS-F-002, #26 VPS-SR-004
// SAD 4.3.2:
//   POST /api/auth/register  (Public) -> create account
//   POST /api/auth/login     (Public) -> returns JWT { userId, role }
const { Router } = require('express');
const router = Router();

// router.post('/register', authController.register);
// router.post('/login', authController.login);

module.exports = router;
