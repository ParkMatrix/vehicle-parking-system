// Tests for #24 VPS-F-001 (TC-F-001), #25 VPS-F-002 (TC-F-002), #26 VPS-SR-004 (TC-S-004)
// The User model is replaced with an in-memory fake, so no database is needed (runs in CI).
const request = require('supertest');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

process.env.JWT_SECRET = 'test-secret';
const app = require('../src/app');

beforeEach(() => {
  users.length = 0;
});

const valid = { name: 'Asha Rao', email: 'Asha@Example.com', phone: '9876543210', password: 'secret123' };

describe('POST /api/auth/register (TC-F-001)', () => {
  it('creates one owner account from valid data', async () => {
    const res = await request(app).post('/api/auth/register').send(valid);
    expect(res.status).toBe(201);
    expect(res.body.user).toMatchObject({ name: 'Asha Rao', email: 'asha@example.com', role: 'owner' });
    expect(users).toHaveLength(1);
  });

  it('never returns the password or hash', async () => {
    const res = await request(app).post('/api/auth/register').send(valid);
    expect(JSON.stringify(res.body)).not.toMatch(/secret123|passwordHash/);
  });

  it('rejects a duplicate email with 409', async () => {
    await request(app).post('/api/auth/register').send(valid);
    const res = await request(app).post('/api/auth/register').send({ ...valid, email: 'asha@example.com' });
    expect(res.status).toBe(409);
    expect(users).toHaveLength(1);
  });

  it.each([
    [{ ...valid, name: '' }, /Name/],
    [{ ...valid, email: 'not-an-email' }, /email/],
    [{ ...valid, password: '123' }, /Password/],
  ])('rejects invalid data with 400', async (body, msg) => {
    const res = await request(app).post('/api/auth/register').send(body);
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(msg);
    expect(users).toHaveLength(0);
  });

  it('ignores a role sent by the client (cannot self-register as admin)', async () => {
    const res = await request(app).post('/api/auth/register').send({ ...valid, role: 'admin' });
    expect(res.body.user.role).toBe('owner');
  });
});

describe('Password storage (TC-S-004)', () => {
  it('stores only a bcrypt hash, never the plain password', async () => {
    await request(app).post('/api/auth/register').send(valid);
    const stored = users[0];
    expect(stored.password).toBeUndefined();
    expect(stored.passwordHash).not.toBe(valid.password);
    expect(stored.passwordHash).toMatch(/^\$2[aby]\$/);
    expect(await bcrypt.compare(valid.password, stored.passwordHash)).toBe(true);
  });
});

describe('POST /api/auth/login (TC-F-002)', () => {
  beforeEach(async () => {
    await request(app).post('/api/auth/register').send(valid);
  });

  it('returns a JWT with userId and role for valid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'asha@example.com', password: 'secret123' });
    expect(res.status).toBe(200);
    const payload = jwt.verify(res.body.token, 'test-secret');
    expect(payload).toMatchObject({ userId: 'id1', role: 'owner' });
    expect(res.body.user.email).toBe('asha@example.com');
    expect(JSON.stringify(res.body.user)).not.toMatch(/passwordHash/);
  });

  it('rejects a wrong password with 401', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'asha@example.com', password: 'wrong' });
    expect(res.status).toBe(401);
    expect(res.body.token).toBeUndefined();
  });

  it('rejects an unknown email with the same 401 message', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'nobody@example.com', password: 'secret123' });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid email or password.');
  });

  it('rejects missing fields with 400', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.status).toBe(400);
  });
});
