const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { auth } = require('../middlewares/auth');

router.use(auth);

router.get('/stats', orderController.getStats);
router.put('/:id/status', orderController.updateStatus);
router.get('/:id', orderController.getById);
router.get('/', orderController.getList);
router.post('/', orderController.create);
router.put('/:id', orderController.update);
router.delete('/:id', orderController.delete);

module.exports = router;
