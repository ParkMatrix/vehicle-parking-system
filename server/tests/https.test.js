// Tests for #52 VPS-SR-003 (TC-S-003): HTTPS/TLS in production, no credentials over plain HTTP
const express = require('express');
const request = require('supertest');
const fs = require('fs');
const os = require('os');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');
const { enforceHttps, HSTS } = require('../src/middleware/https');
const { createServers } = require('../src/createServer');

function testApp() {
  const app = express();
  app.use(express.json());
  app.use(enforceHttps);
  app.get('/api/slots', (req, res) => res.json({ ok: true }));
  app.post('/api/auth/login', (req, res) => res.json({ token: 'x' }));
  return app;
}

describe('enforceHttps middleware (TC-S-003)', () => {
  const saved = { ...process.env };
  afterEach(() => {
    process.env = { ...saved };
  });

  it('does nothing in development (plain HTTP allowed locally)', async () => {
    process.env.NODE_ENV = 'development';
    const res = await request(testApp()).get('/api/slots');
    expect(res.status).toBe(200);
  });

  it('redirects plain-HTTP page requests to https:// in production', async () => {
    process.env.NODE_ENV = 'production';
    const res = await request(testApp()).get('/api/slots?x=1').set('Host', 'parkmatrix.example');
    expect(res.status).toBe(301);
    expect(res.headers.location).toBe('https://parkmatrix.example/api/slots?x=1');
  });

  it('refuses credentials sent over plain HTTP in production (403, no token)', async () => {
    process.env.NODE_ENV = 'production';
    const res = await request(testApp()).post('/api/auth/login').send({ email: 'a@b.c', password: 'secret123' });
    expect(res.status).toBe(403);
    expect(res.body.token).toBeUndefined();
  });

  it('accepts HTTPS behind a proxy and sends HSTS', async () => {
    process.env.NODE_ENV = 'production';
    const app = testApp();
    app.set('trust proxy', 1);
    const res = await request(app).post('/api/auth/login').set('X-Forwarded-Proto', 'https').send({});
    expect(res.status).toBe(200);
    expect(res.headers['strict-transport-security']).toBe(HSTS);
  });

  it('ignores a spoofed X-Forwarded-Proto when no proxy is trusted', async () => {
    process.env.NODE_ENV = 'production';
    const res = await request(testApp()).post('/api/auth/login').set('X-Forwarded-Proto', 'https').send({});
    expect(res.status).toBe(403);
  });
});

describe('createServers()', () => {
  it('uses plain HTTP when no certificate is configured (local development)', () => {
    const { protocol, redirect } = createServers(express(), { PORT: '5000' });
    expect(protocol).toBe('http');
    expect(redirect).toBeNull();
  });

  let hasOpenssl = true;
  try {
    execSync('openssl version', { stdio: 'ignore' });
  } catch {
    hasOpenssl = false;
  }
  (hasOpenssl ? it : it.skip)('serves real TLS when SSL_KEY_PATH / SSL_CERT_PATH are set', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'vps-tls-'));
    const key = path.join(dir, 'key.pem');
    const cert = path.join(dir, 'cert.pem');
    execSync(`openssl req -x509 -newkey rsa:2048 -nodes -keyout "${key}" -out "${cert}" -days 1 -subj "/CN=localhost"`, { stdio: 'ignore' });

    const app = express();
    app.get('/ping', (req, res) => res.json({ secure: req.secure }));
    const { protocol, main, redirect } = createServers(app, { SSL_KEY_PATH: key, SSL_CERT_PATH: cert, HTTPS_PORT: '0' });
    expect(protocol).toBe('https');
    expect(redirect).not.toBeNull();

    await new Promise((resolve) => main.listen(0, '127.0.0.1', resolve));
    const body = await new Promise((resolve, reject) => {
      https
        .get({ host: '127.0.0.1', port: main.address().port, path: '/ping', rejectUnauthorized: false, agent: false }, (res) => {
          let data = '';
          res.on('data', (c) => (data += c));
          res.on('end', () => resolve({ data, tls: res.socket.getProtocol() }));
        })
        .on('error', reject);
    });
    main.closeAllConnections();
    await new Promise((resolve) => main.close(resolve));
    expect(JSON.parse(body.data)).toEqual({ secure: true });
    expect(['TLSv1.2', 'TLSv1.3']).toContain(body.tls);
  });
});
