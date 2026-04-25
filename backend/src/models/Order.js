const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Order = sequelize.define('Order', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    order_no: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
      comment: '订单号'
    },
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '客户ID'
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      comment: '订单总金额'
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
      comment: '状态：0待确认 1已确认 2已发货 3已完成 4已取消'
    },
    items: {
      type: DataTypes.JSON,
      comment: '订单明细JSON'
    },
    remark: {
      type: DataTypes.TEXT,
      comment: '备注'
    }
  }, {
    tableName: 'orders',
    comment: '订单表'
  });

  return Order;
};
