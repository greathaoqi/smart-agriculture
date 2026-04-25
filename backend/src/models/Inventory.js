const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Inventory = sequelize.define('Inventory', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    warehouse_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '仓库ID'
    },
    product_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '产品名称'
    },
    product_type: {
      type: DataTypes.STRING(50),
      comment: '产品类型'
    },
    unit: {
      type: DataTypes.STRING(20),
      comment: '单位'
    },
    quantity: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      comment: '库存数量'
    },
    warning_quantity: {
      type: DataTypes.DECIMAL(10, 2),
      comment: '预警数量'
    }
  }, {
    tableName: 'inventory',
    comment: '库存表'
  });

  return Inventory;
};
