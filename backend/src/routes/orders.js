const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { validateOrder } = require('../middleware/validate');

router.get('/', orderController.list);
router.get('/:id', orderController.getOne);
router.post('/', validateOrder, orderController.create);
router.patch('/:id/status', orderController.updateStatus);
router.delete('/:id', orderController.remove);

module.exports = router;