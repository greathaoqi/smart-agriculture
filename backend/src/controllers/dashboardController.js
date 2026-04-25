const { Farm, Plot, Device, DeviceData, PlantingPlan, Order, Task, Crop, Warehouse, sequelize } = require('../models');
const { Op } = require('sequelize');

// 获取仪表盘统计数据
exports.getStats = async (req, res) => {
  try {
    // 并行获取各项统计
    const [
      farmCount,
      plotCount,
      deviceCount,
      onlineDeviceCount,
      totalYield,
      totalSales,
      pendingTasks,
      cropCount,
      warehouseCount
    ] = await Promise.all([
      Farm.count({ where: { status: 1 } }),
      Plot.count(),
      Device.count(),
      Device.count({ where: { status: 1 } }),
      PlantingPlan.sum('planned_yield', { where: { status: 2 } }) || 0,
      Order.sum('total_amount', { where: { status: 3 } }) || 0,
      Task.count({ where: { status: { [Op.in]: [0, 1] } } }),
      Crop.count(),
      Warehouse.count()
    ]);

    res.json({
      data: {
        farmCount,
        plotCount,
        deviceCount,
        onlineDeviceCount,
        totalYield,
        totalSales,
        pendingTasks,
        cropCount,
        warehouseCount
      }
    });
  } catch (error) {
    console.error('获取统计数据错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 获取产量趋势数据
exports.getYieldTrend = async (req, res) => {
  try {
    const { months = 6 } = req.query;

    // 获取最近N个月的产量数据
    const result = await sequelize.query(`
      SELECT
        DATE_FORMAT(harvest_date, '%Y-%m') as month,
        SUM(yield) as total_yield
      FROM harvests
      WHERE harvest_date >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
      GROUP BY DATE_FORMAT(harvest_date, '%Y-%m')
      ORDER BY month ASC
    `, {
      replacements: [parseInt(months)],
      type: sequelize.QueryTypes.SELECT
    });

    res.json({ data: result });
  } catch (error) {
    console.error('获取产量趋势错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 获取作物分布数据
exports.getCropDistribution = async (req, res) => {
  try {
    const result = await sequelize.query(`
      SELECT
        c.name as crop_name,
        COUNT(pp.id) as plan_count,
        SUM(pp.planned_area) as total_area
      FROM planting_plans pp
      JOIN crops c ON pp.crop_id = c.id
      WHERE pp.status IN (0, 1)
      GROUP BY c.id, c.name
      ORDER BY plan_count DESC
      LIMIT 10
    `, {
      type: sequelize.QueryTypes.SELECT
    });

    res.json({ data: result });
  } catch (error) {
    console.error('获取作物分布错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 获取设备状态分布
exports.getDeviceStatus = async (req, res) => {
  try {
    const [online, offline, fault] = await Promise.all([
      Device.count({ where: { status: 1 } }),
      Device.count({ where: { status: 0 } }),
      Device.count({ where: { status: 2 } })
    ]);

    res.json({
      data: [
        { name: '在线', value: online },
        { name: '离线', value: offline },
        { name: '故障', value: fault }
      ]
    });
  } catch (error) {
    console.error('获取设备状态错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 获取最近告警/设备数据
exports.getRecentAlerts = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // 获取最近的异常设备（离线或故障）
    const devices = await Device.findAll({
      where: { status: { [Op.in]: [0, 2] } },
      include: [{ model: Farm, as: 'farm', attributes: ['name'] }],
      limit: parseInt(limit),
      order: [['updated_at', 'DESC']]
    });

    const alerts = devices.map(d => ({
      id: d.id,
      type: d.status === 2 ? '故障' : '离线',
      device: d.name,
      farm: d.farm?.name || '-',
      time: d.updated_at
    }));

    res.json({ data: alerts });
  } catch (error) {
    console.error('获取最近告警错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 获取待办任务
exports.getPendingTasks = async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const tasks = await Task.findAll({
      where: { status: { [Op.in]: [0, 1] } },
      limit: parseInt(limit),
      order: [['priority', 'DESC'], ['due_date', 'ASC']]
    });

    res.json({ data: tasks });
  } catch (error) {
    console.error('获取待办任务错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};
