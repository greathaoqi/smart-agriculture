const express = require('express');
const router = express.Router();
const plotController = require('../controllers/plotController');
const { auth } = require('../middlewares/auth');

router.use(auth);

router.get('/farm/:farmId', plotController.getByFarm);
router.get('/:id', plotController.getById);
router.get('/', plotController.getList);
router.post('/', plotController.create);
router.put('/:id', plotController.update);
router.delete('/:id', plotController.delete);

module.exports = router;
