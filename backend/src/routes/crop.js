const express = require('express');
const router = express.Router();
const cropController = require('../controllers/cropController');
const { auth } = require('../middlewares/auth');

router.use(auth);

router.get('/all', cropController.getAll);
router.get('/:id', cropController.getById);
router.get('/', cropController.getList);
router.post('/', cropController.create);
router.put('/:id', cropController.update);
router.delete('/:id', cropController.delete);

module.exports = router;
