const { Order, Customer, sequelize } = require('../models');
const { Op } = require('sequelize');

exports.getList = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, keyword, status, customer_id, start_date, end_date } = req.query;
    const offset = (page - 1) * pageSize;

    const where = {};
    if (keyword) {
      where.order_no = { [Op.like]: `%${keyword}%` };
    }
    if (status !== undefined) {
      where.status = status;
    }
    if (customer_id) {
      where.customer_id = customer_id;
    }
    if (start_date && end_date) {
      where.created_at = { [Op.between]: [start_date, end_date] };
    }

    const { count, rows } = await Order.findAndCountAll({
      where,
      offset,
      limit: parseInt(pageSize),
      order: [['created_at', 'DESC']],
      include: [
        { model: Customer, as: 'customer', attributes: ['id', 'name', 'contact', 'phone'] }
      ]
    });

    res.json({ data: rows, total: count, page: parseInt(page), pageSize: parseInt(pageSize) });
  } catch (error) {
    console.error('获取订单列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.getById = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        { model: Customer, as: 'customer' }
      ]
    });

    if (!order) {
      return res.status(404).json({ message: '订单不存在' });
    }

    res.json({ data: order });
  } catch (error) {
    console.error('获取订单详情错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.create = async (req, res) => {
  try {
    const orderNo = 'ORD' + Date.now() + Math.random().toString(36).substr(2, 4).toUpperCase();
    const order = await Order.create({
      ...req.body,
      order_no: orderNo
    });
    res.status(201).json({ message: '创建成功', data: order });
  } catch (error) {
    console.error('创建订单错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.update = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ message: '订单不存在' });
    }
    await order.update(req.body);
    res.json({ message: '更新成功', data: order });
  } catch (error) {
    console.error('更新订单错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.delete = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ message: '订单不存在' });
    }
    await order.destroy();
    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除订单错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByPk(req.params.id);

    if (!order) {
      return res.status(404).json({ message: '订单不存在' });
    }

    await order.update({ status });
    res.json({ message: '状态更新成功', data: order });
  } catch (error) {
    console.error('更新订单状态错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.getStats = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const where = {};

    if (start_date && end_date) {
      where.created_at = { [Op.between]: [start_date, end_date] };
    }

    const totalAmount = await Order.sum('total_amount', { where }) || 0;
    const totalCount = await Order.count({ where });

    const statusCounts = await Order.findAll({
      where,
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status']
    });

    res.json({
      data: {
        totalAmount,
        totalCount,
        statusCounts
      }
    });
  } catch (error) {
    console.error('获取订单统计错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};
