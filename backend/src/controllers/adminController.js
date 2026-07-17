// In a real project these would live in an env file / database with a
// hashed password. Kept simple here since this project's focus is
// database integration for products/orders/contacts, not full auth.
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'urban123';

// POST /api/admin/login
function login(req, res) {
  const { username, password } = req.body;

  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, error: 'Invalid admin credentials.' });
  }

  // Simple session token placeholder — swap for a real JWT/session
  // library if a later project asks for proper authentication.
  const token = Buffer.from(`${username}:${Date.now()}`).toString('base64');

  res.status(200).json({ success: true, token });
}

module.exports = { login };