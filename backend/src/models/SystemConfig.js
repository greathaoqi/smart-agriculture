const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  const SystemConfig = sequelize.define('SystemConfig', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    config_key: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      field: 'config_key'
    },
    config_value: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'config_value'
    },
    config_type: {
      type: DataTypes.STRING(50),
      defaultValue: 'string',
      field: 'config_type'
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'description'
    },
    is_public: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
      field: 'is_public'
    }
  }, {
    tableName: 'system_config',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  })

  return SystemConfig
}
