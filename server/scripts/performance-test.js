const fs = require('node:fs');
const path = require('node:path');
const { performance } = require('node:perf_hooks');

const BASE_URL = process.env.PERF_BASE_URL || 'http://localhost:5000';
const EMAIL = process.env.PERF_EMAIL || 'admin@vps.local';
const PASSWORD = process.env.PERF_PASSWORD || 'admin123';
const TOTAL_REQUESTS = 200;
const CONCURRENCY = 10;
const WARMUP_REQUESTS = 10;
const TARGET_MS = 2000;

function percentile(values, p) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.ceil(p * sorted.length) - 1];
}

async function main() {
  console.log(`Logging in at ${BASE_URL}...`);

  const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });

  if (!loginResponse.ok) {
    throw new Error(`Login failed: HTTP ${loginResponse.status}. Check credentials and server.`);
  }

  const login = await loginResponse.json();
  if (!login.token) throw new Error('Login response did not contain a token.');

  const headers = { Authorization: `Bearer ${login.token}` };
  const url = `${BASE_URL}/api/slots`;

  console.log(`Warming up with ${WARMUP_REQUESTS} requests...`);
  for (let i = 0; i < WARMUP_REQUESTS; i++) {
    const response = await fetch(url, { headers });
    await response.arrayBuffer();
    if (!response.ok) {
      throw new Error(`Warm-up failed: HTTP ${response.status}`);
    }
  }

  const results = [];
  let nextRequest = 0;

  async function worker() {
    while (true) {
      const index = nextRequest++;
      if (index >= TOTAL_REQUESTS) return;

      const start = performance.now();
      try {
        const response = await fetch(url, { headers });
        await response.arrayBuffer();
        results[index] = {
          latencyMs: Number((performance.now() - start).toFixed(2)),
          status: response.status,
        };
      } catch (error) {
        results[index] = {
          latencyMs: Number((performance.now() - start).toFixed(2)),
          status: 0,
          error: error.message,
        };
      }
    }
  }

  console.log(`Running ${TOTAL_REQUESTS} requests with ${CONCURRENCY} concurrent workers...`);
  const startedAt = new Date().toISOString();
  const wallStart = performance.now();

  await Promise.all(
    Array.from({ length: CONCURRENCY }, () => worker())
  );

  const durationSeconds = (performance.now() - wallStart) / 1000;
  const latencies = results.map((r) => r.latencyMs);
  const successful = results.filter((r) => r.status >= 200 && r.status < 300);
  const failed = results.filter((r) => r.status < 200 || r.status >= 300);
  const p95 = percentile(latencies, 0.95);

  const report = {
    testCase: 'TC-NF-001',
    issue: '#44 VPS-NF-001',
    endpoint: 'GET /api/slots',
    startedAt,
    baseUrl: BASE_URL,
    profile: {
      totalRequests: TOTAL_REQUESTS,
      concurrency: CONCURRENCY,
      warmupRequests: WARMUP_REQUESTS,
      profileStatus: 'Proposed profile; confirm with team before acceptance',
    },
    results: {
      completedRequests: results.length,
      successfulRequests: successful.length,
      failedRequests: failed.length,
      durationSeconds: Number(durationSeconds.toFixed(2)),
      throughputRequestsPerSecond: Number((results.length / durationSeconds).toFixed(2)),
      minMs: Math.min(...latencies),
      averageMs: Number((latencies.reduce((sum, value) => sum + value, 0) / latencies.length).toFixed(2)),
      p95Ms: p95,
      maxMs: Math.max(...latencies),
      targetMs: TARGET_MS,
      p95TargetMet: p95 <= TARGET_MS,
      allRequestsSuccessful: failed.length === 0,
      overallPass: p95 <= TARGET_MS && failed.length === 0,
    },
    statusCounts: results.reduce((counts, item) => {
      const key = String(item.status);
      counts[key] = (counts[key] || 0) + 1;
      return counts;
    }, {}),
    errors: results.filter((r) => r.error).map((r) => r.error),
    note: 'Results apply only to this environment and proposed workload; they do not establish performance under other loads.',
  };

  const reportDir = path.join(__dirname, '..', 'reports');
  fs.mkdirSync(reportDir, { recursive: true });
  const reportPath = path.join(reportDir, 'performance-results.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n');

  console.log('\n--- Performance Results ---');
  console.log(`Requests: ${results.length}`);
  console.log(`Successful: ${successful.length}`);
  console.log(`Failed: ${failed.length}`);
  console.log(`Throughput: ${report.results.throughputRequestsPerSecond} requests/sec`);
  console.log(`Average: ${report.results.averageMs} ms`);
  console.log(`p95: ${p95} ms`);
  console.log(`Maximum: ${report.results.maxMs} ms`);
  console.log(`p95 target (<= 2000 ms): ${report.results.p95TargetMet ? 'PASS' : 'FAIL'}`);
  console.log(`Overall: ${report.results.overallPass ? 'PASS' : 'FAIL'}`);
  console.log(`Report saved to: ${reportPath}`);
}

main().catch((error) => {
  console.error('Performance test failed:', error.message);
  process.exitCode = 1;
});
