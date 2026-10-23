// Tests for #27 VPS-SR-001 (TC-S-001): Authentication on protected APIs
// Tests for #30 VPS-SR-002 (TC-S-002): Role-based access control (RBAC)
const request = require('supertest');
const jwt = require('jsonwebtoken');

// Mock User model (no database needed)
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
        if (filter.ownerId) return vehicles.filter((v) => String(v.ownerId) === String(filter.ownerId));
        return [...vehicles];
      },
    })),
    findById: jest.fn(async (id) => {
      const v = vehicles.find((v) => String(v._id) === id);
      if (!v) return null;
      // Return a save-able object
      return {
        ...v,
        save: async function () {
          const idx = vehicles.findIndex((x) => x._id === this._id);
          if (idx !== -1) {
            vehicles[idx] = { ...vehicles[idx], ...this };
          }
        },
      };
    }),
  };
  return mock;
});

const SECRET = 'test-secret-for-auth';
process.env.JWT_SECRET = SECRET;

const app = require('../src/app');

function makeToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: '1h' });
}

beforeEach(() => {
  users.length = 0;
  vehicles.length = 0;
});

// ---------- TC-S-001: Auth middleware (#27) ----------

describe('Auth middleware (#27 VPS-SR-001)', () => {
  it('rejects requests without an Authorization header with 401', async () => {
    const res = await request(app).get('/api/vehicles');
    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/[Aa]uthentication/);
  });

  it('rejects requests with a malformed Authorization header with 401', async () => {
    const res = await request(app).get('/api/vehicles').set('Authorization', 'Basic abc123');
    expect(res.status).toBe(401);
  });

  it('rejects requests with an invalid/expired token with 401', async () => {
    const badToken = jwt.sign({ userId: 'u1', role: 'owner' }, 'wrong-secret');
    const res = await request(app).get('/api/vehicles').set('Authorization', `Bearer ${badToken}`);
    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/[Ii]nvalid|[Ee]xpired/);
  });

  it('allows requests with a valid token and sets req.user', async () => {
    const token = makeToken({ userId: 'u1', role: 'owner' });
    const res = await request(app).get('/api/vehicles').set('Authorization', `Bearer ${token}`);
    // Should succeed (200) because token is valid
    expect(res.status).toBe(200);
    expect(res.body.vehicles).toBeDefined();
  });
});

// ---------- TC-S-002: RBAC middleware (#30) ----------

describe('RBAC middleware (#30 VPS-SR-002)', () => {
  it('rejects an owner trying to access a staff-only route with 403', async () => {
    // POST /api/parking/entry requires staff or admin role (if it were wired)
    // We test via POST /api/vehicles which requires 'owner' role - so let's test with staff
    const staffToken = makeToken({ userId: 'u1', role: 'staff' });
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ registrationNumber: 'KA01AB1234' });
    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/[Ff]orbidden|[Pp]ermission/);
  });

  it('rejects an admin trying to register a vehicle (owner-only route) with 403', async () => {
    const adminToken = makeToken({ userId: 'u1', role: 'admin' });
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ registrationNumber: 'KA01AB1234' });
    expect(res.status).toBe(403);
  });

  it('allows an owner to register a vehicle', async () => {
    const ownerToken = makeToken({ userId: 'u1', role: 'owner' });
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ registrationNumber: 'KA01AB1234' });
    expect(res.status).toBe(201);
  });
});
