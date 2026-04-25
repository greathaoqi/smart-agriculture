const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Customer = sequelize.define('Customer', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '客户名称'
    },
    type: {
      type: DataTypes.STRING(50),
      comment: '客户类型'
    },
    contact: {
      type: DataTypes.STRING(50),
      comment: '联系人'
    },
    phone: {
      type: DataTypes.STRING(20),
      comment: '联系电话'
    },
    address: {
      type: DataTypes.STRING(255),
      comment: '地址'
    },
    remark: {
      type: DataTypes.TEXT,
      comment: '备注'
    }
  }, {
    tableName: 'customers',
    comment: '客户表'
  });

  return Customer;
};
