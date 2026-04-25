const { Crop } = require('../models');
const { Op } = require('sequelize');

exports.getList = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, keyword } = req.query;
    const offset = (page - 1) * pageSize;

    const where = {};
    if (keyword) {
      where[Op.or] = [
        { name: { [Op.like]: `%${keyword}%` } },
        { variety: { [Op.like]: `%${keyword}%` } }
      ];
    }

    const { count, rows } = await Crop.findAndCountAll({
      where,
      offset,
      limit: parseInt(pageSize),
      order: [['created_at', 'DESC']]
    });

    res.json({ data: rows, total: count, page: parseInt(page), pageSize: parseInt(pageSize) });
  } catch (error) {
    console.error('获取作物列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.getAll = async (req, res) => {
  try {
    const crops = await Crop.findAll({
      order: [['name', 'ASC']]
    });
    res.json({ data: crops });
  } catch (error) {
    console.error('获取作物列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.getById = async (req, res) => {
  try {
    const crop = await Crop.findByPk(req.params.id);
    if (!crop) {
      return res.status(404).json({ message: '作物不存在' });
    }
    res.json({ data: crop });
  } catch (error) {
    console.error('获取作物详情错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.create = async (req, res) => {
  try {
    const crop = await Crop.create(req.body);
    res.status(201).json({ message: '创建成功', data: crop });
  } catch (error) {
    console.error('创建作物错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.update = async (req, res) => {
  try {
    const crop = await Crop.findByPk(req.params.id);
    if (!crop) {
      return res.status(404).json({ message: '作物不存在' });
    }
    await crop.update(req.body);
    res.json({ message: '更新成功', data: crop });
  } catch (error) {
    console.error('更新作物错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.delete = async (req, res) => {
  try {
    const crop = await Crop.findByPk(req.params.id);
    if (!crop) {
      return res.status(404).json({ message: '作物不存在' });
    }
    await crop.destroy();
    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除作物错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};
