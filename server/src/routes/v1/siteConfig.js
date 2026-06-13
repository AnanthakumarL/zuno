import { Router } from 'express';
import { SiteConfig } from '../../db/models/index.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const config = await SiteConfig.findOne();
    res.json(config || {});
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const existing = await SiteConfig.findOne();
    if (existing) return res.status(409).json({ message: 'Site config already exists. Use PUT to update.' });
    res.status(201).json(await SiteConfig.create(req.body));
  } catch (err) { next(err); }
});

router.put('/', async (req, res, next) => {
  try {
    let cfg = await SiteConfig.findOne();
    if (!cfg) cfg = await SiteConfig.create(req.body);
    else await cfg.update(req.body);
    res.json(cfg);
  } catch (err) { next(err); }
});

export default router;
