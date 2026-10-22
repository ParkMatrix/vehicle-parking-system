require('dotenv').config({ quiet: true });
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

connectDB(process.env.MONGO_URI)
  .then(() => app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`)))
  .catch((err) => {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  });
