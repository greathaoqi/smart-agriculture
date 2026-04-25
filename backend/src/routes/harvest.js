const express = require('express');
const router = express.Router();
const harvestController = require('../controllers/harvestController');
const { auth } = require('../middlewares/auth');

router.use(auth);

router.get('/stats', harvestController.getStats);
router.get('/:id', harvestController.getById);
router.get('/', harvestController.getList);
router.post('/', harvestController.create);
router.put('/:id', harvestController.update);
router.delete('/:id', harvestController.delete);

module.exports = router;
