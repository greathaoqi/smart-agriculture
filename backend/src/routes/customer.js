const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { auth } = require('../middlewares/auth');

router.use(auth);

router.get('/all', customerController.getAll);
router.get('/:id/stats', customerController.getStats);
router.get('/:id', customerController.getById);
router.get('/', customerController.getList);
router.post('/', customerController.create);
router.put('/:id', customerController.update);
router.delete('/:id', customerController.delete);

module.exports = router;
