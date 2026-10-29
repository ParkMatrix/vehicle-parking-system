const request = require('supertest');
const jwt = require('jsonwebtoken');

const mockSlots = [];
const mockSessions = [];

jest.mock('../src/models/ParkingSlot', () => ({
  find: jest.fn((filter = {}) => ({
    sort: () => ({
      lean: async () =>
        mockSlots
          .filter((s) => !filter.status || s.status === filter.status)
          .sort((a, b) => a.slotId.localeCompare(b.slotId)),
    }),
  })),
  findOne: jest.fn(async (filter) =>
    mockSlots.find((s) => s.slotId === filter.slotId) || null
  ),
  create: jest.fn(async (doc) => {
    const slot = {
      _id: `slot${mockSlots.length + 1}`,
      slotId: doc.slotId.toUpperCase(),
      status: doc.status || 'Available',
    };
    mockSlots.push(slot);
    return slot;
  }),
  findById: jest.fn(async (id) => {
    const slot = mockSlots.find((s) => s._id === id);
    if (!slot) return null;

    return {
      ...slot,
      save: async function () {
        const index = mockSlots.findIndex((s) => s._id === this._id);
        if (index !== -1) {
          mockSlots[index] = {
            _id: this._id,
            slotId: this.slotId,
            status: this.status,
          };
        }
      },
    };
  }),
}));

jest.mock('../src/models/ParkingSession', () => ({
  exists: jest.fn(async (filter) =>
    mockSessions.some(
      (s) => s.slotId === filter.slotId && s.status === filter.status
    )
  ),
}));

process.env.JWT_SECRET = 'test-secret-slots';

const app = require('../src/app');

const adminToken = jwt.sign(
  { userId: 'admin1', role: 'admin' },
  process.env.JWT_SECRET
);

const staffToken = jwt.sign(
  { userId: 'staff1', role: 'staff' },
  process.env.JWT_SECRET
);

beforeEach(() => {
  mockSlots.length = 0;
  mockSessions.length = 0;
  jest.clearAllMocks();
});

// TC-F-005: View parking slots
describe('TC-F-005: View parking slots', () => {
  it('returns slots sorted by slot ID', async () => {
    mockSlots.push(
      { _id: 'slot1', slotId: 'B1', status: 'Available' },
      { _id: 'slot2', slotId: 'A1', status: 'Occupied' }
    );

    const res = await request(app)
      .get('/api/slots')
      .set('Authorization', `Bearer ${staffToken}`);

    expect(res.status).toBe(200);
    expect(res.body.map((s) => s.slotId)).toEqual(['A1', 'B1']);
  });

  it('filters slots by status', async () => {
    mockSlots.push(
      { _id: 'slot1', slotId: 'A1', status: 'Available' },
      { _id: 'slot2', slotId: 'A2', status: 'Occupied' }
    );

    const res = await request(app)
      .get('/api/slots?status=Available')
      .set('Authorization', `Bearer ${staffToken}`);

    expect(res.status).toBe(200);
    expect(res.body.map((s) => s.slotId)).toEqual(['A1']);
  });

  it('rejects unauthenticated requests', async () => {
    const res = await request(app).get('/api/slots');
    expect(res.status).toBe(401);
  });

  it('rejects an invalid status filter', async () => {
    const res = await request(app)
      .get('/api/slots?status=Broken')
      .set('Authorization', `Bearer ${staffToken}`);

    expect(res.status).toBe(400);
  });
});

// TC-F-006: Create parking slots
describe('TC-F-006: Create parking slots', () => {
  it('allows an admin to create a slot', async () => {
    const res = await request(app)
      .post('/api/slots')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ slotId: 'a1' });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      slotId: 'A1',
      status: 'Available',
    });
  });

  it('rejects duplicate slot IDs', async () => {
    mockSlots.push({
      _id: 'slot1',
      slotId: 'A1',
      status: 'Available',
    });

    const res = await request(app)
      .post('/api/slots')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ slotId: 'A1' });

    expect(res.status).toBe(409);
  });

  it('rejects staff creating a slot', async () => {
    const res = await request(app)
      .post('/api/slots')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ slotId: 'A2' });

    expect(res.status).toBe(403);
  });

  it('rejects a missing slot ID', async () => {
    const res = await request(app)
      .post('/api/slots')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({});

    expect(res.status).toBe(400);
  });
});

// TC-F-007: Update parking slot status
describe('TC-F-007: Update parking slot status', () => {
  it('allows an admin to update a slot status', async () => {
    mockSlots.push({
      _id: 'slot1',
      slotId: 'A1',
      status: 'Available',
    });

    const res = await request(app)
      .patch('/api/slots/slot1/status')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'Unavailable' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('Unavailable');
  });

  it('rejects an invalid status', async () => {
    mockSlots.push({
      _id: 'slot1',
      slotId: 'A1',
      status: 'Available',
    });

    const res = await request(app)
      .patch('/api/slots/slot1/status')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'Broken' });

    expect(res.status).toBe(400);
  });

  it('returns 404 for a nonexistent slot', async () => {
    const res = await request(app)
      .patch('/api/slots/missing/status')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'Occupied' });

    expect(res.status).toBe(404);
  });

  it('prevents releasing a slot used by an active session', async () => {
    mockSlots.push({
      _id: 'slot1',
      slotId: 'A1',
      status: 'Occupied',
    });
    mockSessions.push({ slotId: 'slot1', status: 'active' });

    const res = await request(app)
      .patch('/api/slots/slot1/status')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'Available' });

    expect(res.status).toBe(409);
  });
});
