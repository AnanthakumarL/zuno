import { Router } from 'express';
import { ProductionUser } from '../../db/models/index.js';
import { config } from '../../config.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page || '1');
    const pageSize = Math.min(parseInt(req.query.page_size || config.pagination.defaultPageSize), config.pagination.maxPageSize);
    const where = {};
    if (req.query.is_active !== undefined) where.is_active = req.query.is_active === 'true';
    const { count, rows } = await ProductionUser.findAndCountAll({
      where, limit: pageSize, offset: (page - 1) * pageSize, order: [['created_at', 'DESC']],
      attributes: { exclude: ['password'] },
    });
    res.json({ data: rows, total: count, page, page_size: pageSize });
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const user = await ProductionUser.create(req.body);
    const { password, ...safe } = user.toJSON();
    res.status(201).json(safe);
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const item = await ProductionUser.findByPk(req.params.id, { attributes: { exclude: ['password'] } });
    if (!item) return res.status(404).json({ message: 'Not found' });
    res.json(item);
  } catch (err) { next(err); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const item = await ProductionUser.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });
    await item.update(req.body);
    const { password, ...safe } = item.toJSON();
    res.json(safe);
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const item = await ProductionUser.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });
    await item.destroy();
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
});

export default router;
