const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const { auth } = require('../middlewares/auth');

router.use(auth);

router.get('/all', roleController.getAll);
router.get('/:id', roleController.getById);
router.get('/', roleController.getList);
router.post('/', roleController.create);
router.put('/:id', roleController.update);
router.delete('/:id', roleController.delete);

module.exports = router;
