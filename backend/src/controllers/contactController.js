const contactModel = require('../models/contactModel');
const { okList } = require('../../utils/response');

// POST /api/contact
function create(req, res) {
  const { name, email, message } = req.body;

  const contact = contactModel.create({
    name: name.trim(),
    email: email.trim(),
    message: message.trim()
  });

  res.status(201).json({ success: true, message: 'Message sent successfully.', data: contact });
}

// GET /api/contact (admin)
function list(req, res) {
  okList(res, contactModel.getAll());
}

module.exports = { create, list };