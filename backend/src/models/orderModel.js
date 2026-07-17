const db = require('../config/database');

function attachItems(order) {
  if (!order) return order;

  const items = db
    .prepare('SELECT product_id AS id, title, price, qty FROM order_items WHERE order_id = ?')
    .all(order.id);

  return {
    id: order.id,
    customer: {
      fullName: order.full_name,
      email: order.email,
      address: order.address,
      city: order.city,
      postal: order.postal
    },
    items,
    total: order.total,
    status: order.status,
    createdAt: order.created_at
  };
}

function getAll(status) {
  const orders = status
    ? db.prepare('SELECT * FROM orders WHERE status = ? ORDER BY created_at DESC').all(status)
    : db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();

  return orders.map(attachItems);
}

function getById(id) {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
  return attachItems(order);
}

// Manual transaction: BEGIN → inserts → COMMIT, or ROLLBACK on any failure.
// Same guarantee as before — the order and its items are saved atomically.
function insertOrderTxn(order) {
  db.exec('BEGIN');
  try {
    db.prepare(`
      INSERT INTO orders (id, full_name, email, address, city, postal, total, status)
      VALUES (@id, @fullName, @email, @address, @city, @postal, @total, 'pending')
    `).run({
      id: order.id,
      fullName: order.fullName,
      email: order.email,
      address: order.address,
      city: order.city,
      postal: order.postal,
      total: order.total
    });

    const insertItem = db.prepare(`
      INSERT INTO order_items (order_id, product_id, title, price, qty)
      VALUES (@orderId, @productId, @title, @price, @qty)
    `);

    for (const item of order.items) {
      insertItem.run({
        orderId: order.id,
        productId: item.id,
        title: item.title,
        price: Number(item.price),
        qty: Number(item.qty)
      });
    }

    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

function create({ customer, items }) {
  const total = items.reduce((sum, item) => sum + Number(item.price) * Number(item.qty), 0);
  const id = `ORD-${Date.now()}`;

  insertOrderTxn({
    id,
    fullName: customer.fullName.trim(),
    email: customer.email.trim(),
    address: customer.address.trim(),
    city: customer.city.trim(),
    postal: customer.postal.trim(),
    total,
    items
  });

  return getById(id);
}

function updateStatus(id, status) {
  const result = db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, id);
  if (result.changes === 0) return null;
  return getById(id);
}

function remove(id) {
  const order = getById(id);
  if (!order) return null;

  db.prepare('DELETE FROM orders WHERE id = ?').run(id);
  return order;
}

module.exports = { getAll, getById, create, updateStatus, remove };