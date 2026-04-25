const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AlertMessage = sequelize.define('AlertMessage', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    rule_id: {
      type: DataTypes.INTEGER,
      comment: '规则ID'
    },
    device_id: {
      type: DataTypes.INTEGER,
      comment: '设备ID'
    },
    greenhouse_id: {
      type: DataTypes.INTEGER,
      comment: '温棚ID'
    },
    message: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: '预警消息'
    },
    level: {
      type: DataTypes.TINYINT,
      allowNull: false,
      comment: '预警级别'
    },
    value: {
      type: DataTypes.DECIMAL(10, 2),
      comment: '触发值'
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: 'unread',
      comment: '状态：unread未读 read已读 handled已处理'
    },
    handler: {
      type: DataTypes.STRING(50),
      comment: '处理人'
    },
    handle_time: {
      type: DataTypes.DATE,
      comment: '处理时间'
    },
    handle_note: {
      type: DataTypes.STRING(255),
      comment: '处理备注'
    }
  }, {
    tableName: 'alert_messages',
    comment: '预警消息表',
    updatedAt: false
  });

  return AlertMessage;
};
