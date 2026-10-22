// SAD 4.2: User (userId, name, email, passwordHash, role) -> collection "users"
const mongoose = require('mongoose');

const ROLES = ['owner', 'staff', 'admin'];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    passwordHash: { type: String, required: true, select: false }, // VPS-SR-004: never returned by default
    role: { type: String, enum: ROLES, default: 'owner' },
  },
  { timestamps: true, collection: 'users' }
);

module.exports = mongoose.model('User', userSchema);
module.exports.ROLES = ROLES;
