// SAD 4.2: ParkingSlot (slotId, status) -> collection "parkingSlots"
const mongoose = require('mongoose');

const SLOT_STATUS = ['Available', 'Occupied', 'Unavailable']; // VPS-F-006

const parkingSlotSchema = new mongoose.Schema(
  {
    slotId: { type: String, required: true, unique: true, uppercase: true, trim: true }, // VPS-F-005
    status: { type: String, enum: SLOT_STATUS, default: 'Available' },
  },
  { timestamps: true, collection: 'parkingSlots' }
);

module.exports = mongoose.model('ParkingSlot', parkingSlotSchema);
module.exports.SLOT_STATUS = SLOT_STATUS;
