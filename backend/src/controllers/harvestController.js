const { Harvest, PlantingPlan, Plot, Crop, sequelize } = require('../models');
const { Op } = require('sequelize');

exports.getList = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, keyword, plan_id, start_date, end_date } = req.query;
    const offset = (page - 1) * pageSize;

    const where = {};
    if (plan_id) {
      where.plan_id = plan_id;
    }
    if (start_date && end_date) {
      where.harvest_date = { [Op.between]: [start_date, end_date] };
    }

    const { count, rows } = await Harvest.findAndCountAll({
      where,
      offset,
      limit: parseInt(pageSize),
      order: [['harvest_date', 'DESC']],
      include: [
        {
          model: PlantingPlan,
          as: 'plan',
          include: [
            { model: Plot, as: 'plot', attributes: ['id', 'name'] },
            { model: Crop, as: 'crop', attributes: ['id', 'name', 'variety'] }
          ]
        }
      ]
    });

    res.json({ data: rows, total: count, page: parseInt(page), pageSize: parseInt(pageSize) });
  } catch (error) {
    console.error('获取采收记录列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.getById = async (req, res) => {
  try {
    const harvest = await Harvest.findByPk(req.params.id, {
      include: [
        {
          model: PlantingPlan,
          as: 'plan',
          include: [
            { model: Plot, as: 'plot' },
            { model: Crop, as: 'crop' }
          ]
        }
      ]
    });

    if (!harvest) {
      return res.status(404).json({ message: '采收记录不存在' });
    }

    res.json({ data: harvest });
  } catch (error) {
    console.error('获取采收记录详情错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.create = async (req, res) => {
  try {
    const harvest = await Harvest.create(req.body);
    res.status(201).json({ message: '创建成功', data: harvest });
  } catch (error) {
    console.error('创建采收记录错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.update = async (req, res) => {
  try {
    const harvest = await Harvest.findByPk(req.params.id);
    if (!harvest) {
      return res.status(404).json({ message: '采收记录不存在' });
    }
    await harvest.update(req.body);
    res.json({ message: '更新成功', data: harvest });
  } catch (error) {
    console.error('更新采收记录错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.delete = async (req, res) => {
  try {
    const harvest = await Harvest.findByPk(req.params.id);
    if (!harvest) {
      return res.status(404).json({ message: '采收记录不存在' });
    }
    await harvest.destroy();
    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除采收记录错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.getStats = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const where = {};

    if (start_date && end_date) {
      where.harvest_date = { [Op.between]: [start_date, end_date] };
    }

    const totalYield = await Harvest.sum('yield', { where }) || 0;
    const totalCount = await Harvest.count({ where });

    const yieldByCrop = await Harvest.findAll({
      where,
      attributes: [
        [sequelize.fn('SUM', sequelize.col('yield')), 'total_yield']
      ],
      include: [{
        model: PlantingPlan,
        as: 'plan',
        attributes: [],
        include: [{
          model: Crop,
          as: 'crop',
          attributes: ['name']
        }]
      }],
      group: ['plan.crop.id'],
      raw: true
    });

    res.json({
      data: {
        totalYield,
        totalCount,
        yieldByCrop
      }
    });
  } catch (error) {
    console.error('获取采收统计错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};
