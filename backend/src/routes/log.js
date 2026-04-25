const express = require('express');
const router = express.Router();
const logController = require('../controllers/logController');
const { auth } = require('../middlewares/auth');

router.use(auth);

router.get('/modules', logController.getModules);
router.get('/actions', logController.getActions);
router.get('/stats', logController.getStats);
router.get('/:id', logController.getById);
router.get('/', logController.getList);

module.exports = router;
