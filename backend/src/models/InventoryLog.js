const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const InventoryLog = sequelize.define('InventoryLog', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    inventory_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '库存ID'
    },
    type: {
      type: DataTypes.TINYINT,
      allowNull: false,
      comment: '类型：1入库 2出库'
    },
    quantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '数量'
    },
    before_quantity: {
      type: DataTypes.DECIMAL(10, 2),
      comment: '变动前数量'
    },
    after_quantity: {
      type: DataTypes.DECIMAL(10, 2),
      comment: '变动后数量'
    },
    operator: {
      type: DataTypes.STRING(50),
      comment: '操作人'
    },
    remark: {
      type: DataTypes.STRING(255),
      comment: '备注'
    }
  }, {
    tableName: 'inventory_logs',
    comment: '库存变动记录表',
    timestamps: true,
    updatedAt: false
  });

  return InventoryLog;
};
