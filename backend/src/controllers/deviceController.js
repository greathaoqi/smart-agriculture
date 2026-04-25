const { Device, DeviceData, Farm, sequelize } = require('../models');
const { Op } = require('sequelize');

// 获取设备列表
exports.getList = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, keyword, type, status, farm_id } = req.query;
    const offset = (page - 1) * pageSize;

    const where = {};
    if (keyword) {
      where[Op.or] = [
        { name: { [Op.like]: `%${keyword}%` } },
        { code: { [Op.like]: `%${keyword}%` } }
      ];
    }
    if (type) where.type = type;
    if (status !== undefined) where.status = status;
    if (farm_id) where.farm_id = farm_id;

    const { count, rows } = await Device.findAndCountAll({
      where,
      include: [{ model: Farm, as: 'farm', attributes: ['id', 'name'] }],
      offset,
      limit: parseInt(pageSize),
      order: [['created_at', 'DESC']]
    });

    res.json({
      data: rows,
      total: count,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    });
  } catch (error) {
    console.error('获取设备列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 获取设备详情
exports.getById = async (req, res) => {
  try {
    const device = await Device.findByPk(req.params.id, {
      include: [{ model: Farm, as: 'farm' }]
    });

    if (!device) {
      return res.status(404).json({ message: '设备不存在' });
    }

    res.json({ data: device });
  } catch (error) {
    console.error('获取设备详情错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 创建设备
exports.create = async (req, res) => {
  try {
    const device = await Device.create(req.body);
    res.status(201).json({ message: '创建成功', data: device });
  } catch (error) {
    console.error('创建设备错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 更新设备
exports.update = async (req, res) => {
  try {
    const device = await Device.findByPk(req.params.id);
    if (!device) {
      return res.status(404).json({ message: '设备不存在' });
    }

    await device.update(req.body);
    res.json({ message: '更新成功', data: device });
  } catch (error) {
    console.error('更新设备错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 删除设备
exports.delete = async (req, res) => {
  try {
    const device = await Device.findByPk(req.params.id);
    if (!device) {
      return res.status(404).json({ message: '设备不存在' });
    }

    await device.destroy();
    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除设备错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 获取设备数据历史
exports.getDataHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const { start_time, end_time, limit = 100 } = req.query;

    const where = { device_id: id };

    if (start_time || end_time) {
      where.created_at = {};
      if (start_time) where.created_at[Op.gte] = new Date(start_time);
      if (end_time) where.created_at[Op.lte] = new Date(end_time);
    }

    const data = await DeviceData.findAll({
      where,
      limit: parseInt(limit),
      order: [['created_at', 'DESC']]
    });

    res.json({ data });
  } catch (error) {
    console.error('获取设备数据历史错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 获取设备实时数据
exports.getLatestData = async (req, res) => {
  try {
    const { id } = req.params;

    const latestData = await DeviceData.findOne({
      where: { device_id: id },
      order: [['created_at', 'DESC']]
    });

    res.json({ data: latestData });
  } catch (error) {
    console.error('获取设备实时数据错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 获取设备统计
exports.getStats = async (req, res) => {
  try {
    const [total, online, offline, fault] = await Promise.all([
      Device.count(),
      Device.count({ where: { status: 1 } }),
      Device.count({ where: { status: 0 } }),
      Device.count({ where: { status: 2 } })
    ]);

    res.json({
      data: { total, online, offline, fault }
    });
  } catch (error) {
    console.error('获取设备统计错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};
