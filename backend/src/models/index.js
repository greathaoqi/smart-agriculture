const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'smart_agriculture',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || 'root123',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true,
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci'
    }
  }
);

// 导入模型
const User = require('./User')(sequelize);
const Role = require('./Role')(sequelize);
const Farm = require('./Farm')(sequelize);
const Plot = require('./Plot')(sequelize);
const Crop = require('./Crop')(sequelize);
const Device = require('./Device')(sequelize);
const DeviceData = require('./DeviceData')(sequelize);
const PlantingPlan = require('./PlantingPlan')(sequelize);
const PlantingRecord = require('./PlantingRecord')(sequelize);
const Harvest = require('./Harvest')(sequelize);
const Warehouse = require('./Warehouse')(sequelize);
const Inventory = require('./Inventory')(sequelize);
const InventoryLog = require('./InventoryLog')(sequelize);
const Customer = require('./Customer')(sequelize);
const Order = require('./Order')(sequelize);
const Task = require('./Task')(sequelize);
const OperationLog = require('./OperationLog')(sequelize);

// 设置关联关系

// 用户-角色
User.belongsTo(Role, { foreignKey: 'role_id', as: 'role' });
Role.hasMany(User, { foreignKey: 'role_id', as: 'users' });

// 农场-地块
Farm.hasMany(Plot, { foreignKey: 'farm_id', as: 'plots' });
Plot.belongsTo(Farm, { foreignKey: 'farm_id', as: 'farm' });

// 地块-种植计划（作物通过种植计划与地块关联，非直接关联）

// 农场-设备
Farm.hasMany(Device, { foreignKey: 'farm_id', as: 'devices' });
Device.belongsTo(Farm, { foreignKey: 'farm_id', as: 'farm' });

// 设备-数据
Device.hasMany(DeviceData, { foreignKey: 'device_id', as: 'data' });
DeviceData.belongsTo(Device, { foreignKey: 'device_id', as: 'device' });

// 地块-种植计划
Plot.hasMany(PlantingPlan, { foreignKey: 'plot_id', as: 'plans' });
PlantingPlan.belongsTo(Plot, { foreignKey: 'plot_id', as: 'plot' });

// 作物-种植计划
Crop.hasMany(PlantingPlan, { foreignKey: 'crop_id', as: 'plans' });
PlantingPlan.belongsTo(Crop, { foreignKey: 'crop_id', as: 'crop' });

// 种植计划-记录
PlantingPlan.hasMany(PlantingRecord, { foreignKey: 'plan_id', as: 'records' });
PlantingRecord.belongsTo(PlantingPlan, { foreignKey: 'plan_id', as: 'plan' });

// 种植计划-采收
PlantingPlan.hasMany(Harvest, { foreignKey: 'plan_id', as: 'harvests' });
Harvest.belongsTo(PlantingPlan, { foreignKey: 'plan_id', as: 'plan' });

// 仓库-库存
Warehouse.hasMany(Inventory, { foreignKey: 'warehouse_id', as: 'inventory' });
Inventory.belongsTo(Warehouse, { foreignKey: 'warehouse_id', as: 'warehouse' });

// 库存-出入库记录
Inventory.hasMany(InventoryLog, { foreignKey: 'inventory_id', as: 'logs' });
InventoryLog.belongsTo(Inventory, { foreignKey: 'inventory_id', as: 'inventory' });

// 客户-订单
Customer.hasMany(Order, { foreignKey: 'customer_id', as: 'orders' });
Order.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });

// 用户-操作日志
User.hasMany(OperationLog, { foreignKey: 'user_id', as: 'logs' });
OperationLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = {
  sequelize,
  User,
  Role,
  Farm,
  Plot,
  Crop,
  Device,
  DeviceData,
  PlantingPlan,
  PlantingRecord,
  Harvest,
  Warehouse,
  Inventory,
  InventoryLog,
  Customer,
  Order,
  Task,
  OperationLog
};
