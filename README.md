# 智慧农业管理平台

一个基于 Vue 3 + Node.js + MySQL 的现代化智慧农业管理系统。

## 技术栈

### 前端
- Vue 3 + Vite
- Element Plus
- Pinia
- Vue Router
- ECharts
- Axios

### 后端
- Node.js + Express
- Sequelize ORM
- MySQL
- JWT 认证

## 快速开始

### Docker 部署（推荐）

```bash
# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 停止服务
docker-compose down
```

访问地址：
- 前端：http://localhost
- 后端 API：http://localhost:3000
- MySQL：localhost:12330

### 本地开发

```bash
# 安装后端依赖
cd backend
npm install

# 安装前端依赖
cd ../frontend
npm install

# 启动后端（需要先启动 MySQL）
cd ../backend
npm run dev

# 启动前端（新终端）
cd ../frontend
npm run dev
```

## 默认账号

- 用户名：admin
- 密码：admin123

## 项目结构

```
smart-agriculture/
├── frontend/          # Vue 3 前端项目
├── backend/           # Node.js 后端项目
├── database/          # 数据库脚本
├── docker-compose.yml # Docker 编排
└── README.md
```

## 功能模块

- 首页仪表盘
- 农场管理
- 设备管理
- 种植管理
- 生产管理
- 仓储管理
- 销售管理
- 数据分析
- 系统设置
