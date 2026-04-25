const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { auth } = require('../middlewares/auth');

router.use(auth);

router.get('/warning', inventoryController.getWarningList);
router.post('/stock-in', inventoryController.stockIn);
router.post('/stock-out', inventoryController.stockOut);
router.get('/:id', inventoryController.getById);
router.get('/', inventoryController.getList);
router.post('/', inventoryController.create);
router.put('/:id', inventoryController.update);
router.delete('/:id', inventoryController.delete);

module.exports = router;
