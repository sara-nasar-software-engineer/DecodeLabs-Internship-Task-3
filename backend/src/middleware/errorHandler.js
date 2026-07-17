// Catches any request that didn't match a route.
function notFound(req, res) {
  res.status(404).json({ success: false, error: `Route ${req.originalUrl} not found.` });
}

// Central error handler — catches anything thrown or passed to next(err)
// anywhere in the app, including inside models/controllers.
function errorHandler(err, req, res, next) {
  console.error(err.stack);

  // SQLite constraint violations (CHECK / NOT NULL / UNIQUE / FK) surface
  // as a client error, not a generic 500 — the request was bad, the
  // server isn't broken.
  if (err.code && err.code.startsWith('SQLITE_CONSTRAINT')) {
    return res.status(400).json({ success: false, error: 'Database constraint violation.', detail: err.message });
  }

  res.status(500).json({ success: false, error: 'Something went wrong on the server.' });
}

module.exports = { notFound, errorHandler };