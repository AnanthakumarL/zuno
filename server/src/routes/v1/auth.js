import { Router } from 'express';
import { createHash } from 'crypto';
import { Account } from '../../db/models/index.js';

function hashPassword(pw) {
  return createHash('sha256').update(pw).digest('hex');
}

const router = Router();

const otpStore = new Map();

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

router.post('/signup/request-otp', async (req, res, next) => {
  try {
    const { email, phone, name } = req.body;
    const identifier = email || phone;
    if (!identifier) return res.status(400).json({ message: 'email or phone required' });
    const otp = generateOtp();
    otpStore.set(identifier, { otp, name, expires: Date.now() + 10 * 60 * 1000 });
    res.json({ message: 'OTP sent', otp });
  } catch (err) { next(err); }
});

router.post('/signup/verify', async (req, res, next) => {
  try {
    const { email, phone, otp, name } = req.body;
    const identifier = email || phone;
    const entry = otpStore.get(identifier);
    if (!entry || entry.otp !== otp || Date.now() > entry.expires)
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    otpStore.delete(identifier);

    let account = null;
    if (phone) account = await Account.findOne({ where: { phone } });
    if (!account && email) account = await Account.findOne({ where: { email } });

    let created = false;
    if (!account) {
      account = await Account.create({ name: name || entry.name, email: email || null, phone: phone || null });
      created = true;
    }

    res.json({ message: created ? 'Signup successful' : 'Login successful', account, created });
  } catch (err) { next(err); }
});

router.post('/login', async (req, res, next) => {
  try {
    const { identifier, password } = req.body;
    const account = await Account.findOne({
      where: identifier.includes('@')
        ? { email: identifier }
        : { phone: identifier },
    });
    if (!account) return res.status(401).json({ message: 'Account not found' });
    if (account.attributes?.password) {
      if (!password || hashPassword(password) !== account.attributes.password)
        return res.status(401).json({ message: 'Invalid password' });
    }
    res.json({ message: 'Login successful', account });
  } catch (err) { next(err); }
});

router.post('/otp/request', async (req, res, next) => {
  try {
    const { identifier } = req.body;
    if (!identifier) return res.status(400).json({ message: 'identifier required' });
    const otp = generateOtp();
    otpStore.set(identifier, { otp, expires: Date.now() + 10 * 60 * 1000 });
    res.json({ message: 'OTP sent', otp });
  } catch (err) { next(err); }
});

router.post('/otp/verify', async (req, res, next) => {
  try {
    const { identifier, otp } = req.body;
    const entry = otpStore.get(identifier);
    if (!entry || entry.otp !== otp || Date.now() > entry.expires)
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    otpStore.delete(identifier);

    let account = await Account.findOne({
      where: identifier.includes('@') ? { email: identifier } : { phone: identifier },
    });
    let created = false;
    if (!account) {
      const isPhone = !identifier.includes('@');
      account = await Account.create({
        name: isPhone ? `User${identifier.slice(-4)}` : identifier.split('@')[0],
        phone: isPhone ? identifier : null,
        email: isPhone ? null : identifier,
      });
      created = true;
    }

    res.json({ message: created ? 'Account created successfully' : 'Login successful', account, created });
  } catch (err) { next(err); }
});

export default router;
