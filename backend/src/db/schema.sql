-- =========================================================
-- Urban Sips Cafe — Database Schema
-- Pillar 1 (Blueprint) + Pillar 4 (Shield): the schema is the
-- final source of truth. Constraints are enforced here, not just
-- trusted from the application layer.
-- =========================================================

-- ---------------------------------------------------------
-- PRODUCTS  (the menu)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
  id          TEXT PRIMARY KEY,                 -- slug, e.g. "espresso"
  title       TEXT NOT NULL,
  category    TEXT NOT NULL CHECK (category IN ('coffee', 'tea', 'pastry')),
  price       REAL NOT NULL CHECK (price > 0),
  description TEXT DEFAULT '',
  image       TEXT DEFAULT 'assets/images/coffee-1.jpg',
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- ---------------------------------------------------------
-- ORDERS  (one order = one customer checkout)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
  id          TEXT PRIMARY KEY,                 -- e.g. "ORD-1731234567"
  full_name   TEXT NOT NULL,
  email       TEXT NOT NULL,
  address     TEXT NOT NULL,
  city        TEXT NOT NULL,
  postal      TEXT NOT NULL,
  total       REAL NOT NULL CHECK (total >= 0),
  status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- ---------------------------------------------------------
-- ORDER_ITEMS  (One-to-Many: one Order -> many Items)
-- Foreign key back to orders is the "structural glue" that binds
-- a line item to the order it belongs to. product_id is a *soft*
-- link back to the menu (nullable + ON DELETE SET NULL) since a
-- historical order must survive even if that product is later
-- removed from the menu.
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_items (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id    TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id  TEXT REFERENCES products(id) ON DELETE SET NULL,
  title       TEXT NOT NULL,                    -- snapshot at time of order
  price       REAL NOT NULL CHECK (price >= 0),  -- snapshot at time of order
  qty         INTEGER NOT NULL CHECK (qty > 0)
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- ---------------------------------------------------------
-- CONTACTS  (homepage contact form submissions)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS contacts (
  id          TEXT PRIMARY KEY,                 -- e.g. "MSG-1731234567"
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  message     TEXT NOT NULL,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);