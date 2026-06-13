import { Router } from 'express';
import { Op } from 'sequelize';
import { Product } from '../../db/models/index.js';
import { upload } from '../../middleware/upload.js';
import { config } from '../../config.js';

const router = Router();

function productResponse(p) {
  const obj = p.toJSON();
  delete obj.image_data;
  obj.image_url = obj.image_mime ? `/api/v1/products/${obj.id}/image` : null;
  return obj;
}

router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page || '1');
    const pageSize = Math.min(parseInt(req.query.page_size || config.pagination.defaultPageSize), config.pagination.maxPageSize);
    const where = {};
    if (req.query.category_id) where.category_id = req.query.category_id;
    if (req.query.section_id) where.section_id = req.query.section_id;
    if (req.query.is_active !== undefined) where.is_active = req.query.is_active === 'true';
    if (req.query.featured !== undefined) where.featured = req.query.featured === 'true';
    if (req.query.product_type) where.product_type = req.query.product_type;
    const { count, rows } = await Product.findAndCountAll({
      where, limit: pageSize, offset: (page - 1) * pageSize,
      attributes: { exclude: ['image_data'] }, // image_mime kept for image_url presence check
      order: [['created_at', 'DESC']],
    });
    res.json({ data: rows.map(productResponse), total: count, page, page_size: pageSize });
  } catch (err) { next(err); }
});

router.get('/search', async (req, res, next) => {
  try {
    const q = req.query.q || '';
    const rows = await Product.findAll({
      where: { name: { [Op.like]: `%${q}%` }, is_active: true },
      attributes: { exclude: ['image_data'] }, // image_mime kept for image_url presence check
      limit: 20,
    });
    res.json({ data: rows.map(productResponse) });
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(productResponse(product));
  } catch (err) { next(err); }
});

router.post('/with-image', upload.single('image'), async (req, res, next) => {
  try {
    const data = JSON.parse(req.body.product || '{}');
    if (req.file) { data.image_data = req.file.buffer; data.image_mime = req.file.mimetype; }
    const product = await Product.create(data);
    res.status(201).json(productResponse(product));
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id, { attributes: { exclude: ['image_data'] } });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ ...product.toJSON(), image_url: `/api/v1/products/${product.id}/image` });
  } catch (err) { next(err); }
});

router.get('/:id/image', async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id, { attributes: ['image_data', 'image_mime'] });
    if (!product || !product.image_data) return res.status(404).json({ message: 'Image not found' });
    res.set('Content-Type', product.image_mime || 'image/jpeg');
    res.send(product.image_data);
  } catch (err) { next(err); }
});

router.post('/:id/image', upload.single('image'), async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (!req.file) return res.status(400).json({ message: 'Image file required' });
    await product.update({ image_data: req.file.buffer, image_mime: req.file.mimetype });
    res.json({ message: 'Image updated' });
  } catch (err) { next(err); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    await product.update(req.body);
    res.json(productResponse(product));
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    await product.destroy();
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
});

export default router;
