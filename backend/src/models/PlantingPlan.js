const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PlantingPlan = sequelize.define('PlantingPlan', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    plot_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '地块ID'
    },
    crop_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '作物ID'
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '计划名称'
    },
    planned_area: {
      type: DataTypes.DECIMAL(10, 2),
      comment: '计划面积(亩)'
    },
    planned_yield: {
      type: DataTypes.DECIMAL(10, 2),
      comment: '计划产量(kg)'
    },
    start_date: {
      type: DataTypes.DATEONLY,
      comment: '开始日期'
    },
    end_date: {
      type: DataTypes.DATEONLY,
      comment: '预计结束日期'
    },
    actual_start_date: {
      type: DataTypes.DATEONLY,
      comment: '实际开始日期'
    },
    actual_end_date: {
      type: DataTypes.DATEONLY,
      comment: '实际结束日期'
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
      comment: '状态：0计划中 1进行中 2已完成 3已取消'
    },
    remark: {
      type: DataTypes.TEXT,
      comment: '备注'
    }
  }, {
    tableName: 'planting_plans',
    comment: '种植计划表'
  });

  return PlantingPlan;
};
