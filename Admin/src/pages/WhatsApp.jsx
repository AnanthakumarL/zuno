import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
  MessageCircle, Smartphone, Loader2, CheckCircle2, XCircle,
  Link2, Unlink, Send, RefreshCw, Copy,
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

// Common country codes (dial codes) — India first.
const COUNTRY_CODES = [
  { code: '91',  label: 'India (+91)' },
  { code: '1',   label: 'USA / Canada (+1)' },
  { code: '44',  label: 'UK (+44)' },
  { code: '971', label: 'UAE (+971)' },
  { code: '966', label: 'Saudi Arabia (+966)' },
  { code: '65',  label: 'Singapore (+65)' },
  { code: '60',  label: 'Malaysia (+60)' },
  { code: '61',  label: 'Australia (+61)' },
  { code: '49',  label: 'Germany (+49)' },
  { code: '33',  label: 'France (+33)' },
  { code: '94',  label: 'Sri Lanka (+94)' },
  { code: '880', label: 'Bangladesh (+880)' },
  { code: '977', label: 'Nepal (+977)' },
  { code: '92',  label: 'Pakistan (+92)' },
  { code: '81',  label: 'Japan (+81)' },
  { code: '86',  label: 'China (+86)' },
  { code: '27',  label: 'South Africa (+27)' },
  { code: '234', label: 'Nigeria (+234)' },
];

const StatusPill = ({ status }) => {
  const map = {
    connected:    { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Connected' },
    pairing:      { cls: 'bg-amber-50 text-amber-700 border-amber-200',       label: 'Waiting for link' },
    connecting:   { cls: 'bg-blue-50 text-blue-700 border-blue-200',          label: 'Connecting…' },
    disconnected: { cls: 'bg-dark-100 text-dark-600 border-dark-200',         label: 'Not connected' },
  };
  const s = map[status] || map.disconnected;
  return <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${s.cls}`}>{s.label}</span>;
};

export default function WhatsAppPage() {
  const [status, setStatus] = useState(null);
  const [cc, setCc] = useState('91');
  const [number, setNumber] = useState('');
  const [generating, setGenerating] = useState(false);
  const [code, setCode] = useState('');

  const [testTo, setTestTo] = useState('');
  const [testMsg, setTestMsg] = useState('Hello from Zuno 👋');
  const [sending, setSending] = useState(false);
  const pollRef = useRef(null);

  const fetchStatus = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/whatsapp/status`);
      if (!res.ok) return;
      const data = await res.json();
      setStatus(data);
      if (data.pairingCode) setCode(data.pairingCode);
      if (data.connected) setCode('');
    } catch { /* ignore poll errors */ }
  };

  useEffect(() => {
    fetchStatus();
    pollRef.current = setInterval(fetchStatus, 3000);
    return () => clearInterval(pollRef.current);
  }, []);

  const connected = status?.connected;
  const available = status?.available !== false;

  const generateCode = async () => {
    const digits = number.replace(/\D/g, '');
    if (digits.length < 6) { toast.error('Enter a valid WhatsApp number'); return; }
    setGenerating(true);
    setCode('');
    try {
      const res = await fetch(`${API_BASE_URL}/whatsapp/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cc + digits }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to generate code');
      setCode(data.code);
      toast.success('Linking code generated');
      fetchStatus();
    } catch (err) {
      toast.error(err.message || 'Failed to generate code');
    } finally {
      setGenerating(false);
    }
  };

  const disconnect = async () => {
    if (!window.confirm('Disconnect the linked WhatsApp number? OTPs will stop sending until you link again.')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/whatsapp/logout`, { method: 'POST' });
      if (!res.ok) throw new Error();
      setCode('');
      toast.success('Disconnected');
      fetchStatus();
    } catch {
      toast.error('Failed to disconnect');
    }
  };

  const sendTest = async () => {
    const digits = testTo.replace(/\D/g, '');
    if (digits.length < 8) { toast.error('Enter recipient number with country code'); return; }
    setSending(true);
    try {
      const res = await fetch(`${API_BASE_URL}/whatsapp/send-test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: digits, message: testMsg }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send');
      toast.success('Message sent ✅');
    } catch (err) {
      toast.error(err.message || 'Failed to send');
    } finally {
      setSending(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard?.writeText(code.replace('-', '')).then(
      () => toast.success('Code copied'),
      () => {},
    );
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
          <MessageCircle className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold font-heading text-dark-900">WhatsApp OTP</h1>
          <p className="text-dark-500 mt-1">Link a WhatsApp number to send login/signup verification codes.</p>
        </div>
      </div>

      {!available && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-sm text-red-700">
          WhatsApp service is unavailable on the server. {status?.lastError ? `(${status.lastError})` : ''}
        </div>
      )}

      {/* Status card */}
      <div className="bg-white rounded-2xl border border-dark-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-dark-900">Connection</h2>
          <div className="flex items-center gap-3">
            <StatusPill status={status?.status} />
            <button onClick={fetchStatus} className="p-1.5 rounded-lg text-dark-400 hover:bg-dark-50" title="Refresh">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {connected ? (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="font-semibold text-dark-900">Linked &amp; active</p>
                <p className="text-sm text-dark-500">Sending OTPs from <span className="font-mono">+{status?.me}</span></p>
              </div>
            </div>
            <button
              onClick={disconnect}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-sm font-semibold transition-colors"
            >
              <Unlink className="w-4 h-4" /> Disconnect
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-dark-500">
            <div className="w-11 h-11 rounded-full bg-dark-100 flex items-center justify-center">
              <XCircle className="w-6 h-6 text-dark-400" />
            </div>
            <p className="text-sm">No number linked yet. Generate a linking code below.</p>
          </div>
        )}
      </div>

      {/* Link a number */}
      {!connected && (
        <div className="bg-white rounded-2xl border border-dark-100 shadow-sm p-6">
          <h2 className="text-lg font-bold text-dark-900 mb-1 flex items-center gap-2">
            <Link2 className="w-5 h-5 text-dark-400" /> Link a WhatsApp number
          </h2>
          <p className="text-sm text-dark-500 mb-5">
            Choose the country code, enter the WhatsApp number you want to send OTPs from, then generate a linking code.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-[200px,1fr,auto] gap-3 items-end">
            <div>
              <label className="block text-xs font-semibold text-dark-600 mb-1.5 uppercase tracking-wide">Country code</label>
              <select value={cc} onChange={(e) => setCc(e.target.value)} className="input-field">
                {COUNTRY_CODES.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-dark-600 mb-1.5 uppercase tracking-wide">WhatsApp number</label>
              <div className="flex items-center gap-2">
                <span className="px-3 py-2.5 rounded-lg bg-dark-50 border border-dark-200 text-dark-600 font-mono text-sm">+{cc}</span>
                <input
                  type="tel"
                  value={number}
                  onChange={(e) => setNumber(e.target.value.replace(/\D/g, '').slice(0, 14))}
                  placeholder="9876543210"
                  className="input-field flex-1"
                />
              </div>
            </div>
            <button
              onClick={generateCode}
              disabled={generating}
              className="btn-primary flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl whitespace-nowrap disabled:opacity-60"
            >
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Smartphone className="w-4 h-4" />}
              {generating ? 'Generating…' : 'Generate code'}
            </button>
          </div>

          {/* Pairing code + instructions */}
          {code && (
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5"
            >
              <p className="text-sm font-medium text-emerald-800 mb-2">Enter this code in WhatsApp:</p>
              <div className="flex items-center gap-3 mb-4">
                <span className="font-mono text-3xl font-bold tracking-[0.25em] text-emerald-900">{code}</span>
                <button onClick={copyCode} className="p-2 rounded-lg text-emerald-700 hover:bg-emerald-100" title="Copy code">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <ol className="text-sm text-emerald-800 space-y-1.5 list-decimal list-inside">
                <li>On the phone with WhatsApp number <span className="font-mono font-semibold">+{cc}{number}</span>, open <strong>WhatsApp</strong>.</li>
                <li>Go to <strong>Settings → Linked Devices → Link a Device</strong>.</li>
                <li>Tap <strong>“Link with phone number instead”</strong>.</li>
                <li>Enter the code above. This page will update to <strong>Connected</strong> automatically.</li>
              </ol>
              <p className="text-xs text-emerald-600 mt-3">The code expires in a few minutes — generate a new one if it doesn’t link.</p>
            </motion.div>
          )}

          {status?.lastError && !code && (
            <p className="text-xs text-amber-600 mt-3">{status.lastError}</p>
          )}
        </div>
      )}

      {/* Send test message */}
      {connected && (
        <div className="bg-white rounded-2xl border border-dark-100 shadow-sm p-6">
          <h2 className="text-lg font-bold text-dark-900 mb-1 flex items-center gap-2">
            <Send className="w-5 h-5 text-dark-400" /> Send a test message
          </h2>
          <p className="text-sm text-dark-500 mb-5">Verify delivery by sending yourself a message (number with country code, e.g. 91XXXXXXXXXX).</p>
          <div className="grid grid-cols-1 sm:grid-cols-[1fr,1.5fr,auto] gap-3 items-end">
            <div>
              <label className="block text-xs font-semibold text-dark-600 mb-1.5 uppercase tracking-wide">To (with country code)</label>
              <input value={testTo} onChange={(e) => setTestTo(e.target.value)} placeholder="919876543210" className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-dark-600 mb-1.5 uppercase tracking-wide">Message</label>
              <input value={testMsg} onChange={(e) => setTestMsg(e.target.value)} className="input-field" />
            </div>
            <button onClick={sendTest} disabled={sending} className="btn-primary flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl disabled:opacity-60">
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Send
            </button>
          </div>
        </div>
      )}

      {/* How it works */}
      <div className="bg-white rounded-2xl border border-dark-100 shadow-sm p-6 text-sm text-dark-600 space-y-2">
        <h3 className="font-bold text-dark-900">How it works</h3>
        <p>Once a number is linked, customers logging in or signing up receive their 6-digit OTP on WhatsApp from this number. If WhatsApp isn’t connected, the system falls back to its demo behaviour so logins still work.</p>
        <p className="text-dark-400">Note: keep this WhatsApp number active. If WhatsApp shows the device as logged out, re-link it here.</p>
      </div>
    </div>
  );
}
