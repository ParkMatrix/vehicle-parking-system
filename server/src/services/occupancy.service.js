// OWNER: Nishant - #50 VPS-F-016 Admin occupancy dashboard
const { ParkingSlot, ParkingSession } = require('../models');

// Current occupancy summary + the list of vehicles that are parked right now.
async function getOccupancy(now = new Date()) {
  const [statusCounts, activeSessions] = await Promise.all([
    ParkingSlot.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    ParkingSession.find({ status: 'active' })
      .sort({ entryTime: 1 })
      .populate('vehicleId', 'registrationNumber make model color')
      .populate('slotId', 'slotId')
      .lean(),
  ]);

  const counts = { Available: 0, Occupied: 0, Unavailable: 0 };
  for (const row of statusCounts) {
    if (row._id in counts) counts[row._id] = row.count;
  }

  const totalSlots = counts.Available + counts.Occupied + counts.Unavailable;
  const usableSlots = counts.Available + counts.Occupied; // Unavailable slots cannot be used
  const occupancyRate = usableSlots === 0 ? 0 : Math.round((counts.Occupied / usableSlots) * 100);

  const activeVehicles = activeSessions.map((s) => ({
    sessionId: String(s._id),
    registrationNumber: s.vehicleId?.registrationNumber || 'Unknown vehicle',
    vehicleDetails: [s.vehicleId?.make, s.vehicleId?.model, s.vehicleId?.color].filter(Boolean).join(' ') || null,
    slotId: s.slotId?.slotId || 'Unknown slot',
    entryTime: s.entryTime,
    durationMinutes: Math.max(0, Math.floor((now - new Date(s.entryTime)) / 60000)),
  }));

  return {
    totalSlots,
    available: counts.Available,
    occupied: counts.Occupied,
    unavailable: counts.Unavailable,
    occupancyRate,
    activeVehicleCount: activeVehicles.length,
    activeVehicles,
    generatedAt: now,
  };
}

module.exports = { getOccupancy };
