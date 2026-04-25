const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const DeviceType = sequelize.define('DeviceType', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '类型名称'
    },
    code: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true,
      comment: '类型编码'
    },
    category: {
      type: DataTypes.STRING(20),
      defaultValue: 'sensor',
      comment: '类型分类'
    },
    properties: {
      type: DataTypes.JSON,
      comment: '属性定义'
    },
    commands: {
      type: DataTypes.JSON,
      comment: '命令定义'
    },
    icon: {
      type: DataTypes.STRING(100),
      comment: '图标'
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      comment: '状态：1启用 0禁用'
    }
  }, {
    tableName: 'device_types',
    comment: '设备类型表'
  });

  return DeviceType;
};
