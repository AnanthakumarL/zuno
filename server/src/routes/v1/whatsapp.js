import { Router } from 'express';
import { getStatus, startPairing, disconnect, sendText, isConnected } from '../../services/whatsapp.js';

const router = Router();

// Current connection status (admin panel polls this).
router.get('/status', (req, res) => {
  res.json(getStatus());
});

// Begin linking a number. Body: { phone } where phone = country code + number
// (digits, with or without '+'). Returns the pairing code to enter in WhatsApp.
router.post('/connect', async (req, res, next) => {
  try {
    const phone = String(req.body?.phone || '').replace(/\D/g, '');
    if (!phone) return res.status(400).json({ message: 'phone (with country code) is required' });
    const code = await startPairing(phone);
    res.json({ message: 'Pairing code generated', code, status: getStatus() });
  } catch (err) {
    res.status(400).json({ message: err.message || 'Could not start pairing' });
  }
});

// Unlink / disconnect the current number.
router.post('/logout', async (req, res, next) => {
  try {
    await disconnect();
    res.json({ message: 'Disconnected', status: getStatus() });
  } catch (err) { next(err); }
});

// Send a test WhatsApp message. Body: { to, message }.
router.post('/send-test', async (req, res, next) => {
  try {
    if (!isConnected()) return res.status(400).json({ message: 'WhatsApp is not connected' });
    const to = String(req.body?.to || '').replace(/\D/g, '');
    const message = String(req.body?.message || '').trim() || 'Test message from Zuno ✅';
    if (!to) return res.status(400).json({ message: 'Recipient number (with country code) is required' });
    await sendText(to, message);
    res.json({ message: 'Message sent' });
  } catch (err) {
    res.status(400).json({ message: err.message || 'Failed to send message' });
  }
});

export default router;
