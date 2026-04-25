const express = require('express');
const router = express.Router();
const farmController = require('../controllers/farmController');
const { auth } = require('../middlewares/auth');

// 所有路由需要认证
router.use(auth);

// 获取农场统计
router.get('/:id/stats', farmController.getStats);

// 获取农场列表
router.get('/', farmController.getList);

// 获取农场详情
router.get('/:id', farmController.getById);

// 创建农场
router.post('/', farmController.create);

// 更新农场
router.put('/:id', farmController.update);

// 删除农场
router.delete('/:id', farmController.delete);

module.exports = router;
