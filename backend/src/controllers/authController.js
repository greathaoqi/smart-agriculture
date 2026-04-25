const { User, Role, OperationLog } = require('../models');
const jwt = require('jsonwebtoken');

// 生成Token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role?.code,
      permissions: user.role?.permissions
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// 登录
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: '用户名和密码不能为空' });
    }

    // 查找用户
    const user = await User.findOne({
      where: { username },
      include: [{ model: Role, as: 'role' }]
    });

    if (!user) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }

    if (user.status !== 1) {
      return res.status(401).json({ message: '账号已被禁用' });
    }

    // 验证密码
    const isValid = await user.validatePassword(password);
    if (!isValid) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }

    // 更新登录信息
    await user.update({
      last_login_time: new Date(),
      last_login_ip: req.ip
    });

    // 记录操作日志
    await OperationLog.create({
      user_id: user.id,
      module: '认证',
      action: '登录',
      description: '用户登录成功',
      ip: req.ip,
      user_agent: req.headers['user-agent']
    });

    // 生成Token
    const token = generateToken(user);

    res.json({
      message: '登录成功',
      data: {
        token,
        user: user.toSafeJSON()
      }
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 获取当前用户信息
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [{ model: Role, as: 'role' }],
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    res.json({ data: user });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 修改密码
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: '旧密码和新密码不能为空' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: '新密码长度不能少于6位' });
    }

    const user = await User.findByPk(req.user.id);
    const isValid = await user.validatePassword(oldPassword);

    if (!isValid) {
      return res.status(400).json({ message: '旧密码错误' });
    }

    await user.update({ password: newPassword });

    res.json({ message: '密码修改成功' });
  } catch (error) {
    console.error('修改密码错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 退出登录
exports.logout = async (req, res) => {
  try {
    // 记录操作日志
    await OperationLog.create({
      user_id: req.user.id,
      module: '认证',
      action: '退出',
      description: '用户退出登录',
      ip: req.ip,
      user_agent: req.headers['user-agent']
    });

    res.json({ message: '退出成功' });
  } catch (error) {
    console.error('退出登录错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};
