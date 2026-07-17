const productModel = require('../models/productModel');
const { ok, okList, created, notFound } = require('../../utils/response');

function slugify(title) {
  return String(title)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// GET /api/products?category=coffee
function list(req, res) {
  const { category } = req.query;
  okList(res, productModel.getAll(category));
}

// GET /api/products/:id
function getOne(req, res) {
  const product = productModel.getById(req.params.id);
  if (!product) return notFound(res, `Product '${req.params.id}' not found.`);
  ok(res, product);
}

// POST /api/products (admin)
function create(req, res) {
  const { title, category, price, description, image } = req.body;

  let id = slugify(title);
  if (productModel.existsById(id)) {
    id = `${id}-${Date.now()}`; // avoid collisions, e.g. two items both named "Latte"
  }

  const product = productModel.create({
    id,
    title: title.trim(),
    category: category.toLowerCase(),
    price: Number(price),
    description: description ? description.trim() : '',
    image: image || 'assets/images/coffee-1.jpg'
  });

  created(res, product);
}

// PUT /api/products/:id (admin)
function update(req, res) {
  const existing = productModel.getById(req.params.id);
  if (!existing) return notFound(res, `Product '${req.params.id}' not found.`);

  const { title, category, price, description, image } = req.body;

  const updated = productModel.update(req.params.id, {
    title: title.trim(),
    category: category.toLowerCase(),
    price: Number(price),
    description: description !== undefined ? description.trim() : existing.description,
    image: image || existing.image
  });

  ok(res, updated);
}

// DELETE /api/products/:id (admin)
function remove(req, res) {
  const removed = productModel.remove(req.params.id);
  if (!removed) return notFound(res, `Product '${req.params.id}' not found.`);
  ok(res, removed);
}

module.exports = { list, getOne, create, update, remove };