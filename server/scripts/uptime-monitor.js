// OWNER: Nishant - #51 VPS-NF-002 Availability (target: >= 99.5% per month, planned maintenance excluded)
//
// Pings GET /api/health on a schedule and appends every result to logs/uptime.csv.
// A check counts as "up" only when the API answers 200 within the timeout (the API
// returns 503 if the database is down).
//
//   npm run monitor                       -> check every 60 s (Ctrl+C to stop)
//   npm run monitor -- --report           -> print the availability report from logs/uptime.csv
//   npm run monitor -- --report --exclude-maintenance "2026-10-30T10:00/2026-10-30T11:00"
//
// Settings (optional, in .env or the shell): HEALTH_URL, MONITOR_INTERVAL_SECONDS, MONITOR_TIMEOUT_MS
require('dotenv').config({ quiet: true });
const fs = require('fs');
const path = require('path');

const HEALTH_URL = process.env.HEALTH_URL || `http://localhost:${process.env.PORT || 5000}/api/health`;
const INTERVAL_SECONDS = Number(process.env.MONITOR_INTERVAL_SECONDS || 60);
const TIMEOUT_MS = Number(process.env.MONITOR_TIMEOUT_MS || 5000);
const TARGET = 99.5;
const LOG_FILE = path.join(__dirname, '..', 'logs', 'uptime.csv');

async function checkOnce(url = HEALTH_URL, timeoutMs = TIMEOUT_MS) {
  const started = Date.now();
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
    return { time: new Date().toISOString(), up: res.status === 200, httpStatus: res.status, ms: Date.now() - started };
  } catch {
    return { time: new Date().toISOString(), up: false, httpStatus: 0, ms: Date.now() - started };
  }
}

function parseLog(text) {
  return text
    .split('\n')
    .slice(1)
    .filter(Boolean)
    .map((line) => {
      const [time, up, httpStatus, ms] = line.split(',');
      return { time, up: up === '1', httpStatus: Number(httpStatus), ms: Number(ms) };
    });
}

// windows: [{ start: Date, end: Date }] of planned maintenance to leave out
function availability(checks, windows = []) {
  const counted = checks.filter((c) => {
    const t = new Date(c.time);
    return !windows.some((w) => t >= w.start && t <= w.end);
  });
  const up = counted.filter((c) => c.up).length;
  const percent = counted.length ? (up / counted.length) * 100 : 0;
  return { checks: counted.length, up, down: counted.length - up, percent, meetsTarget: percent >= TARGET };
}

function parseWindows(args) {
  const windows = [];
  args.forEach((arg, i) => {
    if (arg === '--exclude-maintenance' && args[i + 1]) {
      const [start, end] = args[i + 1].split('/');
      windows.push({ start: new Date(start), end: new Date(end) });
    }
  });
  return windows;
}

function report(args) {
  if (!fs.existsSync(LOG_FILE)) {
    console.log(`No log yet at ${LOG_FILE}. Run "npm run monitor" first.`);
    return;
  }
  const checks = parseLog(fs.readFileSync(LOG_FILE, 'utf8'));
  const r = availability(checks, parseWindows(args));
  const first = checks[0]?.time;
  const last = checks[checks.length - 1]?.time;
  console.log('Availability report (VPS-NF-002)');
  console.log(`Period:        ${first} -> ${last}`);
  console.log(`Checks:        ${r.checks} (${r.up} up, ${r.down} down)`);
  console.log(`Availability:  ${r.percent.toFixed(2)}%  (target ${TARGET}%)  ${r.meetsTarget ? 'PASS' : 'FAIL'}`);
}

async function monitor() {
  fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });
  if (!fs.existsSync(LOG_FILE)) fs.writeFileSync(LOG_FILE, 'time,up,httpStatus,ms\n');
  console.log(`Monitoring ${HEALTH_URL} every ${INTERVAL_SECONDS}s -> ${LOG_FILE} (Ctrl+C to stop)`);

  let total = 0;
  let up = 0;
  const tick = async () => {
    const c = await checkOnce();
    fs.appendFileSync(LOG_FILE, `${c.time},${c.up ? 1 : 0},${c.httpStatus},${c.ms}\n`);
    total += 1;
    if (c.up) up += 1;
    console.log(`${c.time}  ${c.up ? 'UP  ' : 'DOWN'}  HTTP ${c.httpStatus || '-'}  ${c.ms} ms  | session ${((up / total) * 100).toFixed(2)}%`);
  };
  await tick();
  setInterval(tick, INTERVAL_SECONDS * 1000);
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.includes('--report')) report(args);
  else monitor();
}

module.exports = { checkOnce, parseLog, availability, parseWindows, TARGET };
