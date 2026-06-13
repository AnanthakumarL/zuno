import { Router } from 'express';
import { Section } from '../../db/models/index.js';
import { config } from '../../config.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page || '1');
    const pageSize = Math.min(parseInt(req.query.page_size || config.pagination.defaultPageSize), config.pagination.maxPageSize);
    const { count, rows } = await Section.findAndCountAll({
      limit: pageSize, offset: (page - 1) * pageSize, order: [['order', 'ASC']],
    });
    res.json({ data: rows, total: count, page, page_size: pageSize });
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const section = await Section.create(req.body);
    res.status(201).json(section);
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const section = await Section.findByPk(req.params.id);
    if (!section) return res.status(404).json({ message: 'Section not found' });
    res.json(section);
  } catch (err) { next(err); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const section = await Section.findByPk(req.params.id);
    if (!section) return res.status(404).json({ message: 'Section not found' });
    await section.update(req.body);
    res.json(section);
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const section = await Section.findByPk(req.params.id);
    if (!section) return res.status(404).json({ message: 'Section not found' });
    await section.destroy();
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
});

export default router;
