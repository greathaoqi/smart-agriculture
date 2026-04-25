const { Greenhouse, Farm, Device, DeviceData, sequelize } = require('../models');
const { Op } = require('sequelize');

exports.getList = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, keyword, farm_id, status } = req.query;
    const offset = (page - 1) * pageSize;
    const where = {};
    if (keyword) where.name = { [Op.like]: `%${keyword}%` };
    if (farm_id) where.farm_id = farm_id;
    if (status !== undefined) where.status = status;

    const { count, rows } = await Greenhouse.findAndCountAll({
      where,
      include: [
        { model: Farm, as: 'farm', attributes: ['id', 'name'] },
        { model: Device, as: 'devices', attributes: ['id', 'name', 'status', 'type'] }
      ],
      offset,
      limit: parseInt(pageSize),
      order: [['created_at', 'DESC']]
    });

    res.json({ data: rows, total: count, page: parseInt(page), pageSize: parseInt(pageSize) });
  } catch (error) {
    console.error('获取温棚列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.getById = async (req, res) => {
  try {
    const item = await Greenhouse.findByPk(req.params.id, {
      include: [
        { model: Farm, as: 'farm' },
        { model: Device, as: 'devices', where: { type: 'sensor' }, required: false }
      ]
    });
    if (!item) return res.status(404).json({ message: '温棚不存在' });
    res.json({ data: item });
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.create = async (req, res) => {
  try {
    const item = await Greenhouse.create(req.body);
    res.status(201).json({ message: '创建成功', data: item });
  } catch (error) {
    console.error('创建温棚错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.update = async (req, res) => {
  try {
    const item = await Greenhouse.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: '温棚不存在' });
    await item.update(req.body);
    res.json({ message: '更新成功', data: item });
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.delete = async (req, res) => {
  try {
    const item = await Greenhouse.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: '温棚不存在' });
    await item.destroy();
    res.json({ message: '删除成功' });
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.getEnvironment = async (req, res) => {
  try {
    const { id } = req.params;
    const { hours = 24 } = req.query;

    const sensors = await Device.findAll({
      where: { greenhouse_id: id, type: 'sensor', status: 1 },
      attributes: ['id', 'name', 'type']
    });

    const deviceIds = sensors.map(s => s.id);

    let envData = [];
    if (deviceIds.length > 0) {
      const startTime = new Date();
      startTime.setHours(startTime.getHours() - parseInt(hours));

      envData = await DeviceData.findAll({
        where: {
          device_id: { [Op.in]: deviceIds },
          created_at: { [Op.gte]: startTime }
        },
        order: [['created_at', 'DESC']],
        limit: 288
      });
    }

    const latest = envData.length > 0 ? envData[0] : null;

    res.json({
      data: {
        sensors,
        latest,
        history: envData.reverse()
      }
    });
  } catch (error) {
    console.error('获取温棚环境数据错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.control = async (req, res) => {
  try {
    const { id } = req.params;
    const { device_id, command, params } = req.body;

    const device = await Device.findOne({ where: { id: device_id, greenhouse_id: id } });
    if (!device) return res.status(404).json({ message: '设备不存在' });

    // 模拟发送控制命令
    res.json({
      message: '控制命令已发送',
      data: {
        device_id,
        command,
        params,
        status: 'success',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.getStats = async (req, res) => {
  try {
    const [total, normal, stopped] = await Promise.all([
      Greenhouse.count(),
      Greenhouse.count({ where: { status: 1 } }),
      Greenhouse.count({ where: { status: 0 } })
    ]);

    res.json({ data: { total, normal, stopped } });
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
};
