// Tests for #51 VPS-NF-002 (TC-NF-002): availability calculation used for the 99.5% target
const http = require('http');
const { checkOnce, parseLog, availability, parseWindows } = require('../scripts/uptime-monitor');

describe('availability()', () => {
  const mk = (n, up) => Array.from({ length: n }, (_, i) => ({ time: new Date(Date.UTC(2026, 9, 30, 0, i)).toISOString(), up }));

  it('meets the 99.5% target with 1 failure in 200 checks', () => {
    const r = availability([...mk(199, true), ...mk(1, false)]);
    expect(r.percent).toBeCloseTo(99.5);
    expect(r.meetsTarget).toBe(true);
  });

  it('fails the target with 2 failures in 200 checks', () => {
    const r = availability([...mk(198, true), ...mk(2, false)]);
    expect(r.meetsTarget).toBe(false);
  });

  it('leaves planned maintenance windows out of the calculation', () => {
    const checks = [
      { time: '2026-10-30T09:59:00Z', up: true },
      { time: '2026-10-30T10:30:00Z', up: false }, // during maintenance
      { time: '2026-10-30T11:30:00Z', up: true },
    ];
    const windows = parseWindows(['--exclude-maintenance', '2026-10-30T10:00:00Z/2026-10-30T11:00:00Z']);
    expect(availability(checks, windows)).toMatchObject({ checks: 2, up: 2, percent: 100 });
  });

  it('reads the CSV log format', () => {
    const rows = parseLog('time,up,httpStatus,ms\n2026-10-30T00:00:00Z,1,200,12\n2026-10-30T00:01:00Z,0,503,8\n');
    expect(rows).toEqual([
      { time: '2026-10-30T00:00:00Z', up: true, httpStatus: 200, ms: 12 },
      { time: '2026-10-30T00:01:00Z', up: false, httpStatus: 503, ms: 8 },
    ]);
  });
});

describe('checkOnce()', () => {
  let server;
  let base;
  beforeAll(async () => {
    server = http.createServer((req, res) => {
      res.statusCode = req.url === '/ok' ? 200 : 503;
      res.end();
    });
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    base = `http://127.0.0.1:${server.address().port}`;
  });
  afterAll(() => new Promise((resolve) => server.close(resolve)));

  it('counts HTTP 200 as up', async () => {
    expect(await checkOnce(`${base}/ok`)).toMatchObject({ up: true, httpStatus: 200 });
  });

  it('counts 503 (database down) as down', async () => {
    expect(await checkOnce(`${base}/db-down`)).toMatchObject({ up: false, httpStatus: 503 });
  });

  it('counts an unreachable server as down', async () => {
    expect(await checkOnce('http://127.0.0.1:1/api/health', 1000)).toMatchObject({ up: false, httpStatus: 0 });
  });
});
