// SAD 4.2: AuditLog (auditId, actorId, action, timestamp, result) -> collection "auditLogs"
// VPS-SR-005: never store passwords, tokens or other secrets in an audit record.
const mongoose = require('mongoose');

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

module.exports = mongoose.model('AuditLog', auditLogSchema);
