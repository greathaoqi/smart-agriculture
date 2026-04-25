const { PlantingPlan, PlantingRecord, Plot, Crop, Harvest, sequelize } = require('../models');
const { Op } = require('sequelize');

// 种植计划
exports.getPlanList = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, keyword, status, plot_id } = req.query;
    const offset = (page - 1) * pageSize;

    const where = {};
    if (keyword) {
      where.name = { [Op.like]: `%${keyword}%` };
    }
    if (status !== undefined) {
      where.status = status;
    }
    if (plot_id) {
      where.plot_id = plot_id;
    }

    const { count, rows } = await PlantingPlan.findAndCountAll({
      where,
      offset,
      limit: parseInt(pageSize),
      order: [['created_at', 'DESC']],
      include: [
        { model: Plot, as: 'plot', attributes: ['id', 'name', 'farm_id'] },
        { model: Crop, as: 'crop', attributes: ['id', 'name', 'variety'] }
      ]
    });

    res.json({ data: rows, total: count, page: parseInt(page), pageSize: parseInt(pageSize) });
  } catch (error) {
    console.error('获取种植计划列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.getPlanById = async (req, res) => {
  try {
    const plan = await PlantingPlan.findByPk(req.params.id, {
      include: [
        { model: Plot, as: 'plot' },
        { model: Crop, as: 'crop' },
        { model: PlantingRecord, as: 'records', order: [['date', 'DESC']] },
        { model: Harvest, as: 'harvests', order: [['harvest_date', 'DESC']] }
      ]
    });

    if (!plan) {
      return res.status(404).json({ message: '种植计划不存在' });
    }

    res.json({ data: plan });
  } catch (error) {
    console.error('获取种植计划详情错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.createPlan = async (req, res) => {
  try {
    const plan = await PlantingPlan.create(req.body);
    res.status(201).json({ message: '创建成功', data: plan });
  } catch (error) {
    console.error('创建种植计划错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.updatePlan = async (req, res) => {
  try {
    const plan = await PlantingPlan.findByPk(req.params.id);
    if (!plan) {
      return res.status(404).json({ message: '种植计划不存在' });
    }
    await plan.update(req.body);
    res.json({ message: '更新成功', data: plan });
  } catch (error) {
    console.error('更新种植计划错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.deletePlan = async (req, res) => {
  try {
    const plan = await PlantingPlan.findByPk(req.params.id);
    if (!plan) {
      return res.status(404).json({ message: '种植计划不存在' });
    }
    await plan.destroy();
    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除种植计划错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 种植记录
exports.getRecordList = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, plan_id } = req.query;
    const offset = (page - 1) * pageSize;

    const where = {};
    if (plan_id) {
      where.plan_id = plan_id;
    }

    const { count, rows } = await PlantingRecord.findAndCountAll({
      where,
      offset,
      limit: parseInt(pageSize),
      order: [['date', 'DESC']],
      include: [
        { model: PlantingPlan, as: 'plan', attributes: ['id', 'name'] }
      ]
    });

    res.json({ data: rows, total: count, page: parseInt(page), pageSize: parseInt(pageSize) });
  } catch (error) {
    console.error('获取种植记录列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.createRecord = async (req, res) => {
  try {
    const record = await PlantingRecord.create(req.body);
    res.status(201).json({ message: '创建成功', data: record });
  } catch (error) {
    console.error('创建种植记录错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.updateRecord = async (req, res) => {
  try {
    const record = await PlantingRecord.findByPk(req.params.id);
    if (!record) {
      return res.status(404).json({ message: '种植记录不存在' });
    }
    await record.update(req.body);
    res.json({ message: '更新成功', data: record });
  } catch (error) {
    console.error('更新种植记录错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.deleteRecord = async (req, res) => {
  try {
    const record = await PlantingRecord.findByPk(req.params.id);
    if (!record) {
      return res.status(404).json({ message: '种植记录不存在' });
    }
    await record.destroy();
    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除种植记录错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};
