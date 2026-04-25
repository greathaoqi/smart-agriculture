const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Farm = sequelize.define('Farm', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '农场名称'
    },
    code: {
      type: DataTypes.STRING(50),
      unique: true,
      comment: '农场编码'
    },
    area: {
      type: DataTypes.DECIMAL(10, 2),
      comment: '总面积(亩)'
    },
    address: {
      type: DataTypes.STRING(255),
      comment: '地址'
    },
    longitude: {
      type: DataTypes.DECIMAL(10, 6),
      comment: '经度'
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 6),
      comment: '纬度'
    },
    manager: {
      type: DataTypes.STRING(50),
      comment: '负责人'
    },
    phone: {
      type: DataTypes.STRING(20),
      comment: '联系电话'
    },
    description: {
      type: DataTypes.TEXT,
      comment: '农场描述'
    },
    images: {
      type: DataTypes.JSON,
      comment: '图片列表JSON'
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      comment: '状态：1启用 0禁用'
    }
  }, {
    tableName: 'farms',
    comment: '农场表'
  });

  return Farm;
};
