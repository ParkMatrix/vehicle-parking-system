// Tests for #40 VPS-NF-003 (TC-S-001, TC-S-002): automated RBAC verification.
// Every protected endpoint is called with no token, a bad token, and each role.
// The check is only "was access granted or refused" - no database is needed, so
// requests that pass the security checks fail fast with a non-401/403 status.
const request = require('supertest');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

mongoose.set('bufferCommands', false); // no DB in tests: fail fast instead of waiting 10 s
process.env.JWT_SECRET = 'test-secret';
const app = require('../src/app');

const token = (role) => `Bearer ${jwt.sign({ userId: '507f1f77bcf86cd799439011', role }, 'test-secret')}`;
const ID = '507f1f77bcf86cd799439012';

// Who may call each endpoint (SAD 4.3.2 access column). 'any' = any logged-in user.
const MATRIX = [
  { method: 'get', path: '/api/vehicles', allowed: ['owner', 'staff', 'admin'] },
  { method: 'post', path: '/api/vehicles', allowed: ['owner'], body: { registrationNumber: 'KA01AB1234' } },
  { method: 'patch', path: `/api/vehicles/${ID}`, allowed: ['owner', 'staff', 'admin'], body: { make: 'X' } },
  { method: 'get', path: '/api/slots', allowed: ['owner', 'staff', 'admin'] },
  { method: 'post', path: '/api/slots', allowed: ['admin'], body: { slotId: 'Z9' } },
  { method: 'patch', path: `/api/slots/${ID}/status`, allowed: ['admin'], body: { status: 'Unavailable' } },
  { method: 'post', path: '/api/parking/entry', allowed: ['staff', 'admin'], body: { registrationNumber: 'KA01AB1234', slotId: ID } },
  { method: 'post', path: '/api/parking/exit', allowed: ['staff', 'admin'], body: { registrationNumber: 'KA01AB1234' } },
];
const ROLES = ['owner', 'staff', 'admin'];

const call = ({ method, path, body }, auth) => {
  const req = request(app)[method](path);
  if (auth) req.set('Authorization', auth);
  return body ? req.send(body) : req;
};

describe('RBAC matrix (VPS-NF-003)', () => {
  describe.each(MATRIX)('$method $path', (endpoint) => {
    it('rejects a request with no token (401)', async () => {
      const res = await call(endpoint);
      expect(res.status).toBe(401);
    });

    it('rejects an invalid token (401)', async () => {
      const res = await call(endpoint, 'Bearer not-a-real-token');
      expect(res.status).toBe(401);
    });

    it('rejects a token signed with the wrong secret (401)', async () => {
      const forged = `Bearer ${jwt.sign({ userId: 'x', role: 'admin' }, 'wrong-secret')}`;
      const res = await call(endpoint, forged);
      expect(res.status).toBe(401);
    });

    const denied = ROLES.filter((r) => !endpoint.allowed.includes(r));
    if (denied.length) {
      it.each(denied)('refuses the %s role (403)', async (role) => {
        const res = await call(endpoint, token(role));
        expect(res.status).toBe(403);
      });
    }

    it.each(endpoint.allowed)('lets the %s role through the security checks', async (role) => {
      const res = await call(endpoint, token(role));
      expect([401, 403]).not.toContain(res.status);
    });
  });

  it('rejects an expired token (401)', async () => {
    const expired = `Bearer ${jwt.sign({ userId: 'x', role: 'admin', exp: Math.floor(Date.now() / 1000) - 60 }, 'test-secret')}`;
    const res = await request(app).get('/api/slots').set('Authorization', expired);
    expect(res.status).toBe(401);
  });

  it('keeps public endpoints public', async () => {
    expect((await request(app).get('/api/health')).status).not.toBe(401);
    expect((await request(app).post('/api/auth/login').send({})).status).not.toBe(401);
  });
});
