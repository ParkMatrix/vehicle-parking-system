// SAD 4.2: ParkingSession (sessionId, vehicleId, slotId, entryTime, exitTime, status) -> "parkingSessions"
const mongoose = require('mongoose');

const SESSION_STATUS = ['active', 'complete'];

const parkingSessionSchema = new mongoose.Schema(
  {
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    slotId: { type: mongoose.Schema.Types.ObjectId, ref: 'ParkingSlot', required: true },
    entryTime: { type: Date, default: Date.now }, // VPS-F-009
    exitTime: { type: Date, default: null },      // VPS-F-013
    status: { type: String, enum: SESSION_STATUS, default: 'active' },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, collection: 'parkingSessions' }
);

// VPS-F-018 (#37, Sprint 2 - Salasha): add the "one active session per vehicle" unique partial index here.

module.exports = mongoose.model('ParkingSession', parkingSessionSchema);
module.exports.SESSION_STATUS = SESSION_STATUS;
