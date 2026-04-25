const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const DeviceData = sequelize.define('DeviceData', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    device_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '设备ID'
    },
    temperature: {
      type: DataTypes.DECIMAL(5, 2),
      comment: '温度(℃)'
    },
    humidity: {
      type: DataTypes.DECIMAL(5, 2),
      comment: '湿度(%)'
    },
    soil_moisture: {
      type: DataTypes.DECIMAL(5, 2),
      comment: '土壤湿度(%)'
    },
    light_intensity: {
      type: DataTypes.INTEGER,
      comment: '光照强度(lux)'
    },
    wind_speed: {
      type: DataTypes.DECIMAL(5, 2),
      comment: '风速(m/s)'
    },
    rainfall: {
      type: DataTypes.DECIMAL(5, 2),
      comment: '降雨量(mm)'
    },
    co2: {
      type: DataTypes.INTEGER,
      comment: 'CO2浓度(ppm)'
    },
    ph: {
      type: DataTypes.DECIMAL(3, 1),
      comment: 'PH值'
    },
    ec: {
      type: DataTypes.DECIMAL(6, 2),
      comment: 'EC值(电导率)'
    },
    raw_data: {
      type: DataTypes.JSON,
      comment: '原始数据JSON'
    }
  }, {
    tableName: 'device_data',
    comment: '设备数据表',
    timestamps: true,
    updatedAt: false,
    indexes: [
      { fields: ['device_id', 'created_at'] }
    ]
  });

  return DeviceData;
};
