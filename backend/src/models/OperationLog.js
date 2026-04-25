const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const OperationLog = sequelize.define('OperationLog', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      comment: '用户ID'
    },
    module: {
      type: DataTypes.STRING(50),
      comment: '模块名称'
    },
    action: {
      type: DataTypes.STRING(50),
      comment: '操作类型'
    },
    description: {
      type: DataTypes.STRING(255),
      comment: '操作描述'
    },
    ip: {
      type: DataTypes.STRING(50),
      comment: 'IP地址'
    },
    user_agent: {
      type: DataTypes.STRING(255),
      comment: '用户代理'
    },
    request_data: {
      type: DataTypes.JSON,
      comment: '请求数据'
    }
  }, {
    tableName: 'operation_logs',
    comment: '操作日志表',
    timestamps: true,
    updatedAt: false
  });

  return OperationLog;
};
