import { Router } from 'express';
import { DeliveryAddress } from '../../db/models/index.js';

const router = Router();

// GET /addresses?phone=919876543210
router.get('/', async (req, res, next) => {
  try {
    const { phone } = req.query;
    if (!phone) return res.json({ data: [] });
    const rows = await DeliveryAddress.findAll({
      where: { phone },
      order: [['created_at', 'DESC']],
      attributes: { exclude: [] },
    });
    res.json({ data: rows });
  } catch (err) { next(err); }
});

// POST /addresses
router.post('/', async (req, res, next) => {
  try {
    const { phone, label, name, fname, lname, addr1, addr2, city, state, pin } = req.body;
    const resolvedName = name || [fname, lname].filter(Boolean).join(' ') || null;
    if (!phone || !resolvedName || !addr1 || !pin) {
      return res.status(400).json({ message: 'phone, name, addr1 and pin are required' });
    }

    // Avoid exact duplicates (same phone + addr1 + pin) — update if exists
    const existing = await DeliveryAddress.findOne({ where: { phone, addr1, pin } });
    if (existing) {
      await existing.update({ label, name: resolvedName, addr2, city, state });
      return res.json(existing);
    }

    const address = await DeliveryAddress.create({ phone, label, name: resolvedName, addr1, addr2, city, state, pin });
    res.status(201).json(address);
  } catch (err) { next(err); }
});

// DELETE /addresses/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const addr = await DeliveryAddress.findByPk(req.params.id);
    if (!addr) return res.status(404).json({ message: 'Not found' });
    await addr.destroy();
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
});

export default router;
