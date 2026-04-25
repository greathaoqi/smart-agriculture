const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Task = sequelize.define('Task', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: '任务标题'
    },
    type: {
      type: DataTypes.STRING(50),
      comment: '任务类型'
    },
    priority: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      comment: '优先级：1低 2中 3高'
    },
    assignee: {
      type: DataTypes.STRING(50),
      comment: '负责人'
    },
    start_date: {
      type: DataTypes.DATEONLY,
      comment: '开始日期'
    },
    due_date: {
      type: DataTypes.DATEONLY,
      comment: '截止日期'
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
      comment: '状态：0待处理 1进行中 2已完成 3已取消'
    },
    description: {
      type: DataTypes.TEXT,
      comment: '任务描述'
    },
    farm_id: {
      type: DataTypes.INTEGER,
      comment: '关联农场ID'
    }
  }, {
    tableName: 'tasks',
    comment: '任务表'
  });

  return Task;
};
