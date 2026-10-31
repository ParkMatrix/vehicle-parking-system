// Tests for #47 VPS-F-017 (TC-F-017): Audit event recording for sensitive and admin actions
// Tests for #48 VPS-SR-005 (TC-S-005): Audit records free of secrets
// Tests for #49 VPS-NF-006 (TC-NF-005): Audit retention (>= 1 year) and retrieval
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
jest.mock('../src/models/AuditLog', () => {
  const RETENTION_PERIOD_DAYS = 365;
  const RETENTION_PERIOD_SECONDS = RETENTION_PERIOD_DAYS * 24 * 60 * 60;

  return {
    RETENTION_PERIOD_DAYS,
    RETENTION_PERIOD_SECONDS,
    create: jest.fn(async (doc) => {
      const log = {
        _id: mockObjectId(auditLogs.length + 100),
        timestamp: doc.timestamp ? new Date(doc.timestamp) : new Date(),
        ...doc,
      };
      auditLogs.push(log);
      return log;
    }),
    find: jest.fn((filter = {}) => {
      let skipCount = 0;
      const execute = () => {
        let results = [...auditLogs];
        if (filter.action) results = results.filter((l) => l.action === filter.action);
        if (filter.result) results = results.filter((l) => l.result === filter.result);
        if (filter.actorId) results = results.filter((l) => String(l.actorId) === String(filter.actorId));
        if (filter.timestamp) {
          if (filter.timestamp.$gte) {
            results = results.filter((l) => new Date(l.timestamp) >= new Date(filter.timestamp.$gte));
          }
          if (filter.timestamp.$lte) {
            results = results.filter((l) => new Date(l.timestamp) <= new Date(filter.timestamp.$lte));
          }
        }
        results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        if (skipCount > 0) results = results.slice(skipCount);
        return results;
      };
      const query = {
        sort: () => query,
        skip: (n) => {
          skipCount = Number(n) || 0;
          return query;
        },
        limit: (n) => Promise.resolve(execute().slice(0, n)),
        then: (resolve, reject) => Promise.resolve(execute()).then(resolve, reject),
      };
      return query;
    }),
  };
});

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

// ---------- TC-NF-005: Audit retention and retrieval (#49 VPS-NF-006) ----------

describe('Audit retention and retrieval (#49 VPS-NF-006 / TC-NF-005)', () => {
  it('TC-NF-005 step 1: DB/TTL configuration guarantees minimum 1 year (365 days) retention with no earlier automatic deletion', () => {
    const actualModel = jest.requireActual('../src/models/AuditLog');
    expect(actualModel.RETENTION_PERIOD_DAYS).toBeGreaterThanOrEqual(365);
    expect(actualModel.RETENTION_PERIOD_SECONDS).toBeGreaterThanOrEqual(365 * 24 * 60 * 60);

    const indexes = actualModel.schema.indexes();
    const ttlIndex = indexes.find(
      ([fields, options]) => fields.timestamp === 1 && options && options.expireAfterSeconds !== undefined
    );

    expect(ttlIndex).toBeDefined();
    expect(ttlIndex[1].expireAfterSeconds).toBeGreaterThanOrEqual(31536000); // 365 days in seconds
  });

  it('GET /api/admin/audit/retention exposes retention policy details to admin and rejects unauthorized access', async () => {
    const res = await request(app)
      .get('/api/admin/audit/retention')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.retentionPeriodDays).toBe(365);
    expect(res.body.minimumRetentionYears).toBe(1);
    expect(res.body.retentionPeriodSeconds).toBe(31536000);

    // Non-admin rejected
    const staffRes = await request(app)
      .get('/api/admin/audit/retention')
      .set('Authorization', `Bearer ${staffToken}`);
    expect(staffRes.status).toBe(403);
  });

  it('TC-NF-005 step 2: inserts back-dated audit records (e.g. 11 months old) and retrieves them via Admin view', async () => {
    const elevenMonthsAgo = new Date();
    elevenMonthsAgo.setMonth(elevenMonthsAgo.getMonth() - 11);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // Insert back-dated audit records within the retention window
    auditLogs.push(
      {
        _id: mockObjectId(201),
        actorId: mockObjectId(1),
        action: 'SLOT_STATUS_UPDATE',
        result: 'success',
        timestamp: elevenMonthsAgo,
        details: { slotId: 'A-01', previousStatus: 'Available', newStatus: 'Unavailable' },
      },
      {
        _id: mockObjectId(202),
        actorId: null,
        action: 'AUTH_LOGIN',
        result: 'failure',
        timestamp: sixMonthsAgo,
        details: { email: 'unknown@example.com', reason: 'Invalid email or password.' },
      },
      {
        _id: mockObjectId(203),
        actorId: mockObjectId(1),
        action: 'AUTH_LOGIN',
        result: 'success',
        timestamp: new Date(),
        details: { email: 'admin@vps.local' },
      }
    );

    // Retrieve via Admin view
    const res = await request(app)
      .get('/api/admin/audit')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.logs.length).toBeGreaterThanOrEqual(3);

    // Verify 11-month-old record is retrievable with actor, action, timestamp, and outcome (result)
    const oldRecord = res.body.logs.find((l) => l.id === mockObjectId(201));
    expect(oldRecord).toBeDefined();
    expect(oldRecord.actorId).toBe(mockObjectId(1));
    expect(oldRecord.action).toBe('SLOT_STATUS_UPDATE');
    expect(oldRecord.result).toBe('success');
    expect(new Date(oldRecord.timestamp).getTime()).toBe(elevenMonthsAgo.getTime());
    expect(oldRecord.details).toMatchObject({ slotId: 'A-01' });

    // Verify 6-month-old failure record is retrieved
    const midRecord = res.body.logs.find((l) => l.id === mockObjectId(202));
    expect(midRecord).toBeDefined();
    expect(midRecord.result).toBe('failure');
  });

  it('retrieves audit records filtered by date range (startDate / endDate)', async () => {
    const d1 = new Date('2025-01-15T10:00:00Z');
    const d2 = new Date('2025-06-15T10:00:00Z');
    const d3 = new Date('2025-11-15T10:00:00Z');

    auditLogs.push(
      { _id: mockObjectId(301), action: 'A1', result: 'success', timestamp: d1 },
      { _id: mockObjectId(302), action: 'A2', result: 'success', timestamp: d2 },
      { _id: mockObjectId(303), action: 'A3', result: 'success', timestamp: d3 }
    );

    const res = await request(app)
      .get('/api/admin/audit')
      .query({ startDate: '2025-05-01T00:00:00Z', endDate: '2025-07-01T00:00:00Z' })
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.logs).toHaveLength(1);
    expect(res.body.logs[0].id).toBe(mockObjectId(302));
  });

  it('supports pagination with page and limit for audit retention retrieval', async () => {
    for (let i = 1; i <= 5; i++) {
      auditLogs.push({
        _id: mockObjectId(400 + i),
        action: `ACTION_${i}`,
        result: 'success',
        timestamp: new Date(Date.now() - i * 10000),
      });
    }

    const resPage1 = await request(app)
      .get('/api/admin/audit')
      .query({ limit: 2, page: 1 })
      .set('Authorization', `Bearer ${adminToken}`);

    expect(resPage1.status).toBe(200);
    expect(resPage1.body.logs).toHaveLength(2);

    const resPage2 = await request(app)
      .get('/api/admin/audit')
      .query({ limit: 2, page: 2 })
      .set('Authorization', `Bearer ${adminToken}`);

    expect(resPage2.status).toBe(200);
    expect(resPage2.body.logs).toHaveLength(2);
    expect(resPage2.body.logs[0].id).not.toBe(resPage1.body.logs[0].id);
  });
});
