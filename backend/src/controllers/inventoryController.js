const { Inventory, InventoryLog, Warehouse, sequelize } = require('../models');
const { Op } = require('sequelize');

exports.getList = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, keyword, warehouse_id, product_type } = req.query;
    const offset = (page - 1) * pageSize;

    const where = {};
    if (keyword) {
      where.product_name = { [Op.like]: `%${keyword}%` };
    }
    if (warehouse_id) {
      where.warehouse_id = warehouse_id;
    }
    if (product_type) {
      where.product_type = product_type;
    }

    const { count, rows } = await Inventory.findAndCountAll({
      where,
      offset,
      limit: parseInt(pageSize),
      order: [['created_at', 'DESC']],
      include: [
        { model: Warehouse, as: 'warehouse', attributes: ['id', 'name', 'type'] }
      ]
    });

    res.json({ data: rows, total: count, page: parseInt(page), pageSize: parseInt(pageSize) });
  } catch (error) {
    console.error('获取库存列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.getById = async (req, res) => {
  try {
    const inventory = await Inventory.findByPk(req.params.id, {
      include: [
        { model: Warehouse, as: 'warehouse' },
        { model: InventoryLog, as: 'logs', order: [['created_at', 'DESC']], limit: 20 }
      ]
    });

    if (!inventory) {
      return res.status(404).json({ message: '库存记录不存在' });
    }

    res.json({ data: inventory });
  } catch (error) {
    console.error('获取库存详情错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.create = async (req, res) => {
  try {
    const inventory = await Inventory.create(req.body);
    res.status(201).json({ message: '创建成功', data: inventory });
  } catch (error) {
    console.error('创建库存错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.update = async (req, res) => {
  try {
    const inventory = await Inventory.findByPk(req.params.id);
    if (!inventory) {
      return res.status(404).json({ message: '库存记录不存在' });
    }
    await inventory.update(req.body);
    res.json({ message: '更新成功', data: inventory });
  } catch (error) {
    console.error('更新库存错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.delete = async (req, res) => {
  try {
    const inventory = await Inventory.findByPk(req.params.id);
    if (!inventory) {
      return res.status(404).json({ message: '库存记录不存在' });
    }
    await inventory.destroy();
    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除库存错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.stockIn = async (req, res) => {
  try {
    const { id, quantity, operator, remark } = req.body;

    const inventory = await Inventory.findByPk(id);
    if (!inventory) {
      return res.status(404).json({ message: '库存记录不存在' });
    }

    const newQuantity = parseFloat(inventory.quantity) + parseFloat(quantity);
    await inventory.update({ quantity: newQuantity });

    await InventoryLog.create({
      inventory_id: id,
      type: 'in',
      quantity,
      before_quantity: inventory.quantity,
      after_quantity: newQuantity,
      operator,
      remark
    });

    res.json({ message: '入库成功', data: inventory });
  } catch (error) {
    console.error('入库错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.stockOut = async (req, res) => {
  try {
    const { id, quantity, operator, remark } = req.body;

    const inventory = await Inventory.findByPk(id);
    if (!inventory) {
      return res.status(404).json({ message: '库存记录不存在' });
    }

    if (parseFloat(inventory.quantity) < parseFloat(quantity)) {
      return res.status(400).json({ message: '库存不足' });
    }

    const newQuantity = parseFloat(inventory.quantity) - parseFloat(quantity);
    await inventory.update({ quantity: newQuantity });

    await InventoryLog.create({
      inventory_id: id,
      type: 'out',
      quantity,
      before_quantity: inventory.quantity,
      after_quantity: newQuantity,
      operator,
      remark
    });

    res.json({ message: '出库成功', data: inventory });
  } catch (error) {
    console.error('出库错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.getWarningList = async (req, res) => {
  try {
    const warnings = await Inventory.findAll({
      where: {
        [Op.and]: sequelize.where(
          sequelize.col('quantity'),
          { [Op.lte]: sequelize.col('warning_quantity') }
        )
      },
      include: [
        { model: Warehouse, as: 'warehouse', attributes: ['id', 'name'] }
      ],
      order: [['quantity', 'ASC']]
    });

    res.json({ data: warnings });
  } catch (error) {
    console.error('获取库存预警列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};
