const express = require('express');
const router = express.Router();
const controller = require('../controllers/greenhouseController');
const { auth } = require('../middlewares/auth');

router.use(auth);

router.get('/stats', controller.getStats);
router.get('/:id/environment', controller.getEnvironment);
router.post('/:id/control', controller.control);
router.get('/:id', controller.getById);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);
router.get('/', controller.getList);
router.post('/', controller.create);

module.exports = router;
