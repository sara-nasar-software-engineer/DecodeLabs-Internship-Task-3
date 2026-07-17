const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { validateProduct } = require('../middleware/validate');

router.get('/', productController.list);
router.get('/:id', productController.getOne);
router.post('/', validateProduct, productController.create);
router.put('/:id', validateProduct, productController.update);
router.delete('/:id', productController.remove);

module.exports = router;