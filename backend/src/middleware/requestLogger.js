// Logs every incoming request. Kept as its own file so app.js stays
// a clean list of "what's wired up" rather than "how logging works".
function requestLogger(req, res, next) {
  console.log(`${new Date().toISOString()} | ${req.method} ${req.originalUrl}`);
  next();
}

module.exports = requestLogger;