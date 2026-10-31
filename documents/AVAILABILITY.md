# Availability – VPS-NF-002 (#51, TC-NF-002)

**Requirement (SRS VPS-NF-002):** the system shall maintain at least **99.5% monthly availability**, excluding planned maintenance windows.

## How availability is measured

1. **Health check:** `GET /api/health` (public, SAD 4.3.2).
   - `200 {"status":"ok","db":"connected",...}` → the service is **up**.
   - `503 {"status":"degraded","db":"disconnected",...}` → the API is running but the database is not, so the service is **down**.
   - No answer within 5 s → **down**.
   - The response also includes `uptimeSeconds`, `timestamp` and `version`.
2. **Uptime monitor:** `server/scripts/uptime-monitor.js` calls the health check every 60 s and appends each result to `server/logs/uptime.csv` (`time,up,httpStatus,ms`).
3. **Report:** availability = up checks ÷ all checks, leaving out planned maintenance windows. PASS when ≥ 99.5%.

> 99.5% per month allows about **3 h 36 min** of downtime in a 30-day month.

## Commands (from `server/`)

```bash
npm run dev                         # start the API (terminal 1)
npm run monitor                     # start the monitor (terminal 2); Ctrl+C to stop
npm run monitor -- --report         # print the availability report
npm run monitor -- --report --exclude-maintenance "2026-10-30T10:00/2026-10-30T11:00"
```

Optional settings in `server/.env`: `HEALTH_URL`, `MONITOR_INTERVAL_SECONDS`, `MONITOR_TIMEOUT_MS`.

For a hosted deployment, point any external uptime service (e.g. UptimeRobot) at the same `/api/health` URL; it reads the same 200 / 503 signal.

## Evidence for the demo

1. Start the API and the monitor; let it run.
2. Stop MongoDB for a minute (Windows: `services.msc` → MongoDB Server → Stop). The monitor shows **DOWN / HTTP 503**. Start MongoDB again; it shows **UP**.
3. Run the report and screenshot it.

Automated tests: `server/tests/health.test.js`, `server/tests/uptime-monitor.test.js`.
