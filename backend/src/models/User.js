const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '用户名'
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: '密码'
    },
    real_name: {
      type: DataTypes.STRING(50),
      comment: '真实姓名'
    },
    phone: {
      type: DataTypes.STRING(20),
      comment: '手机号'
    },
    email: {
      type: DataTypes.STRING(100),
      comment: '邮箱'
    },
    avatar: {
      type: DataTypes.STRING(255),
      comment: '头像URL'
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      comment: '状态：1启用 0禁用'
    },
    role_id: {
      type: DataTypes.INTEGER,
      comment: '角色ID'
    },
    last_login_time: {
      type: DataTypes.DATE,
      comment: '最后登录时间'
    },
    last_login_ip: {
      type: DataTypes.STRING(50),
      comment: '最后登录IP'
    }
  }, {
    tableName: 'users',
    comment: '用户表',
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      }
    }
  });

  // 实例方法：验证密码
  User.prototype.validatePassword = async function(password) {
    return bcrypt.compare(password, this.password);
  };

  // 实例方法：转换为安全的JSON（不包含密码）
  User.prototype.toSafeJSON = function() {
    const values = this.get({ plain: true });
    delete values.password;
    return values;
  };

  return User;
};
