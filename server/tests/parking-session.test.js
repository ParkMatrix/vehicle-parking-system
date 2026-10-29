
const mongoose = require('mongoose');
const ParkingSession = require('../src/models/ParkingSession');

describe('ParkingSession unique active session index (Issue #37)', () => {
  it('defines a unique partial index on vehicleId for active sessions', () => {
    const indexes = ParkingSession.schema.indexes();

    const activeSessionIndex = indexes.find(
      ([fields, options]) =>
        fields.vehicleId === 1 &&
        options.unique === true &&
        options.name === 'unique_active_session_per_vehicle'
    );

    expect(activeSessionIndex).toBeDefined();
    expect(activeSessionIndex[1].partialFilterExpression).toEqual({
      status: 'active',
    });
  });

  it('allows completed sessions in the schema status enum', () => {
    const statusPath = ParkingSession.schema.path('status');

    expect(statusPath.enumValues).toContain('active');
    expect(statusPath.enumValues).toContain('complete');
  });

  it('requires vehicleId and slotId', () => {
    const session = new ParkingSession({
      status: 'active',
    });

    const error = session.validateSync();

    expect(error.errors.vehicleId).toBeDefined();
    expect(error.errors.slotId).toBeDefined();
  });
});
