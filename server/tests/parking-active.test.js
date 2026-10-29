
const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../src/models', () => ({
  Vehicle: {
    findOne: jest.fn(),
  },
  ParkingSlot: {
    findById: jest.fn(),
  },
  ParkingSession: {
    findOne: jest.fn(),
  },
}));

const { Vehicle, ParkingSlot, ParkingSession } = require('../src/models');

jest.mock('../src/middleware/auth', () => (req, res, next) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ error: 'Authentication required' });

  try {
    req.user = require('jsonwebtoken').verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

const SECRET = 'test-secret-active-vehicle';
process.env.JWT_SECRET = SECRET;

const app = require('../src/app');

const staffToken = jwt.sign(
  { userId: 'staff1', role: 'staff' },
  SECRET
);

const ownerToken = jwt.sign(
  { userId: 'owner1', role: 'owner' },
  SECRET
);

describe('VPS-F-011: Search active vehicle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns the active session and slot for a registration number', async () => {
    const vehicle = {
      _id: 'vehicle1',
      registrationNumber: 'KA01AB1234',
    };
    const session = {
      vehicleId: 'vehicle1',
      slotId: 'slot1',
      status: 'active',
    };
    const slot = {
      _id: 'slot1',
      slotId: 'A-01',
      status: 'Occupied',
    };

    Vehicle.findOne.mockResolvedValue(vehicle);
    ParkingSession.findOne.mockResolvedValue(session);
    ParkingSlot.findById.mockResolvedValue(slot);

    const res = await request(app)
      .get('/api/parking/active/ka01ab1234')
      .set('Authorization', `Bearer ${staffToken}`);

    expect(res.status).toBe(200);
    expect(Vehicle.findOne).toHaveBeenCalledWith({
      registrationNumber: 'KA01AB1234',
    });
    expect(res.body.vehicle.registrationNumber).toBe('KA01AB1234');
    expect(res.body.session.status).toBe('active');
    expect(res.body.slot.slotId).toBe('A-01');
  });

  it('returns 404 when the vehicle does not exist', async () => {
    Vehicle.findOne.mockResolvedValue(null);

    const res = await request(app)
      .get('/api/parking/active/UNKNOWN')
      .set('Authorization', `Bearer ${staffToken}`);

    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/vehicle not found/i);
  });

  it('returns 404 when the vehicle has no active session', async () => {
    Vehicle.findOne.mockResolvedValue({
      _id: 'vehicle1',
      registrationNumber: 'KA01AB1234',
    });
    ParkingSession.findOne.mockResolvedValue(null);

    const res = await request(app)
      .get('/api/parking/active/KA01AB1234')
      .set('Authorization', `Bearer ${staffToken}`);

    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/no active parking session/i);
  });

  it('requires authentication', async () => {
    const res = await request(app).get(
      '/api/parking/active/KA01AB1234'
    );

    expect(res.status).toBe(401);
  });

  it('denies users without staff or admin role', async () => {
    const res = await request(app)
      .get('/api/parking/active/KA01AB1234')
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(res.status).toBe(403);
  });
});
