// Tests for #47 VPS-F-017 (TC-F-017): Audit event recording for sensitive and admin actions
// Tests for #48 VPS-SR-005 (TC-S-005): Audit records free of secrets
const request = require('supertest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

function mockObjectId(n) {
  return new mongoose.Types.ObjectId(n.toString().padStart(24, '0')).toString();
}

// In-memory collections
const users = [];
const slots = [];
const sessions = [];
const auditLogs = [];

// Mock User model
jest.mock('../src/models/User', () => ({
  exists: jest.fn(async ({ email }) => users.some((u) => u.email === email)),
  create: jest.fn(async (doc) => {
    const user = { _id: mockObjectId(users.length + 1), ...doc };
    users.push(user);
    return user;
  }),
  findOne: jest.fn(({ email }) => ({
    select: async () => users.find((u) => u.email === email) || null,
  })),
}));

// Mock ParkingSlot model
jest.mock('../src/models/ParkingSlot', () => {
  const mock = {
    find: jest.fn(() => ({
      sort: () => ({
        lean: async () => [...slots],
      }),
    })),
    findOne: jest.fn(async ({ slotId }) => slots.find((s) => s.slotId === slotId) || null),
    findById: jest.fn(async (id) => {
      const s = slots.find((slot) => String(slot._id) === String(id));
      if (!s) return null;
      return {
        ...s,
        save: async function () {
          const idx = slots.findIndex((x) => String(x._id) === String(this._id));
          if (idx !== -1) {
            slots[idx].status = this.status;
          }
        },
      };
    }),
    create: jest.fn(async (doc) => {
      const slot = { _id: mockObjectId(slots.length + 10), ...doc };
      slots.push(slot);
      return slot;
    }),
  };
  return mock;
});

// Mock ParkingSession model
jest.mock('../src/models/ParkingSession', () => ({
  exists: jest.fn(async ({ slotId, status }) =>
    sessions.some((s) => String(s.slotId) === String(slotId) && s.status === status)
  ),
}));

// Mock AuditLog model
jest.mock('../src/models/AuditLog', () => ({
  create: jest.fn(async (doc) => {
    const log = {
      _id: mockObjectId(auditLogs.length + 100),
      timestamp: doc.timestamp || new Date(),
      ...doc,
    };
    auditLogs.push(log);
    return log;
  }),
  find: jest.fn((filter = {}) => {
    const query = {
      sort: () => query,
      limit: (n) => {
        let results = [...auditLogs];
        if (filter.action) results = results.filter((l) => l.action === filter.action);
        if (filter.result) results = results.filter((l) => l.result === filter.result);
        results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        return Promise.resolve(results.slice(0, n));
      },
      then: (resolve, reject) => {
        let results = [...auditLogs];
        if (filter.action) results = results.filter((l) => l.action === filter.action);
        if (filter.result) results = results.filter((l) => l.result === filter.result);
        results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        return Promise.resolve(results).then(resolve, reject);
      },
    };
    return query;
  }),
}));

const SECRET = 'test-secret-audit';
process.env.JWT_SECRET = SECRET;

const app = require('../src/app');

function makeToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: '1h' });
}

const adminToken = makeToken({ userId: mockObjectId(1), role: 'admin' });
const staffToken = makeToken({ userId: mockObjectId(2), role: 'staff' });
const ownerToken = makeToken({ userId: mockObjectId(3), role: 'owner' });

beforeEach(async () => {
  users.length = 0;
  slots.length = 0;
  sessions.length = 0;
  auditLogs.length = 0;

  // Seed one valid user for login tests
  const passwordHash = await bcrypt.hash('correctPassword123', 10);
  users.push({
    _id: mockObjectId(1),
    name: 'Admin User',
    email: 'admin@vps.local',
    passwordHash,
    role: 'admin',
  });

  // Seed one slot for status change test
  slots.push({
    _id: mockObjectId(10),
    slotId: 'A-01',
    status: 'Available',
  });
});

// ---------- TC-F-017: Audit event recording (#47 VPS-F-017) ----------

describe('Audit event recording (#47 VPS-F-017 / TC-F-017)', () => {
  it('records an audit event on failed login attempt with failure result', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@vps.local', password: 'wrongPassword!' });

    expect(res.status).toBe(401);

    const failedLog = auditLogs.find((l) => l.action === 'AUTH_LOGIN' && l.result === 'failure');
    expect(failedLog).toBeDefined();
    expect(failedLog.action).toBe('AUTH_LOGIN');
    expect(failedLog.result).toBe('failure');
    expect(failedLog.timestamp).toBeDefined();
    expect(failedLog.details.email).toBe('admin@vps.local');
  });

  it('records an audit event on successful login with success result', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@vps.local', password: 'correctPassword123' });

    expect(res.status).toBe(200);

    const successLog = auditLogs.find((l) => l.action === 'AUTH_LOGIN' && l.result === 'success');
    expect(successLog).toBeDefined();
    expect(successLog.actorId).toBe(mockObjectId(1));
    expect(successLog.action).toBe('AUTH_LOGIN');
    expect(successLog.result).toBe('success');
    expect(successLog.timestamp).toBeDefined();
  });

  it('records an audit event on admin slot status change', async () => {
    const slotId = mockObjectId(10);
    const res = await request(app)
      .patch(`/api/slots/${slotId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'Unavailable' });

    expect(res.status).toBe(200);

    const slotLog = auditLogs.find((l) => l.action === 'SLOT_STATUS_UPDATE' && l.result === 'success');
    expect(slotLog).toBeDefined();
    expect(slotLog.actorId).toBe(mockObjectId(1));
    expect(slotLog.action).toBe('SLOT_STATUS_UPDATE');
    expect(slotLog.result).toBe('success');
    expect(slotLog.timestamp).toBeDefined();
    expect(slotLog.details).toMatchObject({
      slotId: 'A-01',
      previousStatus: 'Available',
      newStatus: 'Unavailable',
    });
  });

  it('TC-F-017 flow: Trigger failed login -> change slot status as admin -> review audit records as admin', async () => {
    // 1. Trigger a failed login
    await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@vps.local', password: 'badPassword' });

    // 2. Change a slot status as Admin
    await request(app)
      .patch(`/api/slots/${mockObjectId(10)}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'Unavailable' });

    // 3. Review audit records as Admin
    const res = await request(app)
      .get('/api/admin/audit')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.logs).toBeDefined();
    expect(res.body.logs.length).toBeGreaterThanOrEqual(2);

    // Expected: Each event has actor, action, timestamp and result. Failed login and slot change are both present.
    const loginFail = res.body.logs.find((l) => l.action === 'AUTH_LOGIN' && l.result === 'failure');
    const slotChange = res.body.logs.find((l) => l.action === 'SLOT_STATUS_UPDATE');

    expect(loginFail).toBeDefined();
    expect(loginFail).toHaveProperty('action', 'AUTH_LOGIN');
    expect(loginFail).toHaveProperty('result', 'failure');
    expect(loginFail).toHaveProperty('timestamp');

    expect(slotChange).toBeDefined();
    expect(slotChange).toHaveProperty('actorId', mockObjectId(1));
    expect(slotChange).toHaveProperty('action', 'SLOT_STATUS_UPDATE');
    expect(slotChange).toHaveProperty('result', 'success');
    expect(slotChange).toHaveProperty('timestamp');
  });

  it('rejects audit log access for non-admin roles (403 for staff and owner)', async () => {
    const staffRes = await request(app)
      .get('/api/admin/audit')
      .set('Authorization', `Bearer ${staffToken}`);
    expect(staffRes.status).toBe(403);

    const ownerRes = await request(app)
      .get('/api/admin/audit')
      .set('Authorization', `Bearer ${ownerToken}`);
    expect(ownerRes.status).toBe(403);
  });

  it('rejects audit log access when unauthenticated (401)', async () => {
    const res = await request(app).get('/api/admin/audit');
    expect(res.status).toBe(401);
  });
});

// ---------- TC-S-005: Audit records free of secrets (#48 VPS-SR-005) ----------

describe('Audit records free of secrets (#48 VPS-SR-005 / TC-S-005)', () => {
  it('never stores submitted passwords in failed login audit details', async () => {
    const plainPassword = 'superSecretPassword123!';
    await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@vps.local', password: plainPassword });

    const failedLog = auditLogs.find((l) => l.action === 'AUTH_LOGIN' && l.result === 'failure');
    expect(failedLog).toBeDefined();
    const serialized = JSON.stringify(failedLog);
    expect(serialized).not.toContain(plainPassword);
    expect(serialized).not.toMatch(/"password"/i);
  });

  it('never stores password, passwordHash, token, or secret in successful login audit details', async () => {
    await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@vps.local', password: 'correctPassword123' });

    const successLog = auditLogs.find((l) => l.action === 'AUTH_LOGIN' && l.result === 'success');
    expect(successLog).toBeDefined();
    const serialized = JSON.stringify(successLog);
    expect(serialized).not.toContain('correctPassword123');
    expect(serialized).not.toMatch(/passwordhash|secret|token|bearer/i);
  });

  it('audit service sanitizer strips all sensitive keys and tokens from nested objects', () => {
    const { sanitize } = require('../src/services/audit.service');
    const dirty = {
      email: 'user@example.com',
      password: 'plain-password',
      passwordHash: '$2b$10$abcdefghijklmnopqrstuv',
      jwt: 'header.payload.signature',
      authToken: 'xyz123',
      bearerToken: 'token456',
      authorization: 'Bearer token',
      secret: 'api-secret',
      nested: {
        password: 'nested-secret',
        apiKey: '12345',
        safeField: 'keepThisValue',
      },
      safeNumber: 42,
    };

    const clean = sanitize(dirty);
    expect(clean.email).toBe('user@example.com');
    expect(clean.safeNumber).toBe(42);
    expect(clean.nested.safeField).toBe('keepThisValue');
    expect(clean.password).toBeUndefined();
    expect(clean.passwordHash).toBeUndefined();
    expect(clean.jwt).toBeUndefined();
    expect(clean.authToken).toBeUndefined();
    expect(clean.bearerToken).toBeUndefined();
    expect(clean.authorization).toBeUndefined();
    expect(clean.secret).toBeUndefined();
    expect(clean.nested.password).toBeUndefined();
  });

  it('AuditLog model schema sanitizer strips secrets and redacts raw token/hash values', () => {
    const { sanitizeSecrets } = jest.requireActual('../src/models/AuditLog');
    const dirty = {
      user: 'alice',
      password: 'mypassword',
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xyz.abc',
      authHeader: 'Bearer some.secret.token',
      hash: '$2b$10$abcdefghijklmnopqrstuv',
      nested: { apiKey: 'key-123', label: 'ok' },
    };
    const cleaned = sanitizeSecrets(dirty);
    expect(cleaned.user).toBe('alice');
    expect(cleaned.password).toBeUndefined();
    expect(cleaned.token).toBeUndefined();
    expect(cleaned.authHeader).toBe('[REDACTED]');
    expect(cleaned.hash).toBe('[REDACTED]');
    expect(cleaned.nested.apiKey).toBeUndefined();
    expect(cleaned.nested.label).toBe('ok');
  });
});
