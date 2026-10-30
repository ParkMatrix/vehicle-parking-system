require('dotenv').config({ quiet: true });
const app = require('./app');
const connectDB = require('./config/db');
const { createServers } = require('./createServer');

const PORT = Number(process.env.PORT || 5000);

connectDB(process.env.MONGO_URI)
  .then(() => {
    const { protocol, main, mainPort, redirect } = createServers(app);
    main.listen(mainPort, () => console.log(`API running on ${protocol}://localhost:${mainPort}`));
    if (redirect) redirect.listen(PORT, () => console.log(`HTTP on :${PORT} redirects to HTTPS`));
  })
  .catch((err) => {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  });
