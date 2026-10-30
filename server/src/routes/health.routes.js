// OWNER: Nishant - #51 VPS-NF-002 Availability
// SAD 4.3.2: GET /api/health (Operational) -> service health
// Returns 200 when the API and database are up, 503 when the database is down,
// so an uptime monitor counts "API up but DB down" as unavailable.
const { Router } = require('express');
const mongoose = require('mongoose');
const { version } = require('../../package.json');

const router = Router();
const DB_STATES = ['disconnected', 'connected', 'connecting', 'disconnecting'];

// Separate function so tests can simulate the database being up or down
router.getDbReadyState = () => mongoose.connection.readyState;

router.get('/', (req, res) => {
  const db = DB_STATES[router.getDbReadyState()] || 'unknown';
  const healthy = db === 'connected';
  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'ok' : 'degraded',
    db,
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    version,
  });
});

module.exports = router;
