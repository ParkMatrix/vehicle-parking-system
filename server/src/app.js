const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

// Health check (SAD 4.3.2: GET /api/health)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

// One router per module/owner - add your endpoints inside your own routes file only.
app.use('/api/auth', require('./routes/auth.routes'));       // Nishant
app.use('/api/vehicles', require('./routes/vehicle.routes')); // Preksha
app.use('/api/slots', require('./routes/slot.routes'));       // Siddesh
app.use('/api/parking', require('./routes/parking.routes'));  // Salasha
app.use('/api/admin', require('./routes/admin.routes'));      // Sprint 2
app.use('/api/admin', require('./routes/occupancy.routes'));  // Nishant (#50)

app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));
app.use(errorHandler);

module.exports = app;
