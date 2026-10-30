// Central error handler: readable JSON errors, no stack traces or secrets leaked to the client.
// VPS-NF-005 (#45): every error the browser receives is a short, human-readable sentence.

function readableValidationMessage(err) {
  const messages = Object.values(err.errors || {}).map((e) => {
    const field = e.path || 'value';
    if (e.kind === 'required') return `${field} is required.`;
    if (e.kind === 'enum') return `${field} must be one of: ${(e.properties?.enumValues || e.enumValues || []).join(', ')}.`;
    return String(e.message || '').replace(/^Path `([^`]+)`/, '$1');
  });
  return messages.join(' ') || 'Some of the data you entered is not valid.';
}

function classify(err) {
  if (err.name === 'CastError') {
    return { status: 400, message: `Invalid ${err.path === '_id' ? 'ID' : err.path || 'value'}.` };
  }
  if (err.name === 'ValidationError') {
    return { status: 400, message: readableValidationMessage(err) };
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || err.keyPattern || {})[0];
    return { status: 409, message: field ? `A record with this ${field} already exists.` : 'This record already exists.' };
  }
  if (err.type === 'entity.parse.failed') {
    return { status: 400, message: 'Request body is not valid JSON.' };
  }
  if (err.type === 'entity.too.large') {
    return { status: 413, message: 'Request is too large.' };
  }
  const status = err.status || err.statusCode || 500;
  return { status, message: status < 500 || err.expose ? err.message : 'Internal server error' };
}

// eslint-disable-next-line no-unused-vars
module.exports = function errorHandler(err, req, res, next) {
  const { status, message } = classify(err);
  if (status >= 500) console.error(err);
  res.status(status).json({ error: message });
};
