import { Router } from 'express';
import { Account } from '../../db/models/index.js';

const router = Router();

// GET /subscriptions — stats, active premium members, and pending requests
// awaiting manual payment verification.
//
// NOTE: we intentionally fetch all accounts and filter in JS rather than using
// a JSON_EXTRACT WHERE clause — that is MySQL/MariaDB-only syntax and throws a
// 500 on PostgreSQL (production runs on Render Postgres).
router.get('/', async (req, res, next) => {
  try {
    const accounts = await Account.findAll({
      attributes: ['id', 'name', 'phone', 'email', 'attributes', 'created_at'],
      order: [['created_at', 'DESC']],
    });

    const subscribers = [];
    const pending = [];

    for (const a of accounts) {
      const attrs = a.attributes || {};
      const base = {
        id: a.id,
        name: a.name,
        phone: a.phone,
        email: a.email,
        plan: attrs.premium_plan || null,
        amount: attrs.premium_amount != null ? Number(attrs.premium_amount) : null,
        payment_id: attrs.premium_payment_id || null,
      };

      if (attrs.is_premium) {
        subscribers.push({ ...base, premium_since: attrs.premium_since || null });
      } else if (attrs.premium_pending) {
        pending.push({ ...base, requested_at: attrs.premium_requested_at || null });
      }
    }

    const total = subscribers.length;
    const totalAmount = subscribers.reduce((sum, s) => sum + (s.amount || 0), 0);
    const monthly = subscribers.filter(s => s.plan === 'monthly').length;
    const annual  = subscribers.filter(s => s.plan === 'annual').length;

    res.json({ total, totalAmount, monthly, annual, subscribers, pending });
  } catch (err) { next(err); }
});

export default router;
