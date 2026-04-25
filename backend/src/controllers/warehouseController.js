const { Warehouse, Inventory, sequelize } = require('../models');
const { Op } = require('sequelize');

exports.getList = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, keyword, status, type } = req.query;
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
    if (type) {
      where.type = type;
    }

    const { count, rows } = await Warehouse.findAndCountAll({
      where,
      offset,
      limit: parseInt(pageSize),
      order: [['created_at', 'DESC']]
    });

    res.json({ data: rows, total: count, page: parseInt(page), pageSize: parseInt(pageSize) });
  } catch (error) {
    console.error('获取仓库列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.getAll = async (req, res) => {
  try {
    const warehouses = await Warehouse.findAll({
      where: { status: 1 },
      order: [['name', 'ASC']]
    });
    res.json({ data: warehouses });
  } catch (error) {
    console.error('获取仓库列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.getById = async (req, res) => {
  try {
    const warehouse = await Warehouse.findByPk(req.params.id, {
      include: [{
        model: Inventory,
        as: 'inventory'
      }]
    });

    if (!warehouse) {
      return res.status(404).json({ message: '仓库不存在' });
    }

    res.json({ data: warehouse });
  } catch (error) {
    console.error('获取仓库详情错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.create = async (req, res) => {
  try {
    const warehouse = await Warehouse.create(req.body);
    res.status(201).json({ message: '创建成功', data: warehouse });
  } catch (error) {
    console.error('创建仓库错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.update = async (req, res) => {
  try {
    const warehouse = await Warehouse.findByPk(req.params.id);
    if (!warehouse) {
      return res.status(404).json({ message: '仓库不存在' });
    }
    await warehouse.update(req.body);
    res.json({ message: '更新成功', data: warehouse });
  } catch (error) {
    console.error('更新仓库错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.delete = async (req, res) => {
  try {
    const warehouse = await Warehouse.findByPk(req.params.id);
    if (!warehouse) {
      return res.status(404).json({ message: '仓库不存在' });
    }
    await warehouse.destroy();
    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除仓库错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.getStats = async (req, res) => {
  try {
    const warehouseId = req.params.id;

    const inventoryCount = await Inventory.count({
      where: { warehouse_id: warehouseId }
    });

    const totalQuantity = await Inventory.sum('quantity', {
      where: { warehouse_id: warehouseId }
    }) || 0;

    const warningCount = await Inventory.count({
      where: {
        warehouse_id: warehouseId,
        [Op.and]: sequelize.where(
          sequelize.col('quantity'),
          { [Op.lte]: sequelize.col('warning_quantity') }
        )
      }
    });

    res.json({
      data: {
        inventoryCount,
        totalQuantity,
        warningCount
      }
    });
  } catch (error) {
    console.error('获取仓库统计错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};
