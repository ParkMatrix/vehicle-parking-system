
const { Router } = require('express');
const { Vehicle, ParkingSlot, ParkingSession } = require('../models');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/rbac');

const router = Router();

// VPS-F-009 and VPS-F-010: Record vehicle entry and occupy a slot.
router.post('/entry', auth, requireRole('staff', 'admin'), async (req, res, next) => {
  const { registrationNumber, slotId } = req.body;

  try {
    if (!registrationNumber || !slotId) {
      return res.status(400).json({
        error: 'Registration number and slot ID are required',
      });
    }

    const vehicle = await Vehicle.findOne({
      registrationNumber: registrationNumber.trim().toUpperCase(),
    });

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    const activeSession = await ParkingSession.findOne({
      vehicleId: vehicle._id,
      status: 'active',
    });

    if (activeSession) {
      return res.status(409).json({
        error: 'Vehicle already has an active parking session',
      });
    }

    // Reserve the slot first.
    const slot = await ParkingSlot.findOneAndUpdate(
      { _id: slotId, status: 'Available' },
      { $set: { status: 'Occupied' } },
      { new: true }
    );

    if (!slot) {
      return res.status(409).json({ error: 'Slot not available' });
    }

    let createdSession;

    try {
      createdSession = await ParkingSession.create({
        vehicleId: vehicle._id,
        slotId: slot._id,
        entryTime: new Date(),
        status: 'active',
        ...(req.user?.userId ? { recordedBy: req.user.userId } : {}),
      });
    } catch (error) {
      // Roll back slot status if session creation fails.
      await ParkingSlot.updateOne(
        { _id: slot._id, status: 'Occupied' },
        { $set: { status: 'Available' } }
      );
      throw error;
    }

    return res.status(201).json({
      message: 'Vehicle entry recorded successfully',
      session: createdSession,
      slot,
    });
  } catch (error) {
    return next(error);
  }
});

// VPS-F-013 and VPS-F-014: Record exit and release the slot.
router.post('/exit', auth, requireRole('staff', 'admin'), async (req, res, next) => {
  const { registrationNumber } = req.body;

  try {
    if (!registrationNumber) {
      return res.status(400).json({
        error: 'Registration number is required',
      });
    }

    const vehicle = await Vehicle.findOne({
      registrationNumber: registrationNumber.trim().toUpperCase(),
    });

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    const completedSession = await ParkingSession.findOneAndUpdate(
      { vehicleId: vehicle._id, status: 'active' },
      { $set: { status: 'complete', exitTime: new Date() } },
      { new: true }
    );

    if (!completedSession) {
      return res.status(404).json({ error: 'No active session found' });
    }

    const slot = await ParkingSlot.findOneAndUpdate(
      { _id: completedSession.slotId, status: 'Occupied' },
      { $set: { status: 'Available' } },
      { new: true }
    );

    if (!slot) {
      return res.status(409).json({
        error: 'Session completed, but the parking slot could not be released',
      });
    }

    return res.status(200).json({
      message: 'Vehicle exit recorded successfully',
      session: completedSession,
      slot,
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
