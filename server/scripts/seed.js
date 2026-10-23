// Creates (or resets) one Staff and one Admin account for testing and the demo.
// Usage (from server/):  npm run seed
// Logins: admin@vps.local / admin123   staff@vps.local / staff123   (change in .env with SEED_* vars)
require('dotenv').config({ quiet: true });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');
const { SALT_ROUNDS } = require('../src/services/auth.service');

const accounts = [
  {
    name: 'Parking Admin',
    email: process.env.SEED_ADMIN_EMAIL || 'admin@vps.local',
    password: process.env.SEED_ADMIN_PASSWORD || 'admin123',
    role: 'admin',
  },
  {
    name: 'Parking Staff',
    email: process.env.SEED_STAFF_EMAIL || 'staff@vps.local',
    password: process.env.SEED_STAFF_PASSWORD || 'staff123',
    role: 'staff',
  },
];

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  for (const a of accounts) {
    const passwordHash = await bcrypt.hash(a.password, SALT_ROUNDS);
    await User.findOneAndUpdate(
      { email: a.email },
      { name: a.name, email: a.email, passwordHash, role: a.role },
      { upsert: true, setDefaultsOnInsert: true }
    );
    console.log(`${a.role.padEnd(5)}  ${a.email} / ${a.password}`);
  }
  await mongoose.disconnect();
})().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
