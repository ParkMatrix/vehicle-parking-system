// OWNER: Preksha - #28 VPS-F-003, #29 VPS-F-004
const Vehicle = require('../models/Vehicle');

function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function toPublicVehicle(v) {
  return {
    id: String(v._id),
    registrationNumber: v.registrationNumber,
    ownerId: String(v.ownerId),
    make: v.make || null,
    model: v.model || null,
    color: v.color || null,
    createdAt: v.createdAt,
    updatedAt: v.updatedAt,
  };
}

// VPS-F-003: Register a vehicle for the logged-in owner.
async function registerVehicle({ registrationNumber, make, model, color } = {}, ownerId) {
  registrationNumber = typeof registrationNumber === 'string' ? registrationNumber.trim().toUpperCase() : '';
  if (!registrationNumber) throw httpError(400, 'Registration number is required.');

  if (await Vehicle.exists({ registrationNumber })) {
    throw httpError(409, 'A vehicle with this registration number already exists.');
  }

  const vehicle = await Vehicle.create({
    registrationNumber,
    ownerId,
    make: typeof make === 'string' ? make.trim() : undefined,
    model: typeof model === 'string' ? model.trim() : undefined,
    color: typeof color === 'string' ? color.trim() : undefined,
  });

  return toPublicVehicle(vehicle);
}

// VPS-F-004: List vehicles visible to the requester.
// - Owners see only their own vehicles.
// - Staff and Admin see all vehicles.
async function listVehicles(user) {
  const filter = user.role === 'owner' ? { ownerId: user.userId } : {};
  const vehicles = await Vehicle.find(filter).sort({ createdAt: -1 });
  return vehicles.map(toPublicVehicle);
}

// VPS-F-004: Update a vehicle's details (only the owner or an admin may update).
async function updateVehicle(vehicleId, updates, user) {
  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) throw httpError(404, 'Vehicle not found.');

  // Only the owner of the vehicle or an admin can update it.
  if (user.role !== 'admin' && String(vehicle.ownerId) !== user.userId) {
    throw httpError(403, 'You can only update your own vehicles.');
  }

  const allowed = ['registrationNumber', 'make', 'model', 'color'];
  for (const key of allowed) {
    if (updates[key] !== undefined) {
      vehicle[key] = typeof updates[key] === 'string' ? updates[key].trim() : updates[key];
    }
  }

  await vehicle.save();
  return toPublicVehicle(vehicle);
}

module.exports = { registerVehicle, listVehicles, updateVehicle, toPublicVehicle };
