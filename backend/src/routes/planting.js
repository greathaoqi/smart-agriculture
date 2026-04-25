const express = require('express');
const router = express.Router();
const plantingController = require('../controllers/plantingController');
const { auth } = require('../middlewares/auth');

router.use(auth);

// 种植计划
router.get('/plan/:id', plantingController.getPlanById);
router.get('/plan', plantingController.getPlanList);
router.post('/plan', plantingController.createPlan);
router.put('/plan/:id', plantingController.updatePlan);
router.delete('/plan/:id', plantingController.deletePlan);

// 种植记录
router.get('/record', plantingController.getRecordList);
router.post('/record', plantingController.createRecord);
router.put('/record/:id', plantingController.updateRecord);
router.delete('/record/:id', plantingController.deleteRecord);

module.exports = router;
