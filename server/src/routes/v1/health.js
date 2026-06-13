import { Router } from 'express';
import { sequelize } from '../../db/index.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ status: 'ok', db: 'connected', timestamp: new Date().toISOString() });
  } catch {
    res.status(503).json({ status: 'error', db: 'disconnected' });
  }
});

export default router;
