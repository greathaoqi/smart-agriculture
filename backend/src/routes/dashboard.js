const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { auth } = require('../middlewares/auth');

// 所有路由需要认证
router.use(auth);

// 获取仪表盘统计数据
router.get('/stats', dashboardController.getStats);

// 获取产量趋势
router.get('/yield-trend', dashboardController.getYieldTrend);

// 获取作物分布
router.get('/crop-distribution', dashboardController.getCropDistribution);

// 获取设备状态
router.get('/device-status', dashboardController.getDeviceStatus);

// 获取最近告警
router.get('/recent-alerts', dashboardController.getRecentAlerts);

// 获取待办任务
router.get('/pending-tasks', dashboardController.getPendingTasks);

module.exports = router;
