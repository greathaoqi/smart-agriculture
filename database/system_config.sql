-- 系统配置表
-- 用于存储系统级别的配置，如地图API密钥等

SET NAMES utf8mb4;

-- ----------------------------
-- 系统配置表
-- ----------------------------
DROP TABLE IF EXISTS `system_config`;
CREATE TABLE `system_config` (
  `id` int NOT NULL AUTO_INCREMENT,
  `config_key` varchar(100) NOT NULL COMMENT '配置键名',
  `config_value` varchar(500) DEFAULT NULL COMMENT '配置值',
  `config_type` varchar(50) DEFAULT 'string' COMMENT '配置类型：string/json/number',
  `description` varchar(255) DEFAULT NULL COMMENT '配置描述',
  `is_public` tinyint DEFAULT '0' COMMENT '是否公开：1前端可获取 0仅后端使用',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_config_key` (`config_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统配置表';

-- 插入高德地图配置
-- 注意：请替换 YOUR_AMAP_KEY 和 YOUR_SECURITY_JSCODE 为你实际的密钥
INSERT INTO `system_config` (`config_key`, `config_value`, `config_type`, `description`, `is_public`) VALUES
('amap_key', 'YOUR_AMAP_KEY', 'string', '高德地图 JS API Key', 1),
('amap_security_js_code', 'YOUR_SECURITY_JSCODE', 'string', '高德地图安全密钥（securityJsCode）', 0),
('amap_center_longitude', '119.92', 'string', '地图默认中心点经度（丽水）', 1),
('amap_center_latitude', '28.46', 'string', '地图默认中心点纬度（丽水）', 1),
('amap_default_zoom', '10', 'number', '地图默认缩放级别', 1),
('amap_map_style', 'amap://styles/dark', 'string', '地图样式：dark(深色)/normal(标准)', 1);

-- 使用示例：获取高德地图配置
-- SELECT config_value FROM system_config WHERE config_key = 'amap_key';