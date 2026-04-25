const { User, Role, OperationLog } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

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
    console.error('获取当前用户错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 更新当前用户信息
exports.updateCurrentUser = async (req, res) => {
  try {
    const { real_name, phone, email, avatar } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    await user.update({ real_name, phone, email, avatar });

    res.json({ message: '更新成功', data: user.toSafeJSON() });
  } catch (error) {
    console.error('更新当前用户错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 修改当前用户密码
exports.changePassword = async (req, res) => {
  try {
    const { old_password, new_password } = req.body;

    if (!old_password || !new_password) {
      return res.status(400).json({ message: '请输入旧密码和新密码' });
    }

    if (new_password.length < 6) {
      return res.status(400).json({ message: '新密码长度不能少于6位' });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    // 验证旧密码
    const isMatch = await bcrypt.compare(old_password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: '旧密码错误' });
    }

    await user.update({ password: new_password });

    res.json({ message: '密码修改成功' });
  } catch (error) {
    console.error('修改密码错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 获取用户列表
exports.getList = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, keyword, status } = req.query;
    const offset = (page - 1) * pageSize;

    const where = {};
    if (keyword) {
      where[Op.or] = [
        { username: { [Op.like]: `%${keyword}%` } },
        { real_name: { [Op.like]: `%${keyword}%` } }
      ];
    }
    if (status !== undefined) {
      where.status = status;
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      include: [{ model: Role, as: 'role' }],
      attributes: { exclude: ['password'] },
      offset,
      limit: parseInt(pageSize),
      order: [['created_at', 'DESC']]
    });

    res.json({
      data: rows,
      total: count,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    });
  } catch (error) {
    console.error('获取用户列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 获取单个用户
exports.getById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      include: [{ model: Role, as: 'role' }],
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    res.json({ data: user });
  } catch (error) {
    console.error('获取用户错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 创建用户
exports.create = async (req, res) => {
  try {
    const { username, password, real_name, phone, email, role_id, status = 1 } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: '用户名和密码不能为空' });
    }

    // 检查用户名是否已存在
    const existUser = await User.findOne({ where: { username } });
    if (existUser) {
      return res.status(400).json({ message: '用户名已存在' });
    }

    const user = await User.create({
      username,
      password,
      real_name,
      phone,
      email,
      role_id,
      status
    });

    // 记录操作日志
    await OperationLog.create({
      user_id: req.user.id,
      module: '用户管理',
      action: '创建',
      description: `创建用户: ${username}`,
      ip: req.ip
    });

    res.status(201).json({ message: '创建成功', data: user.toSafeJSON() });
  } catch (error) {
    console.error('创建用户错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 更新用户
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { real_name, phone, email, role_id, status } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    await user.update({ real_name, phone, email, role_id, status });

    // 记录操作日志
    await OperationLog.create({
      user_id: req.user.id,
      module: '用户管理',
      action: '更新',
      description: `更新用户: ${user.username}`,
      ip: req.ip
    });

    res.json({ message: '更新成功', data: user.toSafeJSON() });
  } catch (error) {
    console.error('更新用户错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 删除用户
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ message: '不能删除自己' });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    await user.destroy();

    // 记录操作日志
    await OperationLog.create({
      user_id: req.user.id,
      module: '用户管理',
      action: '删除',
      description: `删除用户: ${user.username}`,
      ip: req.ip
    });

    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除用户错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 重置密码
exports.resetPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ message: '密码长度不能少于6位' });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    await user.update({ password });

    // 记录操作日志
    await OperationLog.create({
      user_id: req.user.id,
      module: '用户管理',
      action: '重置密码',
      description: `重置用户密码: ${user.username}`,
      ip: req.ip
    });

    res.json({ message: '密码重置成功' });
  } catch (error) {
    console.error('重置密码错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};
