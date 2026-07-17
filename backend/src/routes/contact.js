const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { validateContact } = require('../middleware/validate');

router.post('/', validateContact, contactController.create);
router.get('/', contactController.list);

module.exports = router;