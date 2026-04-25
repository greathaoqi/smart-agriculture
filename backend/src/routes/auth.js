const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// 登录
router.post('/login', authController.login);

// 退出登录
router.post('/logout', authController.logout);

// 获取当前用户信息（需要认证）
router.get('/me', require('../middlewares/auth').auth, authController.getCurrentUser);

// 修改密码
router.put('/password', require('../middlewares/auth').auth, authController.changePassword);

module.exports = router;
