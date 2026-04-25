-- 智慧农业系统功能扩展数据库脚本
-- 执行此脚本前请确保已有基础表结构

-- 1. 设备表扩展字段
ALTER TABLE devices ADD COLUMN IF NOT EXISTS device_type_id INT COMMENT '设备类型ID';
ALTER TABLE devices ADD COLUMN IF NOT EXISTS greenhouse_id INT COMMENT '温棚ID';

-- 2. 设备类型表（物模型）
CREATE TABLE IF NOT EXISTS device_types (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL COMMENT '类型名称',
  code VARCHAR(30) NOT NULL COMMENT '类型编码',
  category VARCHAR(20) DEFAULT 'sensor' COMMENT '类型分类：sensor传感器 controller控制器 camera摄像头 gateway网关',
  properties JSON COMMENT '属性定义JSON',
  commands JSON COMMENT '命令定义JSON',
  icon VARCHAR(100) COMMENT '图标',
  status TINYINT DEFAULT 1 COMMENT '状态：1启用 0禁用',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='设备类型表（物模型）';

-- 3. 温棚表
CREATE TABLE IF NOT EXISTS greenhouses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  farm_id INT NOT NULL COMMENT '农场ID',
  name VARCHAR(50) NOT NULL COMMENT '温棚名称',
  code VARCHAR(30) COMMENT '温棚编码',
  area DECIMAL(10,2) COMMENT '面积(平方米)',
  location VARCHAR(100) COMMENT '位置描述',
  longitude DECIMAL(10,6) COMMENT '经度',
  latitude DECIMAL(10,6) COMMENT '纬度',
  controller_type VARCHAR(50) COMMENT '控制器类型',
  status TINYINT DEFAULT 1 COMMENT '状态：1正常 0停用',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE,
  INDEX idx_farm (farm_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='温棚表';

-- 4. 预警规则表
CREATE TABLE IF NOT EXISTS alert_rules (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL COMMENT '规则名称',
  device_type_id INT COMMENT '设备类型ID',
  parameter VARCHAR(30) NOT NULL COMMENT '监控参数：temperature/humidity/soil_moisture等',
  operator VARCHAR(10) NOT NULL COMMENT '比较运算符：> < >= <= == !=',
  threshold DECIMAL(10,2) NOT NULL COMMENT '阈值',
  duration INT DEFAULT 0 COMMENT '持续时间(分钟)，0表示立即触发',
  level TINYINT DEFAULT 1 COMMENT '预警级别：1提示 2警告 3严重',
  notify_sms TINYINT DEFAULT 0 COMMENT '短信通知：0否 1是',
  notify_app TINYINT DEFAULT 1 COMMENT 'App通知：0否 1是',
  status TINYINT DEFAULT 1 COMMENT '状态：1启用 0禁用',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_parameter (parameter)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='预警规则表';

-- 5. 预警消息表
CREATE TABLE IF NOT EXISTS alert_messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  rule_id INT COMMENT '规则ID',
  device_id INT COMMENT '设备ID',
  greenhouse_id INT COMMENT '温棚ID',
  message VARCHAR(255) NOT NULL COMMENT '预警消息内容',
  level TINYINT NOT NULL COMMENT '预警级别',
  value DECIMAL(10,2) COMMENT '触发时的值',
  status VARCHAR(20) DEFAULT 'unread' COMMENT '状态：unread未读 read已读 handled已处理',
  handler VARCHAR(50) COMMENT '处理人',
  handle_time TIMESTAMP COMMENT '处理时间',
  handle_note VARCHAR(255) COMMENT '处理备注',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_level (level),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='预警消息表';

-- 6. 初始化设备类型数据
INSERT INTO device_types (name, code, category, properties, commands, icon, status) VALUES
('温湿度传感器', 'temp_humidity_sensor', 'sensor',
  '[{"name":"temperature","label":"温度","unit":"℃","type":"number","range":[-40,80]},{"name":"humidity","label":"湿度","unit":"%","type":"number","range":[0,100]}]',
  NULL, 'thermometer', 1),
('土壤传感器', 'soil_sensor', 'sensor',
  '[{"name":"soil_moisture","label":"土壤湿度","unit":"%","type":"number","range":[0,100]},{"name":"ph","label":"PH值","unit":"","type":"number","range":[0,14]},{"name":"ec","label":"EC值","unit":"mS/cm","type":"number","range":[0,10]}]',
  NULL, 'plant', 1),
('气象站', 'weather_station', 'sensor',
  '[{"name":"temperature","label":"温度","unit":"℃","type":"number"},{"name":"humidity","label":"湿度","unit":"%","type":"number"},{"name":"wind_speed","label":"风速","unit":"m/s","type":"number"},{"name":"rainfall","label":"降雨量","unit":"mm","type":"number"},{"name":"light_intensity","label":"光照","unit":"lux","type":"number"}]',
  NULL, 'cloudy', 1),
('CO2传感器', 'co2_sensor', 'sensor',
  '[{"name":"co2","label":"CO2浓度","unit":"ppm","type":"number","range":[0,5000]}]',
  NULL, 'wind-power', 1),
('卷帘控制器', 'roller_controller', 'controller',
  '[{"name":"position","label":"位置","unit":"%","type":"number","range":[0,100]},{"name":"status","label":"状态","unit":"","type":"enum","options":["停止","上升","下降"]}]',
  '[{"name":"open","label":"打开","params":[]},{"name":"close","label":"关闭","params":[]},{"name":"stop","label":"停止","params":[]},{"name":"setPosition","label":"设置位置","params":[{"name":"position","type":"number"}]}]',
  'sort', 1),
('通风控制器', 'ventilation_controller', 'controller',
  '[{"name":"speed","label":"风速等级","unit":"","type":"number","range":[0,5]},{"name":"status","label":"状态","unit":"","type":"enum","options":["关闭","运行"]}]',
  '[{"name":"on","label":"开启","params":[]},{"name":"off","label":"关闭","params":[]},{"name":"setSpeed","label":"设置风速","params":[{"name":"speed","type":"number"}]}]',
  'fan', 1),
('灌溉控制器', 'irrigation_controller', 'controller',
  '[{"name":"flow","label":"流量","unit":"L/min","type":"number"},{"name":"status","label":"状态","unit":"","type":"enum","options":["关闭","运行"]}]',
  '[{"name":"on","label":"开启","params":[]},{"name":"off","label":"关闭","params":[]},{"name":"setFlow","label":"设置流量","params":[{"name":"flow","type":"number"}]}]',
  'watermelon', 1),
('摄像头', 'camera', 'camera',
  '[{"name":"resolution","label":"分辨率","unit":"","type":"string"},{"name":"status","label":"状态","unit":"","type":"enum","options":["离线","在线","录制"]}]',
  '[{"name":"capture","label":"抓拍","params":[]},{"name":"record","label":"录像","params":[{"name":"duration","type":"number"}]}]',
  'camera', 1)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 7. 初始化预警规则
INSERT INTO alert_rules (name, parameter, operator, threshold, level, status) VALUES
('高温预警', 'temperature', '>', 35, 3, 1),
('低温预警', 'temperature', '<', 5, 3, 1),
('高湿度预警', 'humidity', '>', 90, 2, 1),
('低土壤湿度预警', 'soil_moisture', '<', 30, 2, 1),
('高CO2预警', 'co2', '>', 2000, 2, 1),
('大风预警', 'wind_speed', '>', 15, 3, 1)
ON DUPLICATE KEY UPDATE name = VALUES(name);