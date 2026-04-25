const { Farm, Plot, Device, sequelize } = require('../models');
const { Op } = require('sequelize');

// 获取农场列表
exports.getList = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, keyword, status } = req.query;
    const offset = (page - 1) * pageSize;

    const where = {};
    if (keyword) {
      where[Op.or] = [
        { name: { [Op.like]: `%${keyword}%` } },
        { code: { [Op.like]: `%${keyword}%` } }
      ];
    }
    if (status !== undefined) {
      where.status = status;
    }

    const { count, rows } = await Farm.findAndCountAll({
      where,
      offset,
      limit: parseInt(pageSize),
      order: [['created_at', 'DESC']],
      include: [{
        model: Plot,
        as: 'plots',
        attributes: ['id']
      }]
    });

    const data = rows.map(farm => ({
      ...farm.toJSON(),
      plot_count: farm.plots?.length || 0
    }));

    res.json({
      data,
      total: count,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    });
  } catch (error) {
    console.error('获取农场列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 获取农场详情
exports.getById = async (req, res) => {
  try {
    const farm = await Farm.findByPk(req.params.id, {
      include: [
        { model: Plot, as: 'plots' },
        { model: Device, as: 'devices' }
      ]
    });

    if (!farm) {
      return res.status(404).json({ message: '农场不存在' });
    }

    res.json({ data: farm });
  } catch (error) {
    console.error('获取农场详情错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 创建农场
exports.create = async (req, res) => {
  try {
    const farm = await Farm.create(req.body);
    res.status(201).json({ message: '创建成功', data: farm });
  } catch (error) {
    console.error('创建农场错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 更新农场
exports.update = async (req, res) => {
  try {
    const farm = await Farm.findByPk(req.params.id);
    if (!farm) {
      return res.status(404).json({ message: '农场不存在' });
    }

    await farm.update(req.body);
    res.json({ message: '更新成功', data: farm });
  } catch (error) {
    console.error('更新农场错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 删除农场
exports.delete = async (req, res) => {
  try {
    const farm = await Farm.findByPk(req.params.id);
    if (!farm) {
      return res.status(404).json({ message: '农场不存在' });
    }

    await farm.destroy();
    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除农场错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 获取农场统计
exports.getStats = async (req, res) => {
  try {
    const farmId = req.params.id;

    const [plotCount, deviceCount, activeDevices] = await Promise.all([
      Plot.count({ where: { farm_id: farmId } }),
      Device.count({ where: { farm_id: farmId } }),
      Device.count({ where: { farm_id: farmId, status: 1 } })
    ]);

    res.json({
      data: {
        plotCount,
        deviceCount,
        activeDevices
      }
    });
  } catch (error) {
    console.error('获取农场统计错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};
