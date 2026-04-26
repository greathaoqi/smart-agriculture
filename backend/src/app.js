require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');

// 导入路由
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const farmRoutes = require('./routes/farm');
const deviceRoutes = require('./routes/device');
const deviceTypeRoutes = require('./routes/deviceType');
const dashboardRoutes = require('./routes/dashboard');
const plotRoutes = require('./routes/plot');
const cropRoutes = require('./routes/crop');
const plantingRoutes = require('./routes/planting');
const harvestRoutes = require('./routes/harvest');
const greenhouseRoutes = require('./routes/greenhouse');
const weatherRoutes = require('./routes/weather');
const warehouseRoutes = require('./routes/warehouse');
const inventoryRoutes = require('./routes/inventory');
const customerRoutes = require('./routes/customer');
const orderRoutes = require('./routes/order');
const taskRoutes = require('./routes/task');
const alertRoutes = require('./routes/alert');
const roleRoutes = require('./routes/role');
const logRoutes = require('./routes/log');
const systemConfigRoutes = require('./routes/systemConfig');

const app = express();

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件（上传的文件）
app.use('/uploads', express.static('uploads'));

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API 路由
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/farms', farmRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/device-types', deviceTypeRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/plots', plotRoutes);
app.use('/api/crops', cropRoutes);
app.use('/api/planting', plantingRoutes);
app.use('/api/harvests', harvestRoutes);
app.use('/api/greenhouses', greenhouseRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/warehouses', warehouseRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/system-config', systemConfigRoutes);

// 404 处理
app.use((req, res) => {
  res.status(404).json({ message: '接口不存在' });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: process.env.NODE_ENV === 'production' ? '服务器错误' : err.message
  });
});

// 启动服务器
const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // 连接数据库
    await sequelize.authenticate();
    console.log('数据库连接成功');

    // 同步模型
    await sequelize.sync({ alter: process.env.NODE_ENV !== 'production' });
    console.log('数据库模型同步完成');

    // 初始化默认数据
    await initDefaultData();

    app.listen(PORT, () => {
      console.log(`服务器运行在端口 ${PORT}`);
    });
  } catch (error) {
    console.error('启动失败:', error);
    process.exit(1);
  }
}

// 初始化默认数据
async function initDefaultData() {
  const { User, Role } = require('./models');

  // 初始化角色
  const roles = await Role.count();
  if (roles === 0) {
    await Role.bulkCreate([
      { name: '超级管理员', code: 'admin', description: '系统超级管理员', permissions: ['*'], status: 1, sort: 1 },
      { name: '农场管理员', code: 'farm_manager', description: '负责农场管理', permissions: ['farm:*', 'plot:*', 'device:*'], status: 1, sort: 2 },
      { name: '普通用户', code: 'user', description: '普通用户', permissions: ['farm:view'], status: 1, sort: 3 }
    ]);
    console.log('初始化角色完成');
  }

  // 初始化管理员账号
  const adminUser = await User.findOne({ where: { username: 'admin' } });
  if (!adminUser) {
    const adminRole = await Role.findOne({ where: { code: 'admin' } });
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    await User.create({
      username: 'admin',
      password: adminPassword,
      real_name: '系统管理员',
      status: 1,
      role_id: adminRole?.id
    });
    console.log('初始化管理员账号完成 (admin / [ADMIN_PASSWORD])');
  }
}

startServer();

module.exports = app;
