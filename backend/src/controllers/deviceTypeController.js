const { DeviceType, Device, sequelize } = require('../models');
const { Op } = require('sequelize');

exports.getList = async (req, res) => {
  try {
    const { page = 1, pageSize = 20, keyword, category, status } = req.query;
    const offset = (page - 1) * pageSize;
    const where = {};
    if (keyword) {
      where[Op.or] = [
        { name: { [Op.like]: `%${keyword}%` } },
        { code: { [Op.like]: `%${keyword}%` } }
      ];
    }
    if (category) where.category = category;
    if (status !== undefined) where.status = status;

    const { count, rows } = await DeviceType.findAndCountAll({
      where,
      offset,
      limit: parseInt(pageSize),
      order: [['created_at', 'DESC']]
    });

    res.json({ data: rows, total: count, page: parseInt(page), pageSize: parseInt(pageSize) });
  } catch (error) {
    console.error('获取设备类型列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.getById = async (req, res) => {
  try {
    const item = await DeviceType.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: '设备类型不存在' });
    res.json({ data: item });
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.create = async (req, res) => {
  try {
    const item = await DeviceType.create(req.body);
    res.status(201).json({ message: '创建成功', data: item });
  } catch (error) {
    console.error('创建设备类型错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.update = async (req, res) => {
  try {
    const item = await DeviceType.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: '设备类型不存在' });
    await item.update(req.body);
    res.json({ message: '更新成功', data: item });
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.delete = async (req, res) => {
  try {
    const deviceCount = await Device.count({ where: { device_type_id: req.params.id } });
    if (deviceCount > 0) {
      return res.status(400).json({ message: '该设备类型下有关联设备，无法删除' });
    }
    const item = await DeviceType.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: '设备类型不存在' });
    await item.destroy();
    res.json({ message: '删除成功' });
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
};
