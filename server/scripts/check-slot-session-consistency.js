require('dotenv').config({ quiet: true });

const mongoose = require('mongoose');
const { ParkingSlot, ParkingSession } = require('../src/models');

function validateSlotSessionConsistency(slots, activeSessions) {
  const issues = [];
  const slotsById = new Map(slots.map((slot) => [String(slot._id), slot]));
  const sessionsBySlot = new Map();
  const sessionsByVehicle = new Map();

  for (const session of activeSessions) {
    const slotId = String(session.slotId);
    const vehicleId = String(session.vehicleId);

    if (!slotsById.has(slotId)) {
      issues.push(`Active session ${session._id} references a missing slot ${slotId}`);
    } else if (slotsById.get(slotId).status !== 'Occupied') {
      issues.push(`Active session ${session._id} references a slot that is not Occupied`);
    }

    sessionsBySlot.set(slotId, (sessionsBySlot.get(slotId) || 0) + 1);
    sessionsByVehicle.set(vehicleId, (sessionsByVehicle.get(vehicleId) || 0) + 1);
  }

  for (const slot of slots) {
    const count = sessionsBySlot.get(String(slot._id)) || 0;

    if (slot.status === 'Occupied' && count === 0) {
      issues.push(`Occupied slot ${slot.slotId} has no active session`);
    }

    if (count > 1) {
      issues.push(`Slot ${slot.slotId} has ${count} active sessions`);
    }
  }

  for (const [vehicleId, count] of sessionsByVehicle) {
    if (count > 1) {
      issues.push(`Vehicle ${vehicleId} has ${count} active sessions`);
    }
  }

  return issues;
}

async function main() {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not set');
  }

  await mongoose.connect(process.env.MONGO_URI);

  const [slots, activeSessions] = await Promise.all([
    ParkingSlot.find().select('_id slotId status').lean(),
    ParkingSession.find({ status: 'active' })
      .select('_id vehicleId slotId status')
      .lean(),
  ]);

  const issues = validateSlotSessionConsistency(slots, activeSessions);

  if (issues.length === 0) {
    console.log('PASS: All parking slots and active sessions are consistent.');
  } else {
    console.error(`FAIL: Found ${issues.length} consistency issue(s):`);
    for (const issue of issues) console.error(`- ${issue}`);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main()
    .catch((error) => {
      console.error('Consistency check failed:', error.message);
      process.exitCode = 1;
    })
    .finally(() => mongoose.disconnect());
}

module.exports = { validateSlotSessionConsistency };
