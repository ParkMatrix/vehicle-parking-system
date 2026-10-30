// OWNER: Nishant - #52 VPS-SR-003
// Starts HTTPS when a TLS key and certificate are configured, plain HTTP otherwise (local development).
//   SSL_KEY_PATH=certs/key.pem  SSL_CERT_PATH=certs/cert.pem  HTTPS_PORT=5443
// With HTTPS on, the normal PORT keeps listening only to redirect browsers to HTTPS.
const fs = require('fs');
const http = require('http');
const https = require('https');
const { httpsRequired } = require('./middleware/https');

function createServers(app, env = process.env) {
  const { SSL_KEY_PATH, SSL_CERT_PATH } = env;

  if (SSL_KEY_PATH && SSL_CERT_PATH) {
    const tls = { key: fs.readFileSync(SSL_KEY_PATH), cert: fs.readFileSync(SSL_CERT_PATH), minVersion: 'TLSv1.2' };
    const httpsPort = Number(env.HTTPS_PORT || 5443);
    const redirect = http.createServer((req, res) => {
      const host = (req.headers.host || 'localhost').replace(/:\d+$/, '');
      res.writeHead(301, { Location: `https://${host}:${httpsPort}${req.url}` });
      res.end();
    });
    return { protocol: 'https', main: https.createServer(tls, app), mainPort: httpsPort, redirect };
  }

  if (httpsRequired(env) && env.TRUST_PROXY !== 'true') {
    console.warn('WARNING: production without SSL_KEY_PATH/SSL_CERT_PATH or TRUST_PROXY=true - traffic is not encrypted.');
  }
  return { protocol: 'http', main: http.createServer(app), mainPort: Number(env.PORT || 5000), redirect: null };
}

module.exports = { createServers };
