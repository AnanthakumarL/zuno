import { Router } from 'express';
import { DeliveryUser } from '../../db/models/index.js';
import { config } from '../../config.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page || '1');
    const pageSize = Math.min(parseInt(req.query.page_size || config.pagination.defaultPageSize), config.pagination.maxPageSize);
    const where = {};
    if (req.query.is_active !== undefined) where.is_active = req.query.is_active === 'true';
    const { count, rows } = await DeliveryUser.findAndCountAll({
      where, limit: pageSize, offset: (page - 1) * pageSize, order: [['created_at', 'DESC']],
    });
    res.json({ data: rows, total: count, page, page_size: pageSize });
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try { res.status(201).json(await DeliveryUser.create(req.body)); } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const item = await DeliveryUser.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });
    res.json(item);
  } catch (err) { next(err); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const item = await DeliveryUser.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });
    res.json(await item.update(req.body));
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const item = await DeliveryUser.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });
    await item.destroy();
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
});

export default router;
