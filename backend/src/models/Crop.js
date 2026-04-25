const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Crop = sequelize.define('Crop', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '作物名称'
    },
    variety: {
      type: DataTypes.STRING(100),
      comment: '品种'
    },
    growth_cycle: {
      type: DataTypes.INTEGER,
      comment: '生长周期(天)'
    },
    planting_season: {
      type: DataTypes.STRING(50),
      comment: '种植季节'
    },
    suitable_temperature: {
      type: DataTypes.STRING(50),
      comment: '适宜温度'
    },
    suitable_humidity: {
      type: DataTypes.STRING(50),
      comment: '适宜湿度'
    },
    description: {
      type: DataTypes.TEXT,
      comment: '作物描述'
    },
    image: {
      type: DataTypes.STRING(255),
      comment: '作物图片'
    }
  }, {
    tableName: 'crops',
    comment: '作物表'
  });

  return Crop;
};
