import { Router } from 'express';
import { Account } from '../../db/models/index.js';
import { config } from '../../config.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page || '1');
    const pageSize = Math.min(parseInt(req.query.page_size || config.pagination.defaultPageSize), config.pagination.maxPageSize);
    const where = {};
    if (req.query.is_active !== undefined) where.is_active = req.query.is_active === 'true';
    const { count, rows } = await Account.findAndCountAll({
      where, limit: pageSize, offset: (page - 1) * pageSize, order: [['created_at', 'DESC']],
    });
    res.json({ data: rows, total: count, page, page_size: pageSize });
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const user = await Account.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) { next(err); }
});

export default router;
