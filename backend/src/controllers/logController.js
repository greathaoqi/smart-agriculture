const { OperationLog, User } = require('../models');
const { Op } = require('sequelize');

exports.getList = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, keyword, module, action, user_id, start_date, end_date } = req.query;
    const offset = (page - 1) * pageSize;

    const where = {};
    if (keyword) {
      where.description = { [Op.like]: `%${keyword}%` };
    }
    if (module) {
      where.module = module;
    }
    if (action) {
      where.action = action;
    }
    if (user_id) {
      where.user_id = user_id;
    }
    if (start_date && end_date) {
      where.created_at = { [Op.between]: [start_date + ' 00:00:00', end_date + ' 23:59:59'] };
    }

    const { count, rows } = await OperationLog.findAndCountAll({
      where,
      offset,
      limit: parseInt(pageSize),
      order: [['created_at', 'DESC']],
      include: [
        { model: User, as: 'user', attributes: ['id', 'username', 'real_name'] }
      ]
    });

    res.json({ data: rows, total: count, page: parseInt(page), pageSize: parseInt(pageSize) });
  } catch (error) {
    console.error('获取操作日志列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.getById = async (req, res) => {
  try {
    const log = await OperationLog.findByPk(req.params.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'username', 'real_name'] }
      ]
    });

    if (!log) {
      return res.status(404).json({ message: '日志记录不存在' });
    }

    res.json({ data: log });
  } catch (error) {
    console.error('获取操作日志详情错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.getModules = async (req, res) => {
  try {
    const modules = await OperationLog.findAll({
      attributes: ['module'],
      group: ['module'],
      order: [['module', 'ASC']]
    });
    res.json({ data: modules.map(m => m.module) });
  } catch (error) {
    console.error('获取模块列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.getActions = async (req, res) => {
  try {
    const actions = await OperationLog.findAll({
      attributes: ['action'],
      group: ['action'],
      order: [['action', 'ASC']]
    });
    res.json({ data: actions.map(a => a.action) });
  } catch (error) {
    console.error('获取操作类型列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.getStats = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const where = {};

    if (start_date && end_date) {
      where.created_at = { [Op.between]: [start_date + ' 00:00:00', end_date + ' 23:59:59'] };
    }

    const totalCount = await OperationLog.count({ where });

    const moduleCounts = await OperationLog.findAll({
      where,
      attributes: [
        'module',
        [OperationLog.sequelize.fn('COUNT', OperationLog.sequelize.col('id')), 'count']
      ],
      group: ['module'],
      order: [[OperationLog.sequelize.literal('count'), 'DESC']]
    });

    const actionCounts = await OperationLog.findAll({
      where,
      attributes: [
        'action',
        [OperationLog.sequelize.fn('COUNT', OperationLog.sequelize.col('id')), 'count']
      ],
      group: ['action'],
      order: [[OperationLog.sequelize.literal('count'), 'DESC']]
    });

    res.json({
      data: {
        totalCount,
        moduleCounts,
        actionCounts
      }
    });
  } catch (error) {
    console.error('获取日志统计错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};
