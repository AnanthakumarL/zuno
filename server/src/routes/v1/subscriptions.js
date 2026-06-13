import { Router } from 'express';
import { sequelize } from '../../db/index.js';
import { Account } from '../../db/models/index.js';

const router = Router();

// GET /subscriptions — stats + list of all premium accounts
router.get('/', async (req, res, next) => {
  try {
    const accounts = await Account.findAll({
      where: sequelize.literal("JSON_EXTRACT(attributes, '$.is_premium') = true"),
      attributes: ['id', 'name', 'phone', 'email', 'attributes', 'created_at'],
      order: [['created_at', 'DESC']],
    });

    const subscribers = accounts.map(a => ({
      id: a.id,
      name: a.name,
      phone: a.phone,
      email: a.email,
      plan: a.attributes?.premium_plan || null,
      amount: a.attributes?.premium_amount ? Number(a.attributes.premium_amount) : null,
      premium_since: a.attributes?.premium_since || null,
      payment_id: a.attributes?.premium_payment_id || null,
    }));

    const total = subscribers.length;
    const totalAmount = subscribers.reduce((sum, s) => sum + (s.amount || 0), 0);
    const monthly = subscribers.filter(s => s.plan === 'monthly').length;
    const annual  = subscribers.filter(s => s.plan === 'annual').length;

    res.json({ total, totalAmount, monthly, annual, subscribers });
  } catch (err) { next(err); }
});

export default router;
