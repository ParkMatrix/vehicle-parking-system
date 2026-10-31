// OWNER: Preksha - #47 VPS-F-017, #48 VPS-SR-005, #49 VPS-NF-006
// SAD 4.2 / SRS 3.2.1: Audit Logging Service
const mongoose = require('mongoose');
const AuditLog = require('../models/AuditLog');

const RETENTION_PERIOD_DAYS = AuditLog.RETENTION_PERIOD_DAYS || 365;
const RETENTION_PERIOD_SECONDS = AuditLog.RETENTION_PERIOD_SECONDS || RETENTION_PERIOD_DAYS * 24 * 60 * 60;

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
async function recordAudit({ actorId = null, action, result, details = null, timestamp = null }) {
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
      timestamp: timestamp ? new Date(timestamp) : new Date(),
    });
  } catch (err) {
    // Primary application requests must not fail if audit logging encounters an issue
    return null;
  }
}

// VPS-F-017 / VPS-NF-006: Retrieve audit records for Admin review with retention and date range filtering
async function getAuditLogs({ action, result, actorId, startDate, endDate, from, to, limit = 100, page = 1 } = {}) {
  const filter = {};
  if (action) filter.action = action;
  if (result) filter.result = result;
  if (actorId && mongoose.Types.ObjectId.isValid(actorId)) {
    filter.actorId = actorId;
  }

  const start = startDate || from;
  const end = endDate || to;
  if (start || end) {
    filter.timestamp = {};
    if (start) filter.timestamp.$gte = new Date(start);
    if (end) filter.timestamp.$lte = new Date(end);
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(500, Math.max(1, parseInt(limit, 10) || 100));
  const skip = (pageNum - 1) * limitNum;

  const logs = await AuditLog.find(filter)
    .sort({ timestamp: -1 })
    .skip(skip)
    .limit(limitNum);

  return logs.map((log) => ({
    id: String(log._id),
    actorId: log.actorId ? String(log.actorId) : null,
    action: log.action,
    timestamp: log.timestamp,
    result: log.result,
    details: log.details || null,
  }));
}

// VPS-NF-006: Returns retention policy configuration details
function getRetentionConfig() {
  return {
    retentionPeriodDays: RETENTION_PERIOD_DAYS,
    retentionPeriodSeconds: RETENTION_PERIOD_SECONDS,
    minimumRetentionYears: 1,
  };
}

module.exports = {
  recordAudit,
  getAuditLogs,
  getRetentionConfig,
  sanitize,
  RETENTION_PERIOD_DAYS,
  RETENTION_PERIOD_SECONDS,
};
