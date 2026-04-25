const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PlantingRecord = sequelize.define('PlantingRecord', {
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
    type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '作业类型：plant播种 water灌溉 fertilize施肥 spray喷药 prune修剪 harvest采收'
    },
    content: {
      type: DataTypes.TEXT,
      comment: '作业内容'
    },
    operator: {
      type: DataTypes.STRING(50),
      comment: '操作人'
    },
    work_date: {
      type: DataTypes.DATEONLY,
      comment: '作业日期'
    },
    images: {
      type: DataTypes.JSON,
      comment: '图片列表'
    }
  }, {
    tableName: 'planting_records',
    comment: '种植记录表'
  });

  return PlantingRecord;
};
