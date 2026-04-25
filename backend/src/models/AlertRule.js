const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AlertRule = sequelize.define('AlertRule', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '规则名称'
    },
    device_type_id: {
      type: DataTypes.INTEGER,
      comment: '设备类型ID'
    },
    parameter: {
      type: DataTypes.STRING(30),
      allowNull: false,
      comment: '监控参数'
    },
    operator: {
      type: DataTypes.STRING(10),
      allowNull: false,
      comment: '比较运算符'
    },
    threshold: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '阈值'
    },
    duration: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '持续时间(分钟)'
    },
    level: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      comment: '预警级别：1提示 2警告 3严重'
    },
    notify_sms: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
      comment: '短信通知'
    },
    notify_app: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      comment: 'App通知'
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      comment: '状态：1启用 0禁用'
    }
  }, {
    tableName: 'alert_rules',
    comment: '预警规则表'
  });

  return AlertRule;
};
