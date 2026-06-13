import { Router } from 'express';
import { Cart } from '../../db/models/index.js';

const router = Router();

// GET /cart?account_id=XXX
router.get('/', async (req, res, next) => {
  try {
    const { account_id } = req.query;
    if (!account_id) return res.json({ items: [] });
    const cart = await Cart.findOne({ where: { account_id } });
    res.json({ items: cart?.items || [] });
  } catch (err) { next(err); }
});

// PUT /cart  — upsert full cart
router.put('/', async (req, res, next) => {
  try {
    const { account_id, items } = req.body;
    if (!account_id) return res.status(400).json({ message: 'account_id required' });
    await Cart.upsert({ account_id, items: items || [] });
    res.json({ ok: true });
  } catch (err) { next(err); }
});

// DELETE /cart/:account_id  — clear on order placed / logout
router.delete('/:account_id', async (req, res, next) => {
  try {
    await Cart.destroy({ where: { account_id: req.params.account_id } });
    res.json({ ok: true });
  } catch (err) { next(err); }
});

export default router;
