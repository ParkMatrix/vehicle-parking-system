// Tests for #28 VPS-F-003 (TC-F-003): Register vehicle
// Tests for #29 VPS-F-004 (TC-F-004): View and update vehicle details
// Tests for #46 VPS-F-015 (TC-F-015): Vehicle parking history
const request = require('supertest');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Helper: generate deterministic ObjectId strings for mock vehicles.
function mockObjectId(n) {
  return new mongoose.Types.ObjectId(n.toString().padStart(24, '0')).toString();
}

// Mock User model
const users = [];
jest.mock('../src/models/User', () => ({
  exists: jest.fn(async ({ email }) => users.some((u) => u.email === email)),
  create: jest.fn(async (doc) => {
    const user = { _id: `id${users.length + 1}`, ...doc };
    users.push(user);
    return user;
  }),
  findOne: jest.fn(({ email }) => ({
    select: async () => users.find((u) => u.email === email) || null,
  })),
}));

// Mock Vehicle model
const vehicles = [];
jest.mock('../src/models/Vehicle', () => {
  const mock = {
    exists: jest.fn(async ({ registrationNumber }) =>
      vehicles.some((v) => v.registrationNumber === registrationNumber)
    ),
    create: jest.fn(async (doc) => {
      const vehicle = {
        _id: mockObjectId(vehicles.length + 1),
        ...doc,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      vehicles.push(vehicle);
      return vehicle;
    }),
    find: jest.fn((filter) => ({
      sort: () => {
        if (filter && filter.ownerId) return vehicles.filter((v) => String(v.ownerId) === String(filter.ownerId));
        return [...vehicles];
      },
    })),
    findById: jest.fn(async (id) => {
      const v = vehicles.find((v) => String(v._id) === id);
      if (!v) return null;
      const doc = { ...v };
      doc.save = async function () {
        const idx = vehicles.findIndex((x) => x._id === this._id);
        if (idx !== -1) {
          for (const key of Object.keys(this)) {
            if (key !== 'save') vehicles[idx][key] = this[key];
          }
        }
      };
      return doc;
    }),
  };
  return mock;
});

// Mock ParkingSession model
const parkingSessions = [];
jest.mock('../src/models/ParkingSession', () => {
  const query = (filter) => {
    const exec = async () => {
      let results = [...parkingSessions];
      if (filter && filter.vehicleId) {
        results = results.filter((s) => String(s.vehicleId) === String(filter.vehicleId));
      }
      results.sort((a, b) => new Date(b.entryTime) - new Date(a.entryTime));
      return results;
    };
    return {
      sort: () => query(filter),
      populate: () => query(filter),
      then: (resolve, reject) => exec().then(resolve, reject),
    };
  };
  return {
    find: jest.fn((filter) => query(filter)),
  };
});

const SECRET = 'test-secret-vehicle';
process.env.JWT_SECRET = SECRET;

const app = require('../src/app');

function makeToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: '1h' });
}

const ownerToken = makeToken({ userId: 'owner1', role: 'owner' });
const owner2Token = makeToken({ userId: 'owner2', role: 'owner' });
const staffToken = makeToken({ userId: 'staff1', role: 'staff' });
const adminToken = makeToken({ userId: 'admin1', role: 'admin' });

// First vehicle created in each test gets this id (vehicles array starts empty in beforeEach).
const VID1 = mockObjectId(1);
const VID2 = mockObjectId(2);

beforeEach(() => {
  users.length = 0;
  vehicles.length = 0;
  parkingSessions.length = 0;
});

// ---------- TC-F-003: Register vehicle (#28) ----------

describe('POST /api/vehicles (#28 VPS-F-003)', () => {
  it('registers a vehicle with a valid registration number', async () => {
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ registrationNumber: 'KA01AB1234', make: 'Honda', model: 'City', color: 'White' });
    expect(res.status).toBe(201);
    expect(res.body.vehicle).toMatchObject({
      registrationNumber: 'KA01AB1234',
      ownerId: 'owner1',
      make: 'Honda',
      model: 'City',
      color: 'White',
    });
    expect(res.body.vehicle.id).toBeDefined();
  });

  it('rejects a missing registration number with 400', async () => {
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ make: 'Honda' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/[Rr]egistration/);
  });

  it('rejects a duplicate registration number with 409', async () => {
    await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ registrationNumber: 'KA01AB1234' });
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ registrationNumber: 'ka01ab1234' }); // case-insensitive
    expect(res.status).toBe(409);
  });

  it('requires authentication', async () => {
    const res = await request(app).post('/api/vehicles').send({ registrationNumber: 'KA01AB1234' });
    expect(res.status).toBe(401);
  });

  it('requires owner role (rejects staff)', async () => {
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ registrationNumber: 'KA01AB1234' });
    expect(res.status).toBe(403);
  });
});

// ---------- TC-F-004: View and update vehicle details (#29) ----------

describe('GET /api/vehicles (#29 VPS-F-004)', () => {
  beforeEach(async () => {
    // Register two vehicles for different owners
    await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ registrationNumber: 'KA01AB1234' });
    await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${owner2Token}`)
      .send({ registrationNumber: 'KA02CD5678' });
  });

  it('owner sees only their own vehicles', async () => {
    const res = await request(app).get('/api/vehicles').set('Authorization', `Bearer ${ownerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.vehicles).toHaveLength(1);
    expect(res.body.vehicles[0].registrationNumber).toBe('KA01AB1234');
  });

  it('staff sees all vehicles', async () => {
    const res = await request(app).get('/api/vehicles').set('Authorization', `Bearer ${staffToken}`);
    expect(res.status).toBe(200);
    expect(res.body.vehicles).toHaveLength(2);
  });

  it('admin sees all vehicles', async () => {
    const res = await request(app).get('/api/vehicles').set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.vehicles).toHaveLength(2);
  });
});

describe('PATCH /api/vehicles/:id (#29 VPS-F-004)', () => {
  beforeEach(async () => {
    await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ registrationNumber: 'KA01AB1234', color: 'White' });
  });

  it('owner can update their own vehicle', async () => {
    const res = await request(app)
      .patch(`/api/vehicles/${VID1}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ color: 'Blue' });
    expect(res.status).toBe(200);
    expect(res.body.vehicle.color).toBe('Blue');
  });

  it('another owner cannot update a different owner\'s vehicle', async () => {
    const res = await request(app)
      .patch(`/api/vehicles/${VID1}`)
      .set('Authorization', `Bearer ${owner2Token}`)
      .send({ color: 'Red' });
    expect(res.status).toBe(403);
  });

  it('admin can update any vehicle', async () => {
    const res = await request(app)
      .patch(`/api/vehicles/${VID1}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ color: 'Green' });
    expect(res.status).toBe(200);
    expect(res.body.vehicle.color).toBe('Green');
  });

  it('returns 404 for a non-existent vehicle', async () => {
    const res = await request(app)
      .patch('/api/vehicles/nonexistent')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ color: 'Red' });
    expect(res.status).toBe(404);
  });

  // Sprint-1 follow-up: empty PATCH body → 400
  it('returns 400 when PATCH body is empty', async () => {
    const res = await request(app)
      .patch(`/api/vehicles/${VID1}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/updatable field/i);
  });

  // Sprint-1 follow-up: invalid (non-ObjectId) vehicle id → 404
  it('returns 404 for an invalid vehicle id format', async () => {
    const res = await request(app)
      .patch('/api/vehicles/not-a-valid-id')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ color: 'Red' });
    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/not found/i);
  });
});

// ---------- TC-F-015: Parking history (#46 VPS-F-015) ----------

describe('GET /api/vehicles/:id/history (#46 VPS-F-015)', () => {
  beforeEach(async () => {
    // Register owner1 vehicle (VID1)
    await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ registrationNumber: 'KA01AB1234', color: 'White' });

    // Register owner2 vehicle (VID2)
    await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${owner2Token}`)
      .send({ registrationNumber: 'KA02CD5678', color: 'Black' });

    // Add mock sessions for VID1
    parkingSessions.push(
      {
        _id: mockObjectId(101),
        vehicleId: VID1,
        slotId: { _id: mockObjectId(50), slotId: 'A-01' },
        entryTime: new Date(Date.now() - 7200000), // 2h ago
        exitTime: new Date(Date.now() - 3600000),  // 1h ago
        status: 'complete',
      },
      {
        _id: mockObjectId(102),
        vehicleId: VID1,
        slotId: { _id: mockObjectId(51), slotId: 'B-02' },
        entryTime: new Date(Date.now() - 1800000), // 30m ago
        exitTime: null,
        status: 'active',
      }
    );

    // Add mock session for VID2
    parkingSessions.push({
      _id: mockObjectId(103),
      vehicleId: VID2,
      slotId: { _id: mockObjectId(52), slotId: 'C-03' },
      entryTime: new Date(Date.now() - 600000),
      exitTime: null,
      status: 'active',
    });
  });

  it('owner can view history of their own vehicle with entry, exit, and slot data', async () => {
    const res = await request(app)
      .get(`/api/vehicles/${VID1}/history`)
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.history).toHaveLength(2);

    // Sorted by entryTime descending: most recent first
    const [latest, older] = res.body.history;
    expect(latest.sessionId).toBe(mockObjectId(102));
    expect(latest.status).toBe('active');
    expect(latest.exitTime).toBeNull();
    expect(latest.slot).toMatchObject({ slotId: 'B-02' });

    expect(older.sessionId).toBe(mockObjectId(101));
    expect(older.status).toBe('complete');
    expect(older.exitTime).toBeDefined();
    expect(older.slot).toMatchObject({ slotId: 'A-01' });
  });

  it('owner cannot view another owner\'s vehicle history (denied 403)', async () => {
    // Owner2 tries to access Owner1's vehicle history
    const res = await request(app)
      .get(`/api/vehicles/${VID1}/history`)
      .set('Authorization', `Bearer ${owner2Token}`);

    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/own vehicles/i);
  });

  it('staff can view history of any vehicle', async () => {
    const res = await request(app)
      .get(`/api/vehicles/${VID1}/history`)
      .set('Authorization', `Bearer ${staffToken}`);

    expect(res.status).toBe(200);
    expect(res.body.history).toHaveLength(2);
  });

  it('admin can view history of any vehicle', async () => {
    const res = await request(app)
      .get(`/api/vehicles/${VID1}/history`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.history).toHaveLength(2);
  });

  it('returns 404 for a non-existent vehicle', async () => {
    const res = await request(app)
      .get(`/api/vehicles/${mockObjectId(999)}/history`)
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/not found/i);
  });

  it('returns 404 for an invalid vehicle id format', async () => {
    const res = await request(app)
      .get('/api/vehicles/invalid-id/history')
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/not found/i);
  });

  it('requires authentication (returns 401 when unauthenticated)', async () => {
    const res = await request(app).get(`/api/vehicles/${VID1}/history`);
    expect(res.status).toBe(401);
  });
});
