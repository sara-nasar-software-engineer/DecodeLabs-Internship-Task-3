// Small helpers so every controller returns the exact same JSON
// envelope shape without repeating res.status().json() everywhere.

function ok(res, data, status = 200) {
  return res.status(status).json({ success: true, data });
}

function okList(res, data, status = 200) {
  return res.status(status).json({ success: true, count: data.length, data });
}

function created(res, data) {
  return ok(res, data, 201);
}

function notFound(res, error) {
  return res.status(404).json({ success: false, error });
}

function badRequest(res, errors) {
  const payload = Array.isArray(errors) ? { errors } : { error: errors };
  return res.status(400).json({ success: false, ...payload });
}

module.exports = { ok, okList, created, notFound, badRequest };