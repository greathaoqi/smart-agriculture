const express = require('express');
const router = express.Router();
const warehouseController = require('../controllers/warehouseController');
const { auth } = require('../middlewares/auth');

router.use(auth);

router.get('/all', warehouseController.getAll);
router.get('/:id/stats', warehouseController.getStats);
router.get('/:id', warehouseController.getById);
router.get('/', warehouseController.getList);
router.post('/', warehouseController.create);
router.put('/:id', warehouseController.update);
router.delete('/:id', warehouseController.delete);

module.exports = router;
