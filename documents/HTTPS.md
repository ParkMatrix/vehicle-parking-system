# HTTPS / TLS – VPS-SR-003 (#52, TC-S-003)

**Requirement (SRS VPS-SR-003):** production client–server communication shall use HTTPS/TLS, and credentials shall not be sent over plaintext HTTP.

## What the server does

| Setting | Behaviour |
| --- | --- |
| Local development (default) | Plain HTTP on `PORT` (5000), so the team can develop without certificates. |
| `NODE_ENV=production` (or `FORCE_HTTPS=true`) | Plain-HTTP `GET` requests are redirected to `https://` (301). Any other plain-HTTP request, e.g. `POST /api/auth/login`, is **refused with 403**, so a password is never accepted over HTTP. HTTPS responses include `Strict-Transport-Security` (HSTS, 180 days). |
| `SSL_KEY_PATH` + `SSL_CERT_PATH` set | The API serves **TLS 1.2+** on `HTTPS_PORT` (default 5443). `PORT` stays open only to redirect browsers to HTTPS. |
| `TRUST_PROXY=true` | For hosting platforms that handle HTTPS themselves (Render, Railway, Nginx…): the server trusts `X-Forwarded-Proto` from the proxy. Without it, a spoofed header is ignored. |

Code: `server/src/middleware/https.js`, `server/src/createServer.js`. Tests: `server/tests/https.test.js`.

## Try it locally with a self-signed certificate

From `server/` (on Windows use **Git Bash**, which includes `openssl`):

```bash
mkdir certs
openssl req -x509 -newkey rsa:2048 -nodes -keyout certs/key.pem -out certs/cert.pem -days 365 -subj "/CN=localhost"
```

Add to `server/.env`:

```
NODE_ENV=production
SSL_KEY_PATH=certs/key.pem
SSL_CERT_PATH=certs/cert.pem
HTTPS_PORT=5443
```

Run `npm run dev`. You should see `API running on https://localhost:5443`.

Checks (TC-S-003):

1. Open https://localhost:5443/api/health. The browser warns about the self-signed certificate; continue. You get the JSON and the padlock shows TLS.
2. Open http://localhost:5000/api/health. You are redirected to https://localhost:5443/api/health.
3. `curl -i -X POST http://localhost:5000/api/auth/login` returns `301` to the HTTPS address instead of logging in, and `curl -i -k https://localhost:5443/api/health` shows the `Strict-Transport-Security` header.

`certs/` is in `.gitignore`. Never commit private keys. Remove these four lines from `.env` to go back to normal development.
