const { AlertRule, AlertMessage, Device, sequelize } = require('../models');
const { Op } = require('sequelize');

// --- 预警规则 ---

exports.getRules = async (req, res) => {
  try {
    const { page = 1, pageSize = 20, keyword, status, level } = req.query;
    const offset = (page - 1) * pageSize;
    const where = {};
    if (keyword) where.name = { [Op.like]: `%${keyword}%` };
    if (status !== undefined) where.status = status;
    if (level) where.level = level;

    const { count, rows } = await AlertRule.findAndCountAll({
      where,
      offset,
      limit: parseInt(pageSize),
      order: [['created_at', 'DESC']]
    });

    res.json({ data: rows, total: count, page: parseInt(page), pageSize: parseInt(pageSize) });
  } catch (error) {
    console.error('获取预警规则错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.createRule = async (req, res) => {
  try {
    const rule = await AlertRule.create(req.body);
    res.status(201).json({ message: '创建成功', data: rule });
  } catch (error) {
    console.error('创建预警规则错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.updateRule = async (req, res) => {
  try {
    const rule = await AlertRule.findByPk(req.params.id);
    if (!rule) return res.status(404).json({ message: '预警规则不存在' });
    await rule.update(req.body);
    res.json({ message: '更新成功', data: rule });
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.deleteRule = async (req, res) => {
  try {
    const rule = await AlertRule.findByPk(req.params.id);
    if (!rule) return res.status(404).json({ message: '预警规则不存在' });
    await rule.destroy();
    res.json({ message: '删除成功' });
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
};

// --- 预警消息 ---

exports.getMessages = async (req, res) => {
  try {
    const { page = 1, pageSize = 20, status, level, start_date, end_date } = req.query;
    const offset = (page - 1) * pageSize;
    const where = {};
    if (status) where.status = status;
    if (level) where.level = level;
    if (start_date || end_date) {
      where.created_at = {};
      if (start_date) where.created_at[Op.gte] = new Date(start_date);
      if (end_date) where.created_at[Op.lte] = new Date(end_date + ' 23:59:59');
    }

    const { count, rows } = await AlertMessage.findAndCountAll({
      where,
      include: [
        { model: Device, as: 'device', attributes: ['id', 'name'] },
        { model: AlertRule, as: 'rule', attributes: ['id', 'name'] }
      ],
      offset,
      limit: parseInt(pageSize),
      order: [['created_at', 'DESC']]
    });

    res.json({ data: rows, total: count, page: parseInt(page), pageSize: parseInt(pageSize) });
  } catch (error) {
    console.error('获取预警消息错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.markRead = async (req, res) => {
  try {
    await AlertMessage.update({ status: 'read' }, {
      where: { id: req.params.id }
    });
    res.json({ message: '已标记为已读' });
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.handle = async (req, res) => {
  try {
    const { note } = req.body;
    const msg = await AlertMessage.findByPk(req.params.id);
    if (!msg) return res.status(404).json({ message: '预警消息不存在' });
    await msg.update({
      status: 'handled',
      handler: req.user?.real_name || req.user?.username || 'system',
      handle_time: new Date(),
      handle_note: note
    });
    res.json({ message: '已处理' });
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const count = await AlertMessage.count({ where: { status: 'unread' } });
    res.json({ data: count });
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.getStats = async (req, res) => {
  try {
    const [total, unread, todayCount, severeCount] = await Promise.all([
      AlertMessage.count({ where: { created_at: { [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0)) } } }),
      AlertMessage.count({ where: { status: 'unread' } }),
      AlertMessage.count({ where: { created_at: { [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0)) } } }),
      AlertMessage.count({ where: { level: 3, status: { [Op.ne]: 'handled' } } })
    ]);

    const levelStats = await AlertMessage.findAll({
      attributes: ['level', [fn('COUNT', col('id')), 'count']],
      where: { created_at: { [Op.gte]: new Date(new Date().setDate(new Date().getDate() - 7)) } },
      group: ['level'],
      raw: true
    });

    res.json({ data: { total: todayCount, unread, severeCount, levelStats, ruleCount: await AlertRule.count({ where: { status: 1 } }) } });
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
};
