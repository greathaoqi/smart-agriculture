const { Role, User } = require('../models');
const { Op } = require('sequelize');

exports.getList = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, keyword, status } = req.query;
    const offset = (page - 1) * pageSize;

    const where = {};
    if (keyword) {
      where[Op.or] = [
        { name: { [Op.like]: `%${keyword}%` } },
        { code: { [Op.like]: `%${keyword}%` } }
      ];
    }
    if (status !== undefined) {
      where.status = status;
    }

    const { count, rows } = await Role.findAndCountAll({
      where,
      offset,
      limit: parseInt(pageSize),
      order: [['sort', 'ASC'], ['created_at', 'DESC']],
      include: [{
        model: User,
        as: 'users',
        attributes: ['id']
      }]
    });

    const data = rows.map(role => ({
      ...role.toJSON(),
      user_count: role.users?.length || 0
    }));

    res.json({ data, total: count, page: parseInt(page), pageSize: parseInt(pageSize) });
  } catch (error) {
    console.error('获取角色列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.getAll = async (req, res) => {
  try {
    const roles = await Role.findAll({
      where: { status: 1 },
      order: [['sort', 'ASC']]
    });
    res.json({ data: roles });
  } catch (error) {
    console.error('获取角色列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.getById = async (req, res) => {
  try {
    const role = await Role.findByPk(req.params.id);

    if (!role) {
      return res.status(404).json({ message: '角色不存在' });
    }

    res.json({ data: role });
  } catch (error) {
    console.error('获取角色详情错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.create = async (req, res) => {
  try {
    const role = await Role.create(req.body);
    res.status(201).json({ message: '创建成功', data: role });
  } catch (error) {
    console.error('创建角色错误:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: '角色名称或编码已存在' });
    }
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.update = async (req, res) => {
  try {
    const role = await Role.findByPk(req.params.id);
    if (!role) {
      return res.status(404).json({ message: '角色不存在' });
    }
    await role.update(req.body);
    res.json({ message: '更新成功', data: role });
  } catch (error) {
    console.error('更新角色错误:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: '角色名称或编码已存在' });
    }
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.delete = async (req, res) => {
  try {
    const role = await Role.findByPk(req.params.id);
    if (!role) {
      return res.status(404).json({ message: '角色不存在' });
    }

    if (role.code === 'admin') {
      return res.status(400).json({ message: '不能删除超级管理员角色' });
    }

    const userCount = await User.count({ where: { role_id: role.id } });
    if (userCount > 0) {
      return res.status(400).json({ message: '该角色下存在用户，不能删除' });
    }

    await role.destroy();
    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除角色错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};
