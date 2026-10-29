
const { ParkingSlot, ParkingSession } = require('../models');
const auditService = require('../services/audit.service');

const SLOT_STATUS = ['Available', 'Occupied', 'Unavailable'];

// GET /api/slots
async function list(req, res, next) {
  try {
    const filter = {};

    if (req.query.status) {
      if (!SLOT_STATUS.includes(req.query.status)) {
        return res.status(400).json({ error: 'Invalid slot status' });
      }
      filter.status = req.query.status;
    }

    const slots = await ParkingSlot.find(filter).sort({ slotId: 1 }).lean();
    return res.json(slots);
  } catch (err) {
    next(err);
  }
}

// POST /api/slots
async function create(req, res, next) {
  try {
    const slotId =
      typeof req.body.slotId === 'string' ? req.body.slotId.trim() : '';

    if (!slotId) {
      return res.status(400).json({ error: 'Slot ID is required' });
    }

    const status = req.body.status || 'Available';

    if (!SLOT_STATUS.includes(status)) {
      return res.status(400).json({ error: 'Invalid slot status' });
    }

    const existing = await ParkingSlot.findOne({
      slotId: slotId.toUpperCase(),
    });

    if (existing) {
      return res.status(409).json({ error: 'Slot ID already exists' });
    }

    const slot = await ParkingSlot.create({ slotId, status });
    return res.status(201).json(slot);
  } catch (err) {
    // Also handles duplicate IDs created by simultaneous requests.
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Slot ID already exists' });
    }
    next(err);
  }
}

// PATCH /api/slots/:id/status
async function updateStatus(req, res, next) {
  try {
    const { status } = req.body;

    if (!SLOT_STATUS.includes(status)) {
      return res.status(400).json({ error: 'Invalid slot status' });
    }

    const slot = await ParkingSlot.findById(req.params.id);

    if (!slot) {
      return res.status(404).json({ error: 'Slot not found' });
    }

    if (status !== 'Occupied') {
      const activeSession = await ParkingSession.exists({
        slotId: slot._id,
        status: 'active',
      });

      if (activeSession) {
        return res.status(409).json({
          error: 'Cannot change this slot while an active parking session uses it',
        });
      }
    }

    const previousStatus = slot.status;
    slot.status = status;
    await slot.save();

    await auditService.recordAudit({
      actorId: req.user?.userId,
      action: 'SLOT_STATUS_UPDATE',
      result: 'success',
      details: { slotId: slot.slotId, previousStatus, newStatus: status },
    });

    return res.json(slot);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create, updateStatus };
