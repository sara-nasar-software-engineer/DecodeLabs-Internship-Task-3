const db = require('../config/database');

// Data access layer for "contacts" — homepage contact form submissions.

function getAll() {
  return db.prepare('SELECT * FROM contacts ORDER BY created_at DESC').all();
}

function getById(id) {
  return db.prepare('SELECT * FROM contacts WHERE id = ?').get(id);
}

function create({ name, email, message }) {
  const id = `MSG-${Date.now()}`;

  db.prepare(`
    INSERT INTO contacts (id, name, email, message)
    VALUES (?, ?, ?, ?)
  `).run(id, name, email, message);

  return getById(id);
}

module.exports = { getAll, getById, create };