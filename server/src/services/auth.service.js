// OWNER: Nishant - #24 VPS-F-001, #25 VPS-F-002, #26 VPS-SR-004
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const SALT_ROUNDS = 10;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

// Public shape of a user - never includes passwordHash (VPS-SR-004)
function toPublicUser(user) {
  return { id: String(user._id), name: user.name, email: user.email, phone: user.phone, role: user.role };
}

// VPS-F-001: create one account from valid data; reject invalid or duplicate data.
// Public registration always creates a Vehicle Owner. Staff/Admin accounts come from `npm run seed`.
async function register({ name, email, phone, password } = {}) {
  name = typeof name === 'string' ? name.trim() : '';
  email = typeof email === 'string' ? email.trim().toLowerCase() : '';

  if (!name) throw httpError(400, 'Name is required.');
  if (!EMAIL_RE.test(email)) throw httpError(400, 'A valid email is required.');
  if (typeof password !== 'string' || password.length < 6) {
    throw httpError(400, 'Password must be at least 6 characters.');
  }

  if (await User.exists({ email })) throw httpError(409, 'An account with this email already exists.');

  // VPS-SR-004: store only a one-way bcrypt hash, never the plain password
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await User.create({ name, email, phone, passwordHash, role: 'owner' });
  return toPublicUser(user);
}

// VPS-F-002: valid credentials -> JWT { userId, role }; invalid credentials -> 401.
async function login({ email, password } = {}) {
  email = typeof email === 'string' ? email.trim().toLowerCase() : '';
  if (!email || typeof password !== 'string' || !password) {
    throw httpError(400, 'Email and password are required.');
  }

  const user = await User.findOne({ email }).select('+passwordHash');
  const ok = user ? await bcrypt.compare(password, user.passwordHash) : false;
  if (!ok) throw httpError(401, 'Invalid email or password.'); // same message for unknown email and wrong password

  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not set in server/.env');
  const token = jwt.sign({ userId: String(user._id), role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });
  return { token, user: toPublicUser(user) };
}

module.exports = { register, login, toPublicUser, SALT_ROUNDS };
