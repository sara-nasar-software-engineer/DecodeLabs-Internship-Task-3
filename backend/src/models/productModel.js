const db = require('../config/database');

// Data access layer for the "products" table. Controllers talk to
// the database only through these functions — never with inline SQL.
//
// All queries use "?" placeholders and pass values as a separate
// array. better-sqlite3 sends them to SQLite as data, never as
// executable SQL text — this is what neutralizes SQL injection.

function getAll(category) {
  if (category) {
    return db
      .prepare('SELECT * FROM products WHERE LOWER(category) = LOWER(?) ORDER BY title')
      .all(category);
  }
  return db.prepare('SELECT * FROM products ORDER BY title').all();
}

function getById(id) {
  return db.prepare('SELECT * FROM products WHERE id = ?').get(id);
}

function existsById(id) {
  return Boolean(db.prepare('SELECT 1 FROM products WHERE id = ?').get(id));
}

function create({ id, title, category, price, description, image }) {
  db.prepare(`
    INSERT INTO products (id, title, category, price, description, image)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, title, category, price, description, image);

  return getById(id);
}

function update(id, { title, category, price, description, image }) {
  db.prepare(`
    UPDATE products
    SET title = ?, category = ?, price = ?, description = ?, image = ?
    WHERE id = ?
  `).run(title, category, price, description, image, id);

  return getById(id);
}

function remove(id) {
  const product = getById(id);
  if (!product) return null;

  db.prepare('DELETE FROM products WHERE id = ?').run(id);
  return product;
}

module.exports = { getAll, getById, existsById, create, update, remove };