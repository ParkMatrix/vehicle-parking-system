// Central error handler: readable JSON errors, no stack traces or secrets leaked to the client.
// eslint-disable-next-line no-unused-vars
module.exports = function errorHandler(err, req, res, next) {
  const status = err.status || (err.name === 'ValidationError' ? 400 : err.code === 11000 ? 409 : 500);
  const message =
    err.code === 11000 ? 'Duplicate value: this record already exists.' : err.expose || status < 500 ? err.message : 'Internal server error';
  if (status >= 500) console.error(err);
  res.status(status).json({ error: message });
};
