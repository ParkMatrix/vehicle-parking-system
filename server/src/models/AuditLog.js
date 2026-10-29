// SAD 4.2: AuditLog (auditId, actorId, action, timestamp, result) -> collection "auditLogs"
// VPS-SR-005 (#48): never store passwords, tokens or other secrets in an audit record.
const mongoose = require('mongoose');

const SENSITIVE_KEY_PATTERNS = [
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
  'apikey',
  'privatekey',
];

function sanitizeSecrets(value) {
  if (value === null || value === undefined) return value;
  if (typeof value !== 'object') {
    if (typeof value === 'string') {
      if (
        /^Bearer\s+/i.test(value) ||
        /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/.test(value) ||
        /^\$2[aby]\$\d{2}\$/.test(value)
      ) {
        return '[REDACTED]';
      }
    }
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeSecrets);
  }

  const clean = {};
  for (const [k, v] of Object.entries(value)) {
    const lower = k.toLowerCase();
    const isSensitive = SENSITIVE_KEY_PATTERNS.some((pattern) => lower.includes(pattern));
    if (isSensitive) {
      continue;
    } else if (v && typeof v === 'object') {
      clean[k] = sanitizeSecrets(v);
    } else {
      clean[k] = sanitizeSecrets(v);
    }
  }
  return clean;
}

const auditLogSchema = new mongoose.Schema(
  {
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    action: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    result: { type: String, enum: ['success', 'failure'], required: true },
    details: { type: mongoose.Schema.Types.Mixed },
  },
  { collection: 'auditLogs' }
);

// Pre-save hook ensuring VPS-SR-005 compliance before persisting
auditLogSchema.pre('save', function () {
  if (this.details) {
    this.details = sanitizeSecrets(this.details);
  }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
module.exports.sanitizeSecrets = sanitizeSecrets;
