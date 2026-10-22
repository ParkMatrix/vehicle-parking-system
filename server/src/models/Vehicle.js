// SAD 4.2: Vehicle (vehicleId, registrationNumber, ownerId) -> collection "vehicles"
const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema(
  {
    registrationNumber: { type: String, required: true, unique: true, uppercase: true, trim: true }, // VPS-F-003
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    make: { type: String, trim: true },
    model: { type: String, trim: true },
    color: { type: String, trim: true },
  },
  { timestamps: true, collection: 'vehicles' }
);

module.exports = mongoose.model('Vehicle', vehicleSchema);
