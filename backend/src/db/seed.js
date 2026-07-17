const fs = require('fs');
const path = require('path');
const db = require('../config/database');

function seedProducts() {
  const jsonPath = path.join(__dirname, '..', '..', 'data', 'products.json');

  if (!fs.existsSync(jsonPath)) {
    console.log('No data/products.json found — skipping product seed.');
    return;
  }

  const products = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

  const insert = db.prepare(`
    INSERT OR IGNORE INTO products (id, title, category, price, description, image)
    VALUES (@id, @title, @category, @price, @description, @image)
  `);

  db.exec('BEGIN');
  try {
    for (const p of products) {
      insert.run({
        id: p.id,
        title: p.title,
        category: p.category,
        price: p.price,
        description: p.description || '',
        image: p.image || 'assets/images/coffee-1.jpg'
      });
    }
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }

  console.log(`Seeded ${products.length} product(s) into the database.`);
}

seedProducts();
console.log('Seeding complete.');