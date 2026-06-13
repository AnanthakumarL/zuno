import { Router } from 'express';
import { Op, fn, col, literal } from 'sequelize';
import { Order } from '../../db/models/index.js';
import { config } from '../../config.js';

const router = Router();

function generateOrderNumber() {
  return 'ORD-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
}

router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page || '1');
    const pageSize = Math.min(parseInt(req.query.page_size || config.pagination.defaultPageSize), config.pagination.maxPageSize);
    const where = {};
    if (req.query.status) where.status = req.query.status;
    if (req.query.customer_email) where.customer_email = req.query.customer_email;
    if (req.query.customer_identifier) where.customer_identifier = req.query.customer_identifier;
    if (req.query.account_id) where.account_id = req.query.account_id;
    if (req.query.customer_phone) {
      where[Op.or] = [
        { customer_phone: req.query.customer_phone },
        { customer_identifier: req.query.customer_phone },
      ];
    }
    if (req.query.production_identifier) where.production_identifier = req.query.production_identifier;
    if (req.query.production_assigned === 'true') where.production_identifier = { [Op.ne]: null };
    if (req.query.production_assigned === 'false') where.production_identifier = null;
    const { count, rows } = await Order.findAndCountAll({
      where, limit: pageSize, offset: (page - 1) * pageSize, order: [['created_at', 'DESC']],
    });
    res.json({ data: rows, total: count, page, page_size: pageSize });
  } catch (err) { next(err); }
});

router.get('/statistics', async (req, res, next) => {
  try {
    const statuses = ['pending', 'assigned', 'processing', 'shipped', 'delivered', 'cancelled'];
    const counts = {};
    for (const s of statuses) counts[s] = await Order.count({ where: { status: s } });
    const totalResult = await Order.sum('total');
    res.json({ counts, total_revenue: totalResult || 0 });
  } catch (err) { next(err); }
});

router.get('/number/:order_number', async (req, res, next) => {
  try {
    const order = await Order.findOne({ where: { order_number: req.params.order_number } });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const data = { ...req.body, order_number: req.body.order_number || generateOrderNumber() };
    const order = await Order.create(data);
    res.status(201).json(order);
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) { next(err); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    await order.update(req.body);
    res.json(order);
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    await order.destroy();
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
});

export default router;
