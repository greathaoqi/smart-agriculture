const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Greenhouse = sequelize.define('Greenhouse', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    farm_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '农场ID'
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '温棚名称'
    },
    code: {
      type: DataTypes.STRING(30),
      comment: '温棚编码'
    },
    area: {
      type: DataTypes.DECIMAL(10, 2),
      comment: '面积(平方米)'
    },
    location: {
      type: DataTypes.STRING(100),
      comment: '位置描述'
    },
    longitude: {
      type: DataTypes.DECIMAL(10, 6),
      comment: '经度'
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 6),
      comment: '纬度'
    },
    controller_type: {
      type: DataTypes.STRING(50),
      comment: '控制器类型'
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      comment: '状态：1正常 0停用'
    }
  }, {
    tableName: 'greenhouses',
    comment: '温棚表'
  });

  return Greenhouse;
};
