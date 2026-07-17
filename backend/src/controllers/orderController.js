const orderModel = require('../models/orderModel');
const { ok, okList, created, notFound, badRequest } = require('../../utils/response');

const VALID_STATUSES = ['pending', 'completed'];

// GET /api/orders?status=pending
function list(req, res) {
  const { status } = req.query;
  okList(res, orderModel.getAll(status));
}

// GET /api/orders/:id
function getOne(req, res) {
  const order = orderModel.getById(req.params.id);
  if (!order) return notFound(res, `Order '${req.params.id}' not found.`);
  ok(res, order);
}

// POST /api/orders
function create(req, res) {
  const { customer, items } = req.body;
  const order = orderModel.create({ customer, items });
  created(res, order);
}

// PATCH /api/orders/:id/status
function updateStatus(req, res) {
  const { status } = req.body;

  if (!VALID_STATUSES.includes(status)) {
    return badRequest(res, [`status must be one of: ${VALID_STATUSES.join(', ')}.`]);
  }

  const updated = orderModel.updateStatus(req.params.id, status);
  if (!updated) return notFound(res, `Order '${req.params.id}' not found.`);

  ok(res, updated);
}

// DELETE /api/orders/:id
function remove(req, res) {
  const removed = orderModel.remove(req.params.id);
  if (!removed) return notFound(res, `Order '${req.params.id}' not found.`);
  ok(res, removed);
}

module.exports = { list, getOne, create, updateStatus, remove };