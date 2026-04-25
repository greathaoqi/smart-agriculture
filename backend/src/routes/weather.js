const express = require('express');
const router = express.Router();
const controller = require('../controllers/weatherController');
const { auth } = require('../middlewares/auth');

router.use(auth);

router.get('/history', controller.getHistory);
router.get('/forecast', controller.getForecast);
router.get('/current', controller.getCurrent);

module.exports = router;
