
const { Router } = require('express');
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/rbac');
const {
  Vehicle,
  ParkingSlot,
  ParkingSession,
  AuditLog,
} = require('../models');

const router = Router();

// VPS-F-009 and VPS-F-010: Record vehicle entry and occupy a slot.
router.post('/entry', auth, requireRole('staff', 'admin'), async (req, res, next) => {
  const { registrationNumber, slotId } = req.body;
  const dbSession = await mongoose.startSession();

  try {
    if (!registrationNumber || !slotId) {
      return res.status(400).json({
        error: 'Registration number and slot ID are required',
      });
    }

    let result;

    await dbSession.withTransaction(async () => {
      const vehicle = await Vehicle.findOne({
        registrationNumber: registrationNumber.trim().toUpperCase(),
      }).session(dbSession);

      if (!vehicle) {
        throw Object.assign(new Error('Vehicle not found'), { status: 404 });
      }

      const slot = await ParkingSlot.findById(slotId).session(dbSession);

      if (!slot) {
        throw Object.assign(new Error('Parking slot not found'), { status: 404 });
      }

      if (slot.status !== 'Available') {
        throw Object.assign(new Error('Parking slot is not available'), {
          status: 409,
        });
      }

      const activeSession = await ParkingSession.findOne({
        vehicleId: vehicle._id,
        status: 'active',
      }).session(dbSession);

      if (activeSession) {
        throw Object.assign(new Error('Vehicle already has an active session'), {
          status: 409,
        });
      }

      const updatedSlot = await ParkingSlot.findOneAndUpdate(
        { _id: slot._id, status: 'Available' },
        { $set: { status: 'Occupied' } },
        { new: true, session: dbSession }
      );

      if (!updatedSlot) {
        throw Object.assign(new Error('Parking slot is no longer available'), {
          status: 409,
        });
      }

      const [createdSession] = await ParkingSession.create(
        [{
          vehicleId: vehicle._id,
          slotId: slot._id,
          entryTime: new Date(),
          status: 'active',
          recordedBy: req.user?.userId,
        }],
        { session: dbSession }
      );

      await AuditLog.create(
        [{
          actorId: req.user?.userId || null,
          action: 'vehicle_entry',
          result: 'success',
          details: {
            registrationNumber: vehicle.registrationNumber,
            slotId: slot.slotId,
            parkingSessionId: createdSession._id,
          },
        }],
        { session: dbSession }
      );

      result = {
        message: 'Vehicle entry recorded successfully',
        session: createdSession,
        slot: updatedSlot,
      };
    });

    return res.status(201).json(result);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    return next(error);
  } finally {
    await dbSession.endSession();
  }
});

// VPS-F-013 and VPS-F-014: Record vehicle exit and free its slot.
router.post('/exit', auth, requireRole('staff', 'admin'), async (req, res, next) => {
  const { registrationNumber } = req.body;
  const dbSession = await mongoose.startSession();

  try {
    if (!registrationNumber) {
      return res.status(400).json({
        error: 'Registration number is required',
      });
    }

    let result;

    await dbSession.withTransaction(async () => {
      const vehicle = await Vehicle.findOne({
        registrationNumber: registrationNumber.trim().toUpperCase(),
      }).session(dbSession);

      if (!vehicle) {
        throw Object.assign(new Error('Vehicle not found'), { status: 404 });
      }

      const activeSession = await ParkingSession.findOne({
        vehicleId: vehicle._id,
        status: 'active',
      }).session(dbSession);

      if (!activeSession) {
        throw Object.assign(new Error('No active parking session found'), {
          status: 404,
        });
      }

      const completedSession = await ParkingSession.findOneAndUpdate(
        { _id: activeSession._id, status: 'active' },
        { $set: { status: 'complete', exitTime: new Date() } },
        { new: true, session: dbSession }
      );

      if (!completedSession) {
        throw Object.assign(new Error('Parking session is already complete'), {
          status: 409,
        });
      }

      const slot = await ParkingSlot.findOneAndUpdate(
        { _id: activeSession.slotId, status: 'Occupied' },
        { $set: { status: 'Available' } },
        { new: true, session: dbSession }
      );

      if (!slot) {
        throw Object.assign(new Error('Occupied parking slot was not found'), {
          status: 409,
        });
      }

      await AuditLog.create(
        [{
          actorId: req.user?.userId || null,
          action: 'vehicle_exit',
          result: 'success',
          details: {
            registrationNumber: vehicle.registrationNumber,
            slotId: slot.slotId,
            parkingSessionId: completedSession._id,
          },
        }],
        { session: dbSession }
      );

      result = {
        message: 'Vehicle exit recorded successfully',
        session: completedSession,
        slot,
      };
    });

    return res.status(200).json(result);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    return next(error);
  } finally {
    await dbSession.endSession();
  }
});

module.exports = router;
