// Tests for #51 VPS-NF-002 (TC-NF-002): health endpoint used by the uptime monitor
const request = require('supertest');
const app = require('../src/app');
const healthRoutes = require('../src/routes/health.routes');

describe('GET /api/health', () => {
  afterEach(() => jest.restoreAllMocks());

  it('returns 200 "ok" with uptime, timestamp and version when the database is connected', async () => {
    jest.spyOn(healthRoutes, 'getDbReadyState').mockReturnValue(1);
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: 'ok', db: 'connected' });
    expect(typeof res.body.uptimeSeconds).toBe('number');
    expect(new Date(res.body.timestamp).toString()).not.toBe('Invalid Date');
    expect(res.body.version).toBeDefined();
  });

  it('returns 503 "degraded" when the database is down, so the monitor counts it as unavailable', async () => {
    jest.spyOn(healthRoutes, 'getDbReadyState').mockReturnValue(0);
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(503);
    expect(res.body).toMatchObject({ status: 'degraded', db: 'disconnected' });
  });

  it('is public (no login needed)', async () => {
    const res = await request(app).get('/api/health');
    expect([200, 503]).toContain(res.status);
  });
});

describe('unknown API route', () => {
  it('returns 404 JSON', async () => {
    const res = await request(app).get('/api/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Not found');
  });
});
