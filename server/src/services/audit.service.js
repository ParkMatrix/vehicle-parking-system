// OWNER: Preksha - #47 VPS-F-017, #48 VPS-SR-005, #49 VPS-NF-006
// SAD 4.2 / SRS 3.2.1: Audit Logging Service
const mongoose = require('mongoose');
const AuditLog = require('../models/AuditLog');

// VPS-SR-005: Never store passwords, tokens or authentication secrets in audit records
const SENSITIVE_KEYS = [
  'password',
  'passwordhash',
  'token',
  'secret',
  'jwt',
  'bearer',
  'authorization',
  'accesstoken',
  'refreshtoken',
  'credential',
];

function sanitize(value) {
  if (value === null || value === undefined) return value;
  if (typeof value !== 'object') return value;

  if (Array.isArray(value)) {
    return value.map(sanitize);
  }

  const clean = {};
  for (const [key, val] of Object.entries(value)) {
    const lowerKey = key.toLowerCase();
    const isSensitive = SENSITIVE_KEYS.some((s) => lowerKey.includes(s));
    if (isSensitive) {
      // Never store sensitive keys in the audit log (VPS-SR-005)
      continue;
    } else if (val && typeof val === 'object') {
      clean[key] = sanitize(val);
    } else {
      clean[key] = val;
    }
  }
  return clean;
}

// VPS-F-017 (#47): Record audit events for security-sensitive and administrative actions.
// AC-017: Each applicable event contains actor, action, timestamp, and result.
async function recordAudit({ actorId = null, action, result, details = null }) {
  // If in a test environment without active DB and AuditLog isn't mocked, skip to avoid buffering
  if (mongoose.connection.readyState !== 1) {
    const isMocked =
      AuditLog.create &&
      (AuditLog.create._isMockFunction || typeof AuditLog.create.mock !== 'undefined');
    if (!isMocked) {
      return null;
    }
  }

  try {
    const sanitizedDetails = sanitize(details);
    const validActorId =
      actorId && mongoose.Types.ObjectId.isValid(actorId) ? actorId : null;

    return await AuditLog.create({
      actorId: validActorId,
      action,
      result,
      details: sanitizedDetails,
      timestamp: new Date(),
    });
  } catch (err) {
    // Primary application requests must not fail if audit logging encounters an issue
    return null;
  }
}

// VPS-F-017 / VPS-NF-006: Retrieve audit records for Admin review
async function getAuditLogs({ action, result, limit = 100 } = {}) {
  const filter = {};
  if (action) filter.action = action;
  if (result) filter.result = result;

  const logs = await AuditLog.find(filter)
    .sort({ timestamp: -1 })
    .limit(Number(limit) || 100);

  return logs.map((log) => ({
    id: String(log._id),
    actorId: log.actorId ? String(log.actorId) : null,
    action: log.action,
    timestamp: log.timestamp,
    result: log.result,
    details: log.details || null,
  }));
}

module.exports = {
  recordAudit,
  getAuditLogs,
  sanitize,
};
