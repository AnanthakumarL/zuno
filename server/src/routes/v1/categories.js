import { Router } from 'express';
import { Op } from 'sequelize';
import { Category } from '../../db/models/index.js';
import { config } from '../../config.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page || '1');
    const pageSize = Math.min(parseInt(req.query.page_size || config.pagination.defaultPageSize), config.pagination.maxPageSize);
    const where = {};
    if (req.query.parent_id) where.parent_category_id = req.query.parent_id;
    if (req.query.is_active !== undefined) where.is_active = req.query.is_active === 'true';
    const { count, rows } = await Category.findAndCountAll({
      where, limit: pageSize, offset: (page - 1) * pageSize, order: [['order', 'ASC']],
    });
    res.json({ data: rows, total: count, page, page_size: pageSize });
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const cat = await Category.create(req.body);
    res.status(201).json(cat);
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const cat = await Category.findByPk(req.params.id);
    if (!cat) return res.status(404).json({ message: 'Category not found' });
    res.json(cat);
  } catch (err) { next(err); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const cat = await Category.findByPk(req.params.id);
    if (!cat) return res.status(404).json({ message: 'Category not found' });
    await cat.update(req.body);
    res.json(cat);
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const cat = await Category.findByPk(req.params.id);
    if (!cat) return res.status(404).json({ message: 'Category not found' });
    await cat.destroy();
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
});

export default router;
