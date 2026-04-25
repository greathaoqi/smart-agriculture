const { Plot, Farm, PlantingPlan, Device } = require('../models');
const { Op } = require('sequelize');

exports.getList = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, keyword, status, farm_id } = req.query;
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
    if (farm_id) {
      where.farm_id = farm_id;
    }

    const { count, rows } = await Plot.findAndCountAll({
      where,
      offset,
      limit: parseInt(pageSize),
      order: [['created_at', 'DESC']],
      include: [
        { model: Farm, as: 'farm', attributes: ['id', 'name'] }
      ]
    });

    res.json({ data: rows, total: count, page: parseInt(page), pageSize: parseInt(pageSize) });
  } catch (error) {
    console.error('获取地块列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.getById = async (req, res) => {
  try {
    const plot = await Plot.findByPk(req.params.id, {
      include: [
        { model: Farm, as: 'farm' },
        { model: PlantingPlan, as: 'plans', limit: 5, order: [['created_at', 'DESC']] }
      ]
    });

    if (!plot) {
      return res.status(404).json({ message: '地块不存在' });
    }

    res.json({ data: plot });
  } catch (error) {
    console.error('获取地块详情错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.create = async (req, res) => {
  try {
    const plot = await Plot.create(req.body);
    res.status(201).json({ message: '创建成功', data: plot });
  } catch (error) {
    console.error('创建地块错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.update = async (req, res) => {
  try {
    const plot = await Plot.findByPk(req.params.id);
    if (!plot) {
      return res.status(404).json({ message: '地块不存在' });
    }

    await plot.update(req.body);
    res.json({ message: '更新成功', data: plot });
  } catch (error) {
    console.error('更新地块错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.delete = async (req, res) => {
  try {
    const plot = await Plot.findByPk(req.params.id);
    if (!plot) {
      return res.status(404).json({ message: '地块不存在' });
    }

    await plot.destroy();
    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除地块错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.getByFarm = async (req, res) => {
  try {
    const plots = await Plot.findAll({
      where: { farm_id: req.params.farmId },
      order: [['created_at', 'DESC']]
    });
    res.json({ data: plots });
  } catch (error) {
    console.error('获取农场地块错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};
