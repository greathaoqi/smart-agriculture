const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Device = sequelize.define('Device', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    farm_id: {
      type: DataTypes.INTEGER,
      comment: '农场ID'
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '设备名称'
    },
    code: {
      type: DataTypes.STRING(50),
      unique: true,
      comment: '设备编码'
    },
    type: {
      type: DataTypes.STRING(50),
      comment: '设备类型：sensor传感器 actuator执行器 camera摄像头'
    },
    model: {
      type: DataTypes.STRING(100),
      comment: '设备型号'
    },
    manufacturer: {
      type: DataTypes.STRING(100),
      comment: '制造商'
    },
    location: {
      type: DataTypes.STRING(255),
      comment: '安装位置'
    },
    longitude: {
      type: DataTypes.DECIMAL(10, 6),
      comment: '经度'
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 6),
      comment: '纬度'
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      comment: '状态：1在线 0离线 2故障'
    },
    last_data_time: {
      type: DataTypes.DATE,
      comment: '最后数据时间'
    }
  }, {
    tableName: 'devices',
    comment: '设备表'
  });

  return Device;
};
