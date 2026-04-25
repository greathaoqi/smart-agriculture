const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth, checkPermission } = require('../middlewares/auth');

// 所有路由需要认证
router.use(auth);

// 获取当前用户信息
router.get('/me', userController.getCurrentUser);

// 更新当前用户信息
router.put('/me', userController.updateCurrentUser);

// 修改当前用户密码
router.put('/me/password', userController.changePassword);

// 获取用户列表
router.get('/', userController.getList);

// 获取单个用户
router.get('/:id', userController.getById);

// 创建用户
router.post('/', checkPermission('user:create'), userController.create);

// 更新用户
router.put('/:id', checkPermission('user:update'), userController.update);

// 删除用户
router.delete('/:id', checkPermission('user:delete'), userController.delete);

// 重置密码
router.put('/:id/password', checkPermission('user:update'), userController.resetPassword);

module.exports = router;
