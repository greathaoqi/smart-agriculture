const { Task, Farm, User, sequelize } = require('../models');
const { Op } = require('sequelize');

exports.getList = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, keyword, status, priority, assignee, farm_id } = req.query;
    const offset = (page - 1) * pageSize;

    const where = {};
    if (keyword) {
      where.title = { [Op.like]: `%${keyword}%` };
    }
    if (status !== undefined) {
      where.status = status;
    }
    if (priority !== undefined) {
      where.priority = priority;
    }
    if (assignee) {
      where.assignee = { [Op.like]: `%${assignee}%` };
    }
    if (farm_id) {
      where.farm_id = farm_id;
    }

    const { count, rows } = await Task.findAndCountAll({
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
    console.error('获取任务列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.getById = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id, {
      include: [
        { model: Farm, as: 'farm' }
      ]
    });

    if (!task) {
      return res.status(404).json({ message: '任务不存在' });
    }

    res.json({ data: task });
  } catch (error) {
    console.error('获取任务详情错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.create = async (req, res) => {
  try {
    const task = await Task.create(req.body);
    res.status(201).json({ message: '创建成功', data: task });
  } catch (error) {
    console.error('创建任务错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.update = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) {
      return res.status(404).json({ message: '任务不存在' });
    }
    await task.update(req.body);
    res.json({ message: '更新成功', data: task });
  } catch (error) {
    console.error('更新任务错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.delete = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) {
      return res.status(404).json({ message: '任务不存在' });
    }
    await task.destroy();
    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除任务错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const task = await Task.findByPk(req.params.id);

    if (!task) {
      return res.status(404).json({ message: '任务不存在' });
    }

    await task.update({ status });
    res.json({ message: '状态更新成功', data: task });
  } catch (error) {
    console.error('更新任务状态错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.getStats = async (req, res) => {
  try {
    const statusCounts = await Task.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status']
    });

    const priorityCounts = await Task.findAll({
      attributes: [
        'priority',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['priority']
    });

    const overdueCount = await Task.count({
      where: {
        status: { [Op.ne]: 2 },
        due_date: { [Op.lt]: new Date() }
      }
    });

    res.json({
      data: {
        statusCounts,
        priorityCounts,
        overdueCount
      }
    });
  } catch (error) {
    console.error('获取任务统计错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};
