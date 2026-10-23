// OWNER: Nishant - #24 VPS-F-001, #25 VPS-F-002
const authService = require('../services/auth.service');

async function register(req, res) {
  const user = await authService.register(req.body);
  res.status(201).json({ user });
}

async function login(req, res) {
  const result = await authService.login(req.body);
  res.json(result);
}

module.exports = { register, login };
