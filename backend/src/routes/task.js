const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { auth } = require('../middlewares/auth');

router.use(auth);

router.get('/stats', taskController.getStats);
router.put('/:id/status', taskController.updateStatus);
router.get('/:id', taskController.getById);
router.get('/', taskController.getList);
router.post('/', taskController.create);
router.put('/:id', taskController.update);
router.delete('/:id', taskController.delete);

module.exports = router;
