// Each function is Express middleware: it checks req.body and either
// calls next() to let the request continue, or responds with 400 and
// stops the request right there. This is the "Gatekeeper Rule" from
// the training deck — the server checks everything, never assumes
// the frontend already validated it.

const CATEGORIES = ['coffee', 'tea', 'pastry'];

function validateProduct(req, res, next) {
  const { title, category, price } = req.body;
  const errors = [];

  if (!title || typeof title !== 'string' || !title.trim()) {
    errors.push('title is required and must be a non-empty string.');
  }

  if (!category || !CATEGORIES.includes(String(category).toLowerCase())) {
    errors.push(`category is required and must be one of: ${CATEGORIES.join(', ')}.`);
  }

  if (price === undefined || price === null || Number.isNaN(Number(price)) || Number(price) <= 0) {
    errors.push('price is required and must be a positive number.');
  }

  if (errors.length) {
    return res.status(400).json({ success: false, errors });
  }

  next();
}

function validateOrder(req, res, next) {
  const { customer, items } = req.body;
  const errors = [];

  if (!customer || typeof customer !== 'object') {
    errors.push('customer details are required.');
  } else {
    const requiredFields = ['fullName', 'email', 'address', 'city', 'postal'];
    requiredFields.forEach((field) => {
      if (!customer[field] || !String(customer[field]).trim()) {
        errors.push(`customer.${field} is required.`);
      }
    });

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (customer.email && !emailPattern.test(customer.email)) {
      errors.push('customer.email must be a valid email address.');
    }
  }

  if (!Array.isArray(items) || items.length === 0) {
    errors.push('items must be a non-empty array.');
  } else {
    items.forEach((item, idx) => {
      if (!item.id || !item.title) {
        errors.push(`items[${idx}] must include id and title.`);
      }
      if (!item.qty || Number(item.qty) <= 0) {
        errors.push(`items[${idx}].qty must be a positive number.`);
      }
      if (item.price === undefined || Number(item.price) < 0) {
        errors.push(`items[${idx}].price must be a non-negative number.`);
      }
    });
  }

  if (errors.length) {
    return res.status(400).json({ success: false, errors });
  }

  next();
}

function validateContact(req, res, next) {
  const { name, email, message } = req.body;
  const errors = [];
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!name || !String(name).trim()) errors.push('name is required.');
  if (!email || !emailPattern.test(email)) errors.push('a valid email is required.');
  if (!message || !String(message).trim()) errors.push('message is required.');

  if (errors.length) {
    return res.status(400).json({ success: false, errors });
  }

  next();
}

function validateAdminLogin(req, res, next) {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, errors: ['username and password are required.'] });
  }
  next();
}

module.exports = { validateProduct, validateOrder, validateContact, validateAdminLogin };