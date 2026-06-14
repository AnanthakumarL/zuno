// WhatsApp bot powered by Baileys (multi-device). Lets an admin link their own
// WhatsApp number via a pairing code ("Link with phone number" in WhatsApp →
// Linked Devices) and then send OTP / notification messages from that number.
//
// Design notes:
// • Baileys is imported lazily so a broken/missing dependency can never crash
//   the rest of the API — WhatsApp simply reports itself "unavailable".
// • Auth state is persisted in the DB (WhatsappAuth table) instead of on disk,
//   so the linked session survives redeploys on ephemeral-filesystem hosts.
// • A single shared socket is managed here (one linked number per deployment).

import { WhatsappAuth } from '../db/models/index.js';

let baileys = null;     // lazily-loaded Baileys module
let makePino = null;

let sock = null;
let authStore = null;
let intentionalClose = false;
let pairResolve = null;
let pairReject = null;

const stateInfo = {
  available: true,                 // false if Baileys failed to load
  status: 'disconnected',          // disconnected | connecting | pairing | connected
  me: null,                        // linked number (digits)
  pairingCode: null,               // current pairing code, e.g. "ABCD-EFGH"
  pairingFor: null,                // number we're trying to link
  lastError: null,
  updatedAt: Date.now(),
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const jidToNumber = (jid) => String(jid || '').split(':')[0].split('@')[0];
const touch = () => { stateInfo.updatedAt = Date.now(); };

async function loadDeps() {
  if (baileys) return;
  baileys = await import('@whiskeysockets/baileys');
  const pinoMod = await import('pino');
  makePino = pinoMod.default;
}

// ── DB-backed Baileys auth state (mirrors useMultiFileAuthState) ──────────────
async function makeDbAuthState() {
  const { initAuthCreds, BufferJSON, proto } = baileys;

  const writeData = (id, value) =>
    WhatsappAuth.upsert({ id, data: JSON.stringify(value, BufferJSON.replacer) });
  const readData = async (id) => {
    const row = await WhatsappAuth.findByPk(id);
    if (!row || row.data == null) return null;
    try { return JSON.parse(row.data, BufferJSON.reviver); } catch { return null; }
  };
  const removeData = (id) => WhatsappAuth.destroy({ where: { id } });

  const creds = (await readData('creds')) || initAuthCreds();

  return {
    state: {
      creds,
      keys: {
        get: async (type, ids) => {
          const out = {};
          await Promise.all(ids.map(async (id) => {
            let value = await readData(`${type}-${id}`);
            if (type === 'app-state-sync-key' && value && proto?.Message?.AppStateSyncKeyData) {
              value = proto.Message.AppStateSyncKeyData.fromObject(value);
            }
            out[id] = value;
          }));
          return out;
        },
        set: async (data) => {
          const tasks = [];
          for (const category of Object.keys(data)) {
            for (const id of Object.keys(data[category])) {
              const value = data[category][id];
              const key = `${category}-${id}`;
              tasks.push(value ? writeData(key, value) : removeData(key));
            }
          }
          await Promise.all(tasks);
        },
      },
    },
    saveCreds: () => writeData('creds', creds),
    clearAll: () => WhatsappAuth.destroy({ where: {}, truncate: true }).catch(() => WhatsappAuth.destroy({ where: {} })),
  };
}

// ── Socket lifecycle ──────────────────────────────────────────────────────────
async function createSocket() {
  await loadDeps();
  if (sock) return sock;

  authStore = await makeDbAuthState();
  const logger = makePino({ level: 'silent' });
  const { version } = await baileys.fetchLatestBaileysVersion().catch(() => ({ version: undefined }));
  const browser = baileys.Browsers?.ubuntu ? baileys.Browsers.ubuntu('Chrome') : ['Zuno', 'Chrome', '1.0.0'];

  intentionalClose = false;
  sock = baileys.default({
    version,
    auth: {
      creds: authStore.state.creds,
      keys: baileys.makeCacheableSignalKeyStore
        ? baileys.makeCacheableSignalKeyStore(authStore.state.keys, logger)
        : authStore.state.keys,
    },
    logger,
    printQRInTerminal: false,
    browser,
    markOnlineOnConnect: false,
    syncFullHistory: false,
  });
  stateInfo.status = stateInfo.status === 'pairing' ? 'pairing' : 'connecting';
  touch();

  sock.ev.on('creds.update', () => { authStore?.saveCreds().catch(() => {}); });
  sock.ev.on('connection.update', onConnectionUpdate);
  return sock;
}

async function onConnectionUpdate(update) {
  const { connection, lastDisconnect, qr } = update;

  // A `qr` means the socket is up and waiting to be linked — the moment to
  // request a pairing code for the number the admin asked to link.
  if (qr && stateInfo.pairingFor && sock && !sock.authState?.creds?.registered && !stateInfo.pairingCode) {
    try {
      const raw = await sock.requestPairingCode(stateInfo.pairingFor);
      stateInfo.pairingCode = formatCode(raw);
      stateInfo.status = 'pairing';
      stateInfo.lastError = null;
      touch();
      if (pairResolve) { pairResolve(stateInfo.pairingCode); pairResolve = pairReject = null; }
    } catch (err) {
      stateInfo.lastError = err?.message || 'Failed to get pairing code';
      touch();
      if (pairReject) { pairReject(err); pairResolve = pairReject = null; }
    }
  }

  if (connection === 'open') {
    stateInfo.status = 'connected';
    stateInfo.me = jidToNumber(sock?.user?.id);
    stateInfo.pairingCode = null;
    stateInfo.pairingFor = null;
    stateInfo.lastError = null;
    touch();
  } else if (connection === 'close') {
    const code = lastDisconnect?.error?.output?.statusCode;
    const loggedOut = baileys && code === baileys.DisconnectReason.loggedOut;
    sock = null;
    stateInfo.me = null;
    touch();

    if (intentionalClose) {
      stateInfo.status = 'disconnected';
      return;
    }
    if (loggedOut) {
      stateInfo.status = 'disconnected';
      stateInfo.lastError = 'Logged out — re-link required';
      await authStore?.clearAll?.().catch(() => {});
      authStore = null;
      return;
    }
    // Transient drop — reconnect using the stored creds.
    stateInfo.status = 'connecting';
    stateInfo.lastError = lastDisconnect?.error?.message || 'Connection closed';
    setTimeout(() => { createSocket().catch(() => {}); }, 3000);
  }
}

function formatCode(code) {
  const c = String(code || '').replace(/[^A-Z0-9]/gi, '');
  return c.length === 8 ? `${c.slice(0, 4)}-${c.slice(4)}` : c;
}

// ── Public API ────────────────────────────────────────────────────────────────

// Called at server startup: reconnect automatically if a link already exists.
export async function initWhatsApp() {
  try {
    await loadDeps();
    const existing = await WhatsappAuth.findByPk('creds');
    if (existing) {
      await createSocket();
      console.log('[WhatsApp] Reconnecting existing linked session…');
    } else {
      console.log('[WhatsApp] No linked session. Link a number from Admin → WhatsApp.');
    }
  } catch (err) {
    stateInfo.available = false;
    stateInfo.lastError = err?.message || 'WhatsApp unavailable';
    console.warn('[WhatsApp] Unavailable:', stateInfo.lastError);
  }
}

export function getStatus() {
  return {
    available: stateInfo.available,
    status: stateInfo.status,
    connected: stateInfo.status === 'connected',
    me: stateInfo.me,
    pairingCode: stateInfo.pairingCode,
    pairingFor: stateInfo.pairingFor,
    lastError: stateInfo.lastError,
  };
}

// Link a new number. `phoneDigits` = full international number, digits only
// (country code + number, no '+'). Returns the pairing code to enter in WhatsApp.
export async function startPairing(phoneDigits) {
  await loadDeps();
  const digits = String(phoneDigits || '').replace(/\D/g, '');
  if (digits.length < 8) throw new Error('Enter a valid number with country code');
  if (stateInfo.status === 'connected') throw new Error('A number is already linked. Disconnect it first.');

  // Start fresh so we link the new number cleanly.
  await disconnect({ silent: true }).catch(() => {});
  stateInfo.pairingFor = digits;
  stateInfo.pairingCode = null;
  stateInfo.status = 'pairing';
  touch();

  await createSocket();

  return new Promise((resolve, reject) => {
    pairResolve = resolve;
    pairReject = reject;
    setTimeout(() => {
      if (pairReject) {
        pairReject(new Error('Timed out generating the code. Please try again.'));
        pairResolve = pairReject = null;
      }
    }, 60000);
  });
}

export async function disconnect({ silent = false } = {}) {
  intentionalClose = true;
  try { await sock?.logout(); } catch { /* ignore */ }
  try { sock?.ev?.removeAllListeners?.('connection.update'); } catch { /* ignore */ }
  try { sock?.end?.(undefined); } catch { /* ignore */ }
  sock = null;
  try { await authStore?.clearAll?.(); } catch { /* ignore */ }
  authStore = null;
  stateInfo.status = 'disconnected';
  stateInfo.me = null;
  stateInfo.pairingCode = null;
  stateInfo.pairingFor = null;
  if (!silent) stateInfo.lastError = null;
  touch();
}

async function waitForConnection(ms = 8000) {
  const start = Date.now();
  while (Date.now() - start < ms) {
    if (stateInfo.status === 'connected') return true;
    if (stateInfo.status === 'disconnected') break;
    await sleep(300);
  }
  return stateInfo.status === 'connected';
}

export async function sendText(toDigits, text) {
  const digits = String(toDigits || '').replace(/\D/g, '');
  if (!digits) throw new Error('Recipient number required');

  if (stateInfo.status !== 'connected') {
    if (!sock && stateInfo.available) await initWhatsApp().catch(() => {});
    await waitForConnection(8000);
  }
  if (stateInfo.status !== 'connected' || !sock) throw new Error('WhatsApp is not connected');

  const jid = `${digits}@s.whatsapp.net`;
  await sock.sendMessage(jid, { text });
  return true;
}

// Convenience used by the auth/OTP flow.
export async function sendOtp(toDigits, otp) {
  const text =
    `*Zuno* verification code: *${otp}*\n\n` +
    `Enter this code to continue. It is valid for 10 minutes.\n` +
    `Do not share this code with anyone.`;
  return sendText(toDigits, text);
}

export function isConnected() {
  return stateInfo.status === 'connected';
}
