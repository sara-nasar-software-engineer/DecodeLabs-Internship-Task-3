const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { validateAdminLogin } = require('../middleware/validate');

router.post('/login', validateAdminLogin, adminController.login);

module.exports = router;