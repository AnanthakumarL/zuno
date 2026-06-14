import { Router } from 'express';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { Op } from 'sequelize';
import { config } from '../../config.js';
import { Order, Product, Account } from '../../db/models/index.js';

const router = Router();

const FREE_THRESHOLD = 999;
const DELIVERY_CHARGE = 400;
const QR_EXPIRE_SECS = 900;

function generateOrderNumber() {
  return 'ORD-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
}

function getRazorpay() {
  return new Razorpay({ key_id: config.razorpay.keyId, key_secret: config.razorpay.keySecret });
}

async function resolveCart(rawItems) {
  const resolved = [];
  let subtotal = 0;
  for (const item of rawItems) {
    const product = await Product.findByPk(item.product_id);
    if (!product) throw Object.assign(new Error(`Product not found: ${item.product_id}`), { status: 400 });
    const price = parseFloat(product.price);
    const lineTotal = price * item.quantity;
    subtotal += lineTotal;
    resolved.push({ product_id: product.id, name: product.name, price, quantity: item.quantity, total: lineTotal });
  }
  const isFree = subtotal >= FREE_THRESHOLD;
  const delivery = isFree ? 0 : DELIVERY_CHARGE;
  return { resolved, subtotal, delivery, total: subtotal + delivery };
}

async function createDbOrder(delivery, resolved, subtotal, deliveryCost, total, extra = {}) {
  return Order.create({
    order_number: generateOrderNumber(),
    customer_name: delivery.customer_name,
    customer_identifier: delivery.customer_identifier,
    customer_email: delivery.customer_email || null,
    customer_phone: delivery.customer_phone || null,
    shipping_address: delivery.shipping_address,
    items: resolved,
    subtotal,
    shipping_cost: deliveryCost,
    total,
    source: 'web',
    ...extra,
  });
}

// ── Razorpay modal ───────────────────────────────────────────────────────────

router.post('/create-order', async (req, res, next) => {
  try {
    const { items, ...delivery } = req.body;
    if (!items?.length) return res.status(400).json({ message: 'No items provided' });

    const { resolved, subtotal, delivery: dc, total } = await resolveCart(items);
    const order = await createDbOrder(delivery, resolved, subtotal, dc, total);

    const rp = getRazorpay();
    const rzpOrder = await rp.orders.create({
      amount: Math.round(total * 100),
      currency: config.razorpay.currency,
      receipt: order.order_number,
    });

    await order.update({ notes: JSON.stringify({ razorpay_order_id: rzpOrder.id }) });

    res.json({
      razorpay_key_id: config.razorpay.keyId,
      razorpay_order_id: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      order,
    });
  } catch (err) { next(err); }
});

router.post('/verify', async (req, res, next) => {
  try {
    const { order_id, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const expected = crypto
      .createHmac('sha256', config.razorpay.keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');
    if (expected !== razorpay_signature)
      return res.status(400).json({ verified: false, message: 'Invalid signature' });
    if (order_id) await Order.update({ status: 'processing' }, { where: { id: order_id } });
    res.json({ verified: true });
  } catch (err) { next(err); }
});

// ── Dynamic UPI QR ───────────────────────────────────────────────────────────

router.post('/create-qr-order', async (req, res, next) => {
  try {
    const { items, ...delivery } = req.body;
    if (!items?.length) return res.status(400).json({ message: 'No items provided' });

    const { resolved, subtotal, delivery: dc, total } = await resolveCart(items);
    const order = await createDbOrder(delivery, resolved, subtotal, dc, total);

    const rp = getRazorpay();
    const qr = await rp.qrCode.create({
      type: 'upi_qr',
      name: 'Zuno',
      usage: 'single_use',
      fixed_amount: true,
      payment_amount: Math.round(total * 100),
      description: `Order ${order.order_number}`,
      close_by: Math.floor(Date.now() / 1000) + QR_EXPIRE_SECS,
    });

    await order.update({ notes: JSON.stringify({ razorpay_qr_id: qr.id }) });

    res.json({ qr_image_url: qr.image_url, expires_at: qr.close_by, order });
  } catch (err) { next(err); }
});

// Poll by DB order ID — looks up Razorpay QR ID from notes
router.get('/qr-status/:order_id', async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.order_id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    let notes = {};
    try { notes = JSON.parse(order.notes || '{}'); } catch {}
    if (!notes.razorpay_qr_id) return res.json({ paid: false });

    const rp = getRazorpay();
    const qr = await rp.qrCode.fetch(notes.razorpay_qr_id);
    const paid = (qr.payments_amount_received ?? 0) > 0;
    if (paid && order.status === 'pending') await order.update({ status: 'processing' });
    res.json({ paid });
  } catch (err) { next(err); }
});

// ── Static QR ────────────────────────────────────────────────────────────────

router.post('/create-static-qr-order', async (req, res, next) => {
  try {
    if (!config.razorpay.staticQrId)
      return res.status(400).json({ message: 'Static QR not configured' });

    const { items, ...delivery } = req.body;
    if (!items?.length) return res.status(400).json({ message: 'No items provided' });

    const { resolved, subtotal, delivery: dc, total } = await resolveCart(items);
    const order = await createDbOrder(delivery, resolved, subtotal, dc, total);

    const rp = getRazorpay();
    const staticQr = await rp.qrCode.fetch(config.razorpay.staticQrId);

    res.json({ qr_image_url: staticQr.image_url, expires_at: null, order });
  } catch (err) { next(err); }
});

// Poll by DB order ID — paid once admin marks order as processing
router.get('/static-qr-check/:order_id', async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.order_id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ paid: ['processing', 'shipped', 'delivered'].includes(order.status) });
  } catch (err) { next(err); }
});

// ── Activate Premium ─────────────────────────────────────────────────────────

// Record a premium payment that needs manual verification by an admin.
// This does NOT grant premium — it just queues the account for review.
router.post('/request-premium', async (req, res, next) => {
  try {
    const { account_id, razorpay_payment_id, plan, amount } = req.body;
    if (!account_id) return res.status(400).json({ message: 'account_id required' });

    const account = await Account.findByPk(account_id);
    if (!account) return res.status(404).json({ message: 'Account not found' });

    const attrs = account.attributes || {};
    // Already a premium member — nothing to queue.
    if (attrs.is_premium) return res.json({ success: true, already_premium: true, account });

    await account.update({
      attributes: {
        ...attrs,
        premium_pending: true,
        premium_requested_at: new Date().toISOString(),
        premium_payment_id: razorpay_payment_id || attrs.premium_payment_id || null,
        premium_plan: plan || attrs.premium_plan || null,
        premium_amount: amount != null ? Number(amount) : (attrs.premium_amount ?? null),
      },
    });

    res.json({ success: true, account });
  } catch (err) { next(err); }
});

// Admin: confirm a payment and activate premium. Falls back to the plan/amount/
// payment id captured when the request was made, so the admin can activate with
// just an account_id. Also clears the pending flag.
router.post('/activate-premium', async (req, res, next) => {
  try {
    const { account_id, razorpay_payment_id, plan, amount } = req.body;
    if (!account_id) return res.status(400).json({ message: 'account_id required' });

    const account = await Account.findByPk(account_id);
    if (!account) return res.status(404).json({ message: 'Account not found' });

    const attrs = account.attributes || {};
    await account.update({
      attributes: {
        ...attrs,
        is_premium: true,
        premium_since: new Date().toISOString(),
        premium_payment_id: razorpay_payment_id || attrs.premium_payment_id || null,
        premium_plan: plan || attrs.premium_plan || null,
        premium_amount: amount != null ? Number(amount) : (attrs.premium_amount ?? null),
        premium_pending: false,
        premium_requested_at: null,
      },
    });

    res.json({ success: true, account });
  } catch (err) { next(err); }
});

// Admin: dismiss a pending premium request (e.g. payment couldn't be verified).
router.post('/reject-premium', async (req, res, next) => {
  try {
    const { account_id } = req.body;
    if (!account_id) return res.status(400).json({ message: 'account_id required' });

    const account = await Account.findByPk(account_id);
    if (!account) return res.status(404).json({ message: 'Account not found' });

    const attrs = account.attributes || {};
    await account.update({
      attributes: { ...attrs, premium_pending: false, premium_requested_at: null },
    });

    res.json({ success: true, account });
  } catch (err) { next(err); }
});

// ── Webhook ──────────────────────────────────────────────────────────────────

router.post('/webhook', async (req, res, next) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    if (config.razorpay.webhookSecret && signature) {
      const expected = crypto
        .createHmac('sha256', config.razorpay.webhookSecret)
        .update(JSON.stringify(req.body))
        .digest('hex');
      if (expected !== signature) return res.status(400).json({ message: 'Invalid webhook signature' });
    }
    console.log('[Razorpay Webhook]', req.body.event);

    if (req.body.event === 'payment.captured') {
      const rzpOrderId = req.body.payload?.payment?.entity?.order_id;
      if (rzpOrderId) {
        const order = await Order.findOne({ where: { notes: { [Op.like]: `%${rzpOrderId}%` } } });
        if (order && order.status === 'pending') await order.update({ status: 'processing' });
      }
    }
    res.json({ status: 'ok' });
  } catch (err) { next(err); }
});

export default router;
