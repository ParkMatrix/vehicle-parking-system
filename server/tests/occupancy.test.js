// Tests for #50 VPS-F-016 (TC-F-016): Admin occupancy and vehicle-tracking view
const request = require('supertest');
const jwt = require('jsonwebtoken');

let mockSlotCounts = [];
let mockSessions = [];
jest.mock('../src/models', () => ({
  ParkingSlot: { aggregate: jest.fn(async () => mockSlotCounts) },
  ParkingSession: {
    find: jest.fn(() => {
      const query = {
        sort: () => query,
        populate: () => query,
        lean: async () => mockSessions,
      };
      return query;
    }),
  },
}));

process.env.JWT_SECRET = 'test-secret';
const app = require('../src/app');
const token = (role) => `Bearer ${jwt.sign({ userId: 'u1', role }, 'test-secret')}`;

beforeEach(() => {
  mockSlotCounts = [
    { _id: 'Available', count: 3 },
    { _id: 'Occupied', count: 1 },
    { _id: 'Unavailable', count: 1 },
  ];
  mockSessions = [
    {
      _id: 's1',
      vehicleId: { registrationNumber: 'KA01AB1234', make: 'Honda', model: 'City' },
      slotId: { slotId: 'A1' },
      entryTime: new Date(Date.now() - 45 * 60000),
    },
  ];
});

describe('GET /api/admin/occupancy (TC-F-016)', () => {
  it('returns slot counts, occupancy rate and active vehicles for an admin', async () => {
    const res = await request(app).get('/api/admin/occupancy').set('Authorization', token('admin'));
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      totalSlots: 5,
      available: 3,
      occupied: 1,
      unavailable: 1,
      occupancyRate: 25, // 1 occupied of 4 usable slots
      activeVehicleCount: 1,
    });
    expect(res.body.activeVehicles[0]).toMatchObject({
      registrationNumber: 'KA01AB1234',
      vehicleDetails: 'Honda City',
      slotId: 'A1',
    });
    expect(res.body.activeVehicles[0].durationMinutes).toBeGreaterThanOrEqual(44);
  });

  it('handles an empty car park', async () => {
    mockSlotCounts = [];
    mockSessions = [];
    const res = await request(app).get('/api/admin/occupancy').set('Authorization', token('admin'));
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ totalSlots: 0, occupancyRate: 0, activeVehicleCount: 0, activeVehicles: [] });
  });

  it('rejects requests without a token (401)', async () => {
    const res = await request(app).get('/api/admin/occupancy');
    expect(res.status).toBe(401);
  });

  it.each(['owner', 'staff'])('rejects the %s role (403)', async (role) => {
    const res = await request(app).get('/api/admin/occupancy').set('Authorization', token(role));
    expect(res.status).toBe(403);
  });
});
