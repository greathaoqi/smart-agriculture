-- 智慧农业管理平台数据库初始化脚本
-- 创建时间: 2024

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- 角色表
-- ----------------------------
DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL COMMENT '角色名称',
  `code` varchar(50) NOT NULL COMMENT '角色编码',
  `description` varchar(255) DEFAULT NULL COMMENT '角色描述',
  `permissions` json DEFAULT NULL COMMENT '权限列表JSON',
  `status` tinyint DEFAULT '1' COMMENT '状态：1启用 0禁用',
  `sort` int DEFAULT '0' COMMENT '排序',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色表';

-- 初始化角色数据
INSERT INTO `roles` (`name`, `code`, `description`, `permissions`, `status`, `sort`) VALUES
('超级管理员', 'admin', '系统超级管理员，拥有所有权限', '["*"]', 1, 1),
('农场管理员', 'farm_manager', '负责农场日常管理', '["farm:*", "plot:*", "device:*", "planting:*"]', 1, 2),
('普通用户', 'user', '普通用户，查看权限', '["farm:view", "plot:view", "device:view"]', 1, 3);

-- ----------------------------
-- 用户表
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL COMMENT '用户名',
  `password` varchar(255) NOT NULL COMMENT '密码',
  `real_name` varchar(50) DEFAULT NULL COMMENT '真实姓名',
  `phone` varchar(20) DEFAULT NULL COMMENT '手机号',
  `email` varchar(100) DEFAULT NULL COMMENT '邮箱',
  `avatar` varchar(255) DEFAULT NULL COMMENT '头像URL',
  `status` tinyint DEFAULT '1' COMMENT '状态：1启用 0禁用',
  `role_id` int DEFAULT NULL COMMENT '角色ID',
  `last_login_time` datetime DEFAULT NULL COMMENT '最后登录时间',
  `last_login_ip` varchar(50) DEFAULT NULL COMMENT '最后登录IP',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`),
  KEY `idx_role_id` (`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 初始化管理员用户 (密码: admin123)
INSERT INTO `users` (`username`, `password`, `real_name`, `status`, `role_id`) VALUES
('admin', '$2a$10$ldAH34zBXTW8rCIVwYf5uuHlvsDhFSvcZTkJhGKIEpTx/xOaPdciO', '系统管理员', 1, 1);

-- ----------------------------
-- 农场表
-- ----------------------------
DROP TABLE IF EXISTS `farms`;
CREATE TABLE `farms` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL COMMENT '农场名称',
  `code` varchar(50) DEFAULT NULL COMMENT '农场编码',
  `area` decimal(10,2) DEFAULT NULL COMMENT '总面积(亩)',
  `address` varchar(255) DEFAULT NULL COMMENT '地址',
  `longitude` decimal(10,6) DEFAULT NULL COMMENT '经度',
  `latitude` decimal(10,6) DEFAULT NULL COMMENT '纬度',
  `manager` varchar(50) DEFAULT NULL COMMENT '负责人',
  `phone` varchar(20) DEFAULT NULL COMMENT '联系电话',
  `description` text COMMENT '农场描述',
  `images` json DEFAULT NULL COMMENT '图片列表JSON',
  `status` tinyint DEFAULT '1' COMMENT '状态：1启用 0禁用',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='农场表';

-- 示例农场数据
INSERT INTO `farms` (`name`, `code`, `area`, `address`, `manager`, `phone`, `status`) VALUES
('智慧农业示范基地', 'FARM001', 500.00, '北京市海淀区农大南路', '张三', '13800138001', 1),
('阳光农场', 'FARM002', 300.00, '上海市浦东新区农业园区', '李四', '13800138002', 1);

-- ----------------------------
-- 地块表
-- ----------------------------
DROP TABLE IF EXISTS `plots`;
CREATE TABLE `plots` (
  `id` int NOT NULL AUTO_INCREMENT,
  `farm_id` int NOT NULL COMMENT '农场ID',
  `name` varchar(100) NOT NULL COMMENT '地块名称',
  `code` varchar(50) DEFAULT NULL COMMENT '地块编码',
  `area` decimal(10,2) DEFAULT NULL COMMENT '面积(亩)',
  `soil_type` varchar(50) DEFAULT NULL COMMENT '土壤类型',
  `coordinates` json DEFAULT NULL COMMENT '地块坐标JSON',
  `status` tinyint DEFAULT '1' COMMENT '状态：1空闲 2种植中 3休耕',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_farm_id` (`farm_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='地块表';

-- 示例地块数据
INSERT INTO `plots` (`farm_id`, `name`, `code`, `area`, `soil_type`, `status`) VALUES
(1, 'A区-01号地', 'PLOT-A01', 50.00, '壤土', 2),
(1, 'A区-02号地', 'PLOT-A02', 45.00, '壤土', 1),
(1, 'B区-01号地', 'PLOT-B01', 60.00, '沙壤土', 2);

-- ----------------------------
-- 作物表
-- ----------------------------
DROP TABLE IF EXISTS `crops`;
CREATE TABLE `crops` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL COMMENT '作物名称',
  `variety` varchar(100) DEFAULT NULL COMMENT '品种',
  `growth_cycle` int DEFAULT NULL COMMENT '生长周期(天)',
  `planting_season` varchar(50) DEFAULT NULL COMMENT '种植季节',
  `suitable_temperature` varchar(50) DEFAULT NULL COMMENT '适宜温度',
  `suitable_humidity` varchar(50) DEFAULT NULL COMMENT '适宜湿度',
  `description` text COMMENT '作物描述',
  `image` varchar(255) DEFAULT NULL COMMENT '作物图片',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='作物表';

-- 示例作物数据
INSERT INTO `crops` (`name`, `variety`, `growth_cycle`, `planting_season`, `suitable_temperature`, `suitable_humidity`) VALUES
('水稻', '杂交水稻', 120, '春季', '20-30℃', '60-80%'),
('小麦', '冬小麦', 230, '秋季', '15-25℃', '50-70%'),
('玉米', '甜玉米', 90, '春夏', '20-30℃', '50-70%'),
('番茄', '樱桃番茄', 100, '春秋', '18-25℃', '60-80%'),
('黄瓜', '水果黄瓜', 60, '春夏', '20-28℃', '70-90%');

-- ----------------------------
-- 设备表
-- ----------------------------
DROP TABLE IF EXISTS `devices`;
CREATE TABLE `devices` (
  `id` int NOT NULL AUTO_INCREMENT,
  `farm_id` int DEFAULT NULL COMMENT '农场ID',
  `name` varchar(100) NOT NULL COMMENT '设备名称',
  `code` varchar(50) DEFAULT NULL COMMENT '设备编码',
  `type` varchar(50) DEFAULT NULL COMMENT '设备类型',
  `model` varchar(100) DEFAULT NULL COMMENT '设备型号',
  `manufacturer` varchar(100) DEFAULT NULL COMMENT '制造商',
  `location` varchar(255) DEFAULT NULL COMMENT '安装位置',
  `longitude` decimal(10,6) DEFAULT NULL COMMENT '经度',
  `latitude` decimal(10,6) DEFAULT NULL COMMENT '纬度',
  `status` tinyint DEFAULT '1' COMMENT '状态：1在线 0离线 2故障',
  `last_data_time` datetime DEFAULT NULL COMMENT '最后数据时间',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_code` (`code`),
  KEY `idx_farm_id` (`farm_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='设备表';

-- 示例设备数据
INSERT INTO `devices` (`farm_id`, `name`, `code`, `type`, `model`, `location`, `status`) VALUES
(1, '温湿度传感器-01', 'DEV-TH001', 'sensor', 'TH-100', 'A区-01号地', 1),
(1, '土壤湿度传感器-01', 'DEV-SH001', 'sensor', 'SH-200', 'A区-01号地', 1),
(1, '气象站-01', 'DEV-WS001', 'sensor', 'WS-500', '农场中心', 1),
(2, '温湿度传感器-02', 'DEV-TH002', 'sensor', 'TH-100', '主种植区', 1);

-- ----------------------------
-- 设备数据表
-- ----------------------------
DROP TABLE IF EXISTS `device_data`;
CREATE TABLE `device_data` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `device_id` int NOT NULL COMMENT '设备ID',
  `temperature` decimal(5,2) DEFAULT NULL COMMENT '温度(℃)',
  `humidity` decimal(5,2) DEFAULT NULL COMMENT '湿度(%)',
  `soil_moisture` decimal(5,2) DEFAULT NULL COMMENT '土壤湿度(%)',
  `light_intensity` int DEFAULT NULL COMMENT '光照强度(lux)',
  `wind_speed` decimal(5,2) DEFAULT NULL COMMENT '风速(m/s)',
  `rainfall` decimal(5,2) DEFAULT NULL COMMENT '降雨量(mm)',
  `co2` int DEFAULT NULL COMMENT 'CO2浓度(ppm)',
  `ph` decimal(3,1) DEFAULT NULL COMMENT 'PH值',
  `ec` decimal(6,2) DEFAULT NULL COMMENT 'EC值',
  `raw_data` json DEFAULT NULL COMMENT '原始数据JSON',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_device_time` (`device_id`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='设备数据表';

-- ----------------------------
-- 种植计划表
-- ----------------------------
DROP TABLE IF EXISTS `planting_plans`;
CREATE TABLE `planting_plans` (
  `id` int NOT NULL AUTO_INCREMENT,
  `plot_id` int NOT NULL COMMENT '地块ID',
  `crop_id` int NOT NULL COMMENT '作物ID',
  `name` varchar(100) NOT NULL COMMENT '计划名称',
  `planned_area` decimal(10,2) DEFAULT NULL COMMENT '计划面积(亩)',
  `planned_yield` decimal(10,2) DEFAULT NULL COMMENT '计划产量(kg)',
  `start_date` date DEFAULT NULL COMMENT '开始日期',
  `end_date` date DEFAULT NULL COMMENT '预计结束日期',
  `actual_start_date` date DEFAULT NULL COMMENT '实际开始日期',
  `actual_end_date` date DEFAULT NULL COMMENT '实际结束日期',
  `status` tinyint DEFAULT '0' COMMENT '状态：0计划中 1进行中 2已完成 3已取消',
  `remark` text COMMENT '备注',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_plot_id` (`plot_id`),
  KEY `idx_crop_id` (`crop_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='种植计划表';

-- ----------------------------
-- 种植记录表
-- ----------------------------
DROP TABLE IF EXISTS `planting_records`;
CREATE TABLE `planting_records` (
  `id` int NOT NULL AUTO_INCREMENT,
  `plan_id` int NOT NULL COMMENT '种植计划ID',
  `type` varchar(50) NOT NULL COMMENT '作业类型',
  `content` text COMMENT '作业内容',
  `operator` varchar(50) DEFAULT NULL COMMENT '操作人',
  `work_date` date DEFAULT NULL COMMENT '作业日期',
  `images` json DEFAULT NULL COMMENT '图片列表',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_plan_id` (`plan_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='种植记录表';

-- ----------------------------
-- 采收记录表
-- ----------------------------
DROP TABLE IF EXISTS `harvests`;
CREATE TABLE `harvests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `plan_id` int NOT NULL COMMENT '种植计划ID',
  `harvest_date` date NOT NULL COMMENT '采收日期',
  `yield` decimal(10,2) DEFAULT NULL COMMENT '采收产量(kg)',
  `quality` varchar(50) DEFAULT NULL COMMENT '品质等级',
  `operator` varchar(50) DEFAULT NULL COMMENT '采收人',
  `remark` text COMMENT '备注',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_plan_id` (`plan_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='采收记录表';

-- ----------------------------
-- 仓库表
-- ----------------------------
DROP TABLE IF EXISTS `warehouses`;
CREATE TABLE `warehouses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL COMMENT '仓库名称',
  `code` varchar(50) DEFAULT NULL COMMENT '仓库编码',
  `type` varchar(50) DEFAULT NULL COMMENT '仓库类型',
  `capacity` decimal(10,2) DEFAULT NULL COMMENT '容量(吨)',
  `address` varchar(255) DEFAULT NULL COMMENT '地址',
  `manager` varchar(50) DEFAULT NULL COMMENT '负责人',
  `phone` varchar(20) DEFAULT NULL COMMENT '联系电话',
  `status` tinyint DEFAULT '1' COMMENT '状态：1启用 0禁用',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='仓库表';

-- ----------------------------
-- 库存表
-- ----------------------------
DROP TABLE IF EXISTS `inventory`;
CREATE TABLE `inventory` (
  `id` int NOT NULL AUTO_INCREMENT,
  `warehouse_id` int NOT NULL COMMENT '仓库ID',
  `product_name` varchar(100) NOT NULL COMMENT '产品名称',
  `product_type` varchar(50) DEFAULT NULL COMMENT '产品类型',
  `unit` varchar(20) DEFAULT NULL COMMENT '单位',
  `quantity` decimal(10,2) DEFAULT '0.00' COMMENT '库存数量',
  `warning_quantity` decimal(10,2) DEFAULT NULL COMMENT '预警数量',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_warehouse_id` (`warehouse_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='库存表';

-- ----------------------------
-- 库存变动记录表
-- ----------------------------
DROP TABLE IF EXISTS `inventory_logs`;
CREATE TABLE `inventory_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `inventory_id` int NOT NULL COMMENT '库存ID',
  `type` tinyint NOT NULL COMMENT '类型：1入库 2出库',
  `quantity` decimal(10,2) NOT NULL COMMENT '数量',
  `before_quantity` decimal(10,2) DEFAULT NULL COMMENT '变动前数量',
  `after_quantity` decimal(10,2) DEFAULT NULL COMMENT '变动后数量',
  `operator` varchar(50) DEFAULT NULL COMMENT '操作人',
  `remark` varchar(255) DEFAULT NULL COMMENT '备注',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_inventory_id` (`inventory_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='库存变动记录表';

-- ----------------------------
-- 客户表
-- ----------------------------
DROP TABLE IF EXISTS `customers`;
CREATE TABLE `customers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL COMMENT '客户名称',
  `type` varchar(50) DEFAULT NULL COMMENT '客户类型',
  `contact` varchar(50) DEFAULT NULL COMMENT '联系人',
  `phone` varchar(20) DEFAULT NULL COMMENT '联系电话',
  `address` varchar(255) DEFAULT NULL COMMENT '地址',
  `remark` text COMMENT '备注',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='客户表';

-- ----------------------------
-- 订单表
-- ----------------------------
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_no` varchar(50) NOT NULL COMMENT '订单号',
  `customer_id` int NOT NULL COMMENT '客户ID',
  `total_amount` decimal(10,2) DEFAULT NULL COMMENT '订单总金额',
  `status` tinyint DEFAULT '0' COMMENT '状态：0待确认 1已确认 2已发货 3已完成 4已取消',
  `items` json DEFAULT NULL COMMENT '订单明细JSON',
  `remark` text COMMENT '备注',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_order_no` (`order_no`),
  KEY `idx_customer_id` (`customer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单表';

-- ----------------------------
-- 任务表
-- ----------------------------
DROP TABLE IF EXISTS `tasks`;
CREATE TABLE `tasks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL COMMENT '任务标题',
  `type` varchar(50) DEFAULT NULL COMMENT '任务类型',
  `priority` tinyint DEFAULT '1' COMMENT '优先级：1低 2中 3高',
  `assignee` varchar(50) DEFAULT NULL COMMENT '负责人',
  `start_date` date DEFAULT NULL COMMENT '开始日期',
  `due_date` date DEFAULT NULL COMMENT '截止日期',
  `status` tinyint DEFAULT '0' COMMENT '状态：0待处理 1进行中 2已完成 3已取消',
  `description` text COMMENT '任务描述',
  `farm_id` int DEFAULT NULL COMMENT '关联农场ID',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_farm_id` (`farm_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='任务表';

-- 示例任务数据
INSERT INTO `tasks` (`title`, `type`, `priority`, `assignee`, `due_date`, `status`, `farm_id`) VALUES
('检查A区灌溉系统', '设备维护', 2, '张三', CURDATE() + INTERVAL 2 DAY, 0, 1),
('采收番茄', '采收', 3, '李四', CURDATE() + INTERVAL 1 DAY, 1, 1),
('施肥作业', '种植', 2, '王五', CURDATE() + INTERVAL 3 DAY, 0, 1);

-- ----------------------------
-- 操作日志表
-- ----------------------------
DROP TABLE IF EXISTS `operation_logs`;
CREATE TABLE `operation_logs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL COMMENT '用户ID',
  `module` varchar(50) DEFAULT NULL COMMENT '模块名称',
  `action` varchar(50) DEFAULT NULL COMMENT '操作类型',
  `description` varchar(255) DEFAULT NULL COMMENT '操作描述',
  `ip` varchar(50) DEFAULT NULL COMMENT 'IP地址',
  `user_agent` varchar(255) DEFAULT NULL COMMENT '用户代理',
  `request_data` json DEFAULT NULL COMMENT '请求数据',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='操作日志表';

SET FOREIGN_KEY_CHECKS = 1;
