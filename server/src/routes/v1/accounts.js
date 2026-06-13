import { Router } from 'express';
import { Account } from '../../db/models/index.js';
import { config } from '../../config.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page || '1');
    const pageSize = Math.min(parseInt(req.query.page_size || config.pagination.defaultPageSize), config.pagination.maxPageSize);
    const { count, rows } = await Account.findAndCountAll({
      limit: pageSize, offset: (page - 1) * pageSize, order: [['created_at', 'DESC']],
    });
    res.json({ data: rows, total: count, page, page_size: pageSize });
  } catch (err) { next(err); }
});

router.get('/by-phone/:phone', async (req, res, next) => {
  try {
    const account = await Account.findOne({ where: { phone: req.params.phone } });
    if (!account) return res.status(404).json({ message: 'Account not found' });
    res.json(account);
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const account = await Account.create(req.body);
    res.status(201).json(account);
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const account = await Account.findByPk(req.params.id);
    if (!account) return res.status(404).json({ message: 'Account not found' });
    res.json(account);
  } catch (err) { next(err); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const account = await Account.findByPk(req.params.id);
    if (!account) return res.status(404).json({ message: 'Account not found' });
    await account.update(req.body);
    res.json(account);
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const account = await Account.findByPk(req.params.id);
    if (!account) return res.status(404).json({ message: 'Account not found' });
    await account.destroy();
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
});

export default router;
