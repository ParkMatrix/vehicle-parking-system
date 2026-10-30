# Browser compatibility & error messages – VPS-NF-005 (#45, TC-NF-004)

**Requirement (SRS VPS-NF-005):** the web interface shall support the latest two stable versions of the major desktop browsers and show readable validation and error messages.

## Supported browsers

| Browser | Versions tested | Notes |
| --- | --- | --- |
| Google Chrome | latest + previous stable | |
| Microsoft Edge | latest + previous stable | |
| Mozilla Firefox | latest + previous stable | |

The React client is built with Vite, which outputs modern JavaScript supported by all of the browsers above. No browser-specific code or polyfills are used.

## How to test

1. Start the app (`npm run dev` in `server/` and `client/`), then open http://localhost:5173 in each browser.
2. Run every check below and fill in Pass / Fail.
3. Check the older version with the browser's previous stable release (or a teammate's machine that has not updated).

## Checklist

| # | Check | Expected result | Chrome | Edge | Firefox |
| --- | --- | --- | --- | --- | --- |
| 1 | Register a new owner | Lands on Login with "Account created" | | | |
| 2 | Register with an email already used | "An account with this email already exists." | | | |
| 3 | Register with a 3-character password | "Password must be at least 6 characters." | | | |
| 4 | Log in with a wrong password | "Invalid email or password." | | | |
| 5 | Owner adds a vehicle, then adds the same number again | Second time: duplicate message | | | |
| 6 | Admin creates slot A1, then A1 again | Second time: "Slot ID already exists" | | | |
| 7 | Staff records entry, then entry again for the same vehicle | Second time: vehicle already parked message | | | |
| 8 | Staff records exit for a vehicle that is not parked | "No active session found" | | | |
| 9 | Stop the server, then click any button that loads data | "Cannot reach the server. Check your connection and try again." | | | |
| 10 | Log in as an owner, open /admin/slots and try to create a slot | "Forbidden: insufficient permissions." | | | |
| 11 | Slot grid colours (Available / Occupied / Unavailable) | Green / red / grey, readable | | | |
| 12 | Resize window to tablet width (~768 px) | Layout readable, nothing cut off | | | |

**Tested by:** ______  **Date:** ______  **Result:** ___ / 12 passed in all three browsers

## What was changed for readable errors

- `server/src/middleware/errorHandler.js`: invalid IDs, missing or wrong fields, duplicates and malformed JSON all return one plain-English sentence (no stack traces, no database details).
- `client/src/api.js` (`errorMessage`): shows the server's message, or a clear fallback for "not logged in", "no permission", "server problem" and "cannot reach the server".
- `client/index.html`: a message is shown if JavaScript is disabled.
- Automated tests: `server/tests/error-messages.test.js`.
