const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Harvest = sequelize.define('Harvest', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    plan_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '种植计划ID'
    },
    harvest_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: '采收日期'
    },
    yield: {
      type: DataTypes.DECIMAL(10, 2),
      comment: '采收产量(kg)'
    },
    quality: {
      type: DataTypes.STRING(50),
      comment: '品质等级'
    },
    operator: {
      type: DataTypes.STRING(50),
      comment: '采收人'
    },
    remark: {
      type: DataTypes.TEXT,
      comment: '备注'
    }
  }, {
    tableName: 'harvests',
    comment: '采收记录表'
  });

  return Harvest;
};
