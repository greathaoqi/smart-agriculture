const { Customer, Order, sequelize } = require('../models');
const { Op } = require('sequelize');

exports.getList = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, keyword, type } = req.query;
    const offset = (page - 1) * pageSize;

    const where = {};
    if (keyword) {
      where[Op.or] = [
        { name: { [Op.like]: `%${keyword}%` } },
        { contact: { [Op.like]: `%${keyword}%` } },
        { phone: { [Op.like]: `%${keyword}%` } }
      ];
    }
    if (type) {
      where.type = type;
    }

    const { count, rows } = await Customer.findAndCountAll({
      where,
      offset,
      limit: parseInt(pageSize),
      order: [['created_at', 'DESC']]
    });

    res.json({ data: rows, total: count, page: parseInt(page), pageSize: parseInt(pageSize) });
  } catch (error) {
    console.error('获取客户列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.getAll = async (req, res) => {
  try {
    const customers = await Customer.findAll({
      order: [['name', 'ASC']]
    });
    res.json({ data: customers });
  } catch (error) {
    console.error('获取客户列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.getById = async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id, {
      include: [{
        model: Order,
        as: 'orders',
        order: [['created_at', 'DESC']],
        limit: 10
      }]
    });

    if (!customer) {
      return res.status(404).json({ message: '客户不存在' });
    }

    res.json({ data: customer });
  } catch (error) {
    console.error('获取客户详情错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.create = async (req, res) => {
  try {
    const customer = await Customer.create(req.body);
    res.status(201).json({ message: '创建成功', data: customer });
  } catch (error) {
    console.error('创建客户错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.update = async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: '客户不存在' });
    }
    await customer.update(req.body);
    res.json({ message: '更新成功', data: customer });
  } catch (error) {
    console.error('更新客户错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.delete = async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: '客户不存在' });
    }
    await customer.destroy();
    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除客户错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.getStats = async (req, res) => {
  try {
    const customerId = req.params.id;

    const orderCount = await Order.count({
      where: { customer_id: customerId }
    });

    const totalAmount = await Order.sum('total_amount', {
      where: { customer_id: customerId }
    }) || 0;

    res.json({
      data: {
        orderCount,
        totalAmount
      }
    });
  } catch (error) {
    console.error('获取客户统计错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};
