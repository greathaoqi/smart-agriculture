const { SystemConfig } = require('../models')

// 获取公开配置（前端可访问）
const getPublicConfig = async (req, res) => {
  try {
    const { keys } = req.query
    let whereClause = { is_public: 1 }

    if (keys) {
      const keyArray = keys.split(',').map(k => k.trim())
      whereClause.config_key = keyArray
    }

    const configs = await SystemConfig.findAll({
      where: whereClause,
      attributes: ['config_key', 'config_value', 'config_type']
    })

    const result = {}
    configs.forEach(c => {
      let value = c.config_value
      if (c.config_type === 'number') {
        value = parseFloat(value)
      }
      result[c.config_key] = value
    })

    res.json({ data: result })
  } catch (error) {
    console.error('获取公开配置失败:', error)
    res.status(500).json({ message: '获取配置失败' })
  }
}

// 获取所有配置（管理员）
const getAllConfig = async (req, res) => {
  try {
    const configs = await SystemConfig.findAll({
      order: [['id', 'ASC']]
    })
    res.json({ data: configs })
  } catch (error) {
    console.error('获取所有配置失败:', error)
    res.status(500).json({ message: '获取配置失败' })
  }
}

// 更新配置（管理员）
const updateConfig = async (req, res) => {
  try {
    const { key } = req.params
    const { value } = req.body

    const config = await SystemConfig.findOne({
      where: { config_key: key }
    })

    if (!config) {
      return res.status(404).json({ message: '配置项不存在' })
    }

    await config.update({ config_value: value })
    res.json({ data: config, message: '配置已更新' })
  } catch (error) {
    console.error('更新配置失败:', error)
    res.status(500).json({ message: '更新配置失败' })
  }
}

// 新增配置（管理员）
const createConfig = async (req, res) => {
  try {
    const { config_key, config_value, config_type, description, is_public } = req.body

    if (!config_key) {
      return res.status(400).json({ message: '配置键名不能为空' })
    }

    const existing = await SystemConfig.findOne({
      where: { config_key }
    })

    if (existing) {
      return res.status(400).json({ message: '配置键名已存在' })
    }

    const config = await SystemConfig.create({
      config_key,
      config_value,
      config_type: config_type || 'string',
      description,
      is_public: is_public || 0
    })

    res.json({ data: config, message: '配置已创建' })
  } catch (error) {
    console.error('创建配置失败:', error)
    res.status(500).json({ message: '创建配置失败' })
  }
}

// 删除配置（管理员）
const deleteConfig = async (req, res) => {
  try {
    const { key } = req.params

    const config = await SystemConfig.findOne({
      where: { config_key: key }
    })

    if (!config) {
      return res.status(404).json({ message: '配置项不存在' })
    }

    await config.destroy()
    res.json({ message: '配置已删除' })
  } catch (error) {
    console.error('删除配置失败:', error)
    res.status(500).json({ message: '删除配置失败' })
  }
}

module.exports = {
  getPublicConfig,
  getAllConfig,
  updateConfig,
  createConfig,
  deleteConfig
}