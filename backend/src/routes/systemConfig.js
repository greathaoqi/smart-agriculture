const express = require('express')
const router = express.Router()
const systemConfigController = require('../controllers/systemConfig')
const { auth, checkPermission } = require('../middlewares/auth')

// 公开接口 - 前端获取公开配置
router.get('/public', systemConfigController.getPublicConfig)

// 管理接口 - 需要登录和管理员权限
router.get('/', auth, checkPermission('system:*'), systemConfigController.getAllConfig)
router.post('/', auth, checkPermission('system:*'), systemConfigController.createConfig)
router.put('/:key', auth, checkPermission('system:*'), systemConfigController.updateConfig)
router.delete('/:key', auth, checkPermission('system:*'), systemConfigController.deleteConfig)

module.exports = router