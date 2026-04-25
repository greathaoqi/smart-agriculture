const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Warehouse = sequelize.define('Warehouse', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '仓库名称'
    },
    code: {
      type: DataTypes.STRING(50),
      unique: true,
      comment: '仓库编码'
    },
    type: {
      type: DataTypes.STRING(50),
      comment: '仓库类型：normal普通 cold冷藏'
    },
    capacity: {
      type: DataTypes.DECIMAL(10, 2),
      comment: '容量(吨)'
    },
    address: {
      type: DataTypes.STRING(255),
      comment: '地址'
    },
    manager: {
      type: DataTypes.STRING(50),
      comment: '负责人'
    },
    phone: {
      type: DataTypes.STRING(20),
      comment: '联系电话'
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      comment: '状态：1启用 0禁用'
    }
  }, {
    tableName: 'warehouses',
    comment: '仓库表'
  });

  return Warehouse;
};
