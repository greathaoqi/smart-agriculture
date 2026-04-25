const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Plot = sequelize.define('Plot', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    farm_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '农场ID'
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '地块名称'
    },
    code: {
      type: DataTypes.STRING(50),
      comment: '地块编码'
    },
    area: {
      type: DataTypes.DECIMAL(10, 2),
      comment: '面积(亩)'
    },
    soil_type: {
      type: DataTypes.STRING(50),
      comment: '土壤类型'
    },
    coordinates: {
      type: DataTypes.JSON,
      comment: '地块坐标JSON'
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      comment: '状态：1空闲 2种植中 3休耕'
    }
  }, {
    tableName: 'plots',
    comment: '地块表'
  });

  return Plot;
};
