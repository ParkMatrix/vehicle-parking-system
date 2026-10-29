// OWNER: Preksha - #28 VPS-F-003, #29 VPS-F-004, #46 VPS-F-015
const mongoose = require('mongoose');
const Vehicle = require('../models/Vehicle');
const ParkingSession = require('../models/ParkingSession');

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
  // Sprint-1 follow-up: reject empty PATCH body (no updatable fields supplied).
  const allowed = ['registrationNumber', 'make', 'model', 'color'];
  const hasUpdate = updates && allowed.some((key) => updates[key] !== undefined);
  if (!hasUpdate) {
    throw httpError(400, 'Request body must contain at least one updatable field (registrationNumber, make, model, color).');
  }

  // Sprint-1 follow-up: invalid (non-ObjectId) vehicle id → 404 instead of 500 CastError.
  if (!mongoose.Types.ObjectId.isValid(vehicleId)) {
    throw httpError(404, 'Vehicle not found.');
  }

  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) throw httpError(404, 'Vehicle not found.');

  // Only the owner of the vehicle or an admin can update it.
  if (user.role !== 'admin' && String(vehicle.ownerId) !== user.userId) {
    throw httpError(403, 'You can only update your own vehicles.');
  }

  for (const key of allowed) {
    if (updates[key] !== undefined) {
      vehicle[key] = typeof updates[key] === 'string' ? updates[key].trim() : updates[key];
    }
  }

  await vehicle.save();
  return toPublicVehicle(vehicle);
}

// VPS-F-015 (#46): Return parking history for a vehicle.
// Owners may only view their own vehicles' history; staff/admin may view any.
async function getHistory(vehicleId, user) {
  if (!mongoose.Types.ObjectId.isValid(vehicleId)) {
    throw httpError(404, 'Vehicle not found.');
  }

  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) throw httpError(404, 'Vehicle not found.');

  // Authorization: owners can only access their own vehicles.
  if (user.role === 'owner' && String(vehicle.ownerId) !== user.userId) {
    throw httpError(403, 'You can only view history for your own vehicles.');
  }

  const sessions = await ParkingSession.find({ vehicleId: vehicle._id })
    .sort({ entryTime: -1 })
    .populate('slotId', 'slotId');

  return sessions.map((s) => ({
    sessionId: String(s._id),
    entryTime: s.entryTime,
    exitTime: s.exitTime || null,
    status: s.status,
    slot: s.slotId ? { id: String(s.slotId._id), slotId: s.slotId.slotId } : null,
  }));
}

// VPS-F-012: Get the current parking slot for a vehicle.
async function getCurrentSlot(vehicleId, user) {
  if (!mongoose.Types.ObjectId.isValid(vehicleId)) {
    throw httpError(404, 'Vehicle not found.');
  }

  const vehicle = await Vehicle.findById(vehicleId);

  if (!vehicle) {
    throw httpError(404, 'Vehicle not found.');
  }

  // Owners can access only their own vehicles.
  if (
    user.role === 'owner' &&
    String(vehicle.ownerId) !== user.userId
  ) {
    throw httpError(403, 'You can only view your own vehicle.');
  }

  const session = await ParkingSession.findOne({
    vehicleId: vehicle._id,
    status: 'active',
  }).populate('slotId', 'slotId status');

  if (!session) {
    return null;
  }

  return {
    sessionId: String(session._id),
    entryTime: session.entryTime,
    slot: session.slotId
      ? {
          id: String(session.slotId._id),
          slotId: session.slotId.slotId,
          status: session.slotId.status,
        }
      : null,
  };
}
module.exports = {
  registerVehicle,
  listVehicles,
  updateVehicle,
  getHistory,
  getCurrentSlot,
  toPublicVehicle,
};