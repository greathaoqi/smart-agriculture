const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');
const { auth } = require('../middlewares/auth');

// 所有路由需要认证
router.use(auth);

// 获取设备统计
router.get('/stats', deviceController.getStats);

// 获取设备数据历史
router.get('/:id/history', deviceController.getDataHistory);

// 获取设备实时数据
router.get('/:id/latest', deviceController.getLatestData);

// 获取设备列表
router.get('/', deviceController.getList);

// 获取设备详情
router.get('/:id', deviceController.getById);

// 创建设备
router.post('/', deviceController.create);

// 更新设备
router.put('/:id', deviceController.update);

// 删除设备
router.delete('/:id', deviceController.delete);

module.exports = router;
