const { Device, DeviceData, sequelize } = require('../models');
const { Op, fn, col, literal } = require('sequelize');

exports.getCurrent = async (req, res) => {
  try {
    const weatherDevices = await Device.findAll({
      where: { type: 'weather_station', status: 1 }
    });

    let currentData = null;
    if (weatherDevices.length > 0) {
      const deviceIds = weatherDevices.map(d => d.id);
      currentData = await DeviceData.findOne({
        where: { device_id: { [Op.in]: deviceIds } },
        order: [['created_at', 'DESC']]
      });
    }

    // Generate simulated data if no real devices
    if (!currentData) {
      const now = new Date();
      const hour = now.getHours();
      currentData = {
        id: 0,
        temperature: (18 + Math.sin((hour - 6) * Math.PI / 12) * 8 + (Math.random() * 2 - 1)).toFixed(1),
        humidity: (60 + Math.random() * 20).toFixed(0),
        wind_speed: (2 + Math.random() * 6).toFixed(1),
        light_intensity: Math.round(hour >= 6 && hour <= 18 ? 10000 + Math.random() * 50000 : 0),
        rainfall: (Math.random() * 5).toFixed(1),
        co2: Math.round(350 + Math.random() * 200),
        created_at: now
      };
    }

    res.json({ data: currentData });
  } catch (error) {
    console.error('获取气象数据错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const { hours = 24 } = req.query;
    const startTime = new Date();
    startTime.setHours(startTime.getHours() - parseInt(hours));

    const weatherDevices = await Device.findAll({
      where: { type: 'weather_station', status: 1 },
      attributes: ['id']
    });

    let data = [];
    if (weatherDevices.length > 0) {
      const deviceIds = weatherDevices.map(d => d.id);
      data = await DeviceData.findAll({
        where: {
          device_id: { [Op.in]: deviceIds },
          created_at: { [Op.gte]: startTime }
        },
        order: [['created_at', 'ASC']],
        limit: 288
      });
    }

    // Generate simulated hourly data if no real devices
    if (data.length === 0) {
      const count = parseInt(hours);
      for (let i = count; i >= 0; i--) {
        const t = new Date();
        t.setHours(t.getHours() - i);
        const h = t.getHours();
        data.push({
          temperature: (18 + Math.sin((h - 6) * Math.PI / 12) * 8 + (Math.random() * 2 - 1)).toFixed(1),
          humidity: (60 + Math.random() * 20).toFixed(0),
          wind_speed: (2 + Math.random() * 6).toFixed(1),
          light_intensity: h >= 6 && h <= 18 ? Math.round(10000 + Math.random() * 50000) : 0,
          rainfall: (Math.random() * 5).toFixed(1),
          co2: Math.round(350 + Math.random() * 200),
          created_at: t
        });
      }
    }

    res.json({ data });
  } catch (error) {
    console.error('获取气象历史数据错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.getForecast = async (req, res) => {
  try {
    // Simulated 7-day forecast
    const forecast = [];
    const conditions = ['晴', '多云', '阴', '小雨', '中雨', '雷阵雨'];
    const winds = ['东风', '南风', '西风', '北风', '东南风', '西北风'];

    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const h = Math.floor(Math.random() * 15) + 5;
      forecast.push({
        date: date.toISOString().split('T')[0],
        weather: conditions[Math.floor(Math.random() * conditions.length)],
        temp_high: (h + 10 + Math.floor(Math.random() * 5)),
        temp_low: (h - 5 + Math.floor(Math.random() * 5)),
        humidity: Math.floor(50 + Math.random() * 40),
        wind_direction: winds[Math.floor(Math.random() * winds.length)],
        wind_speed: (1 + Math.random() * 8).toFixed(1)
      });
    }

    res.json({ data: forecast });
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
};
