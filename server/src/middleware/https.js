// OWNER: Nishant - #52 VPS-SR-003 HTTPS/TLS in production
// In production (NODE_ENV=production, or FORCE_HTTPS=true):
//  - plain-HTTP page requests (GET/HEAD) are redirected to https:// (301)
//  - any other plain-HTTP request (e.g. POST /api/auth/login) is refused with 403,
//    so credentials are never accepted over plaintext HTTP
//  - HTTPS responses carry Strict-Transport-Security, so browsers only use HTTPS afterwards
// Behind a reverse proxy / hosting platform that terminates TLS, set TRUST_PROXY=true
// so X-Forwarded-Proto is used to detect HTTPS.
const HSTS = 'max-age=15552000; includeSubDomains'; // 180 days

function httpsRequired(env = process.env) {
  return env.NODE_ENV === 'production' || env.FORCE_HTTPS === 'true';
}

function enforceHttps(req, res, next) {
  if (!httpsRequired()) return next();

  if (req.secure) {
    res.setHeader('Strict-Transport-Security', HSTS);
    return next();
  }

  if (req.method === 'GET' || req.method === 'HEAD') {
    return res.redirect(301, `https://${req.headers.host}${req.originalUrl}`);
  }
  return res.status(403).json({ error: 'HTTPS is required. Please use the https:// address.' });
}

module.exports = { enforceHttps, httpsRequired, HSTS };
