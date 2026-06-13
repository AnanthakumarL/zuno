import { Router } from 'express';
import { Job } from '../../db/models/index.js';
import { config } from '../../config.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page || '1');
    const pageSize = Math.min(parseInt(req.query.page_size || config.pagination.defaultPageSize), config.pagination.maxPageSize);
    const where = {};
    if (req.query.status) where.status = req.query.status;
    const { count, rows } = await Job.findAndCountAll({
      where, limit: pageSize, offset: (page - 1) * pageSize, order: [['created_at', 'DESC']],
    });
    res.json({ data: rows, total: count, page, page_size: pageSize });
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try { res.status(201).json(await Job.create(req.body)); } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const item = await Job.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });
    res.json(item);
  } catch (err) { next(err); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const item = await Job.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });
    res.json(await item.update(req.body));
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const item = await Job.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });
    await item.destroy();
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
});

export default router;
