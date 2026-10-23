// Tests for #28 VPS-F-003 (TC-F-003): Register vehicle
// Tests for #29 VPS-F-004 (TC-F-004): View and update vehicle details
const request = require('supertest');
const jwt = require('jsonwebtoken');

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
        _id: `vid${vehicles.length + 1}`,
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

beforeEach(() => {
  users.length = 0;
  vehicles.length = 0;
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
      .patch('/api/vehicles/vid1')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ color: 'Blue' });
    expect(res.status).toBe(200);
    expect(res.body.vehicle.color).toBe('Blue');
  });

  it('another owner cannot update a different owner\'s vehicle', async () => {
    const res = await request(app)
      .patch('/api/vehicles/vid1')
      .set('Authorization', `Bearer ${owner2Token}`)
      .send({ color: 'Red' });
    expect(res.status).toBe(403);
  });

  it('admin can update any vehicle', async () => {
    const res = await request(app)
      .patch('/api/vehicles/vid1')
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
});
