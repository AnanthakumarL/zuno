import { useState, useEffect } from 'react';
import { Crown, Users, IndianRupee, CalendarDays, RefreshCw, TrendingUp, Clock, BadgeCheck, X } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-dark-100 shadow-sm p-6 flex items-start gap-4"
    >
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm text-dark-500 font-medium">{label}</p>
        <p className="text-3xl font-bold text-dark-900 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-dark-400 mt-1">{sub}</p>}
      </div>
    </motion.div>
  );
}

const PLAN_BADGE = {
  monthly: 'bg-violet-100 text-violet-700 border-violet-200',
  annual:  'bg-amber-100  text-amber-700  border-amber-200',
};

export default function Subscriptions() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/subscriptions`);
      if (!res.ok) throw new Error('Failed to load');
      setData(await res.json());
    } catch {
      toast.error('Could not load subscription data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Admin confirms the payment manually → activate Premium for the account.
  const markPaid = async (accountId) => {
    setActingId(accountId);
    try {
      const res = await fetch(`${API_BASE_URL}/payments/activate-premium`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account_id: accountId }),
      });
      if (!res.ok) throw new Error('Failed');
      toast.success('Premium activated for member');
      await fetchData();
    } catch {
      toast.error('Could not activate premium');
    } finally {
      setActingId(null);
    }
  };

  // Dismiss a pending request that couldn't be verified.
  const dismissPending = async (accountId) => {
    setActingId(accountId);
    try {
      const res = await fetch(`${API_BASE_URL}/payments/reject-premium`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account_id: accountId }),
      });
      if (!res.ok) throw new Error('Failed');
      toast.success('Request dismissed');
      await fetchData();
    } catch {
      toast.error('Could not dismiss request');
    } finally {
      setActingId(null);
    }
  };

  const fmt = (n) => n?.toLocaleString('en-IN') ?? '—';
  const fmtDate = (iso) => iso ? new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
      </div>
    );
  }

  const { total = 0, totalAmount = 0, monthly = 0, annual = 0, subscribers = [], pending = [] } = data || {};

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-amber-100 text-amber-700 rounded-xl">
            <Crown className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold font-heading text-dark-900">Subscriptions</h1>
            <p className="text-dark-500 mt-0.5">Zuno Premium members overview</p>
          </div>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-dark-200 text-dark-600 hover:bg-dark-50 transition-colors text-sm font-medium"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Total Subscribers"
          value={total}
          sub="All active premium members"
          color="bg-violet-100 text-violet-700"
        />
        <StatCard
          icon={IndianRupee}
          label="Total Revenue"
          value={`₹${fmt(totalAmount)}`}
          sub="From tracked plan payments"
          color="bg-emerald-100 text-emerald-700"
        />
        <StatCard
          icon={TrendingUp}
          label="Monthly Plans"
          value={monthly}
          sub="₹99 / month"
          color="bg-blue-100 text-blue-700"
        />
        <StatCard
          icon={Crown}
          label="Annual Plans"
          value={annual}
          sub="₹599 / year"
          color="bg-amber-100 text-amber-700"
        />
      </div>

      {/* Pending verification — members who paid and await manual confirmation */}
      {pending.length > 0 && (
        <div className="bg-white rounded-2xl border border-amber-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-amber-100 bg-amber-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              <h2 className="text-lg font-bold text-dark-900">Pending Verification</h2>
            </div>
            <span className="text-sm font-medium text-amber-700">{pending.length} awaiting</span>
          </div>
          <p className="px-6 pt-3 text-sm text-dark-500">
            These members paid and are waiting for manual confirmation. Verify the payment in your
            Razorpay dashboard, then click <strong>Mark Paid</strong> to activate Premium.
          </p>
          <div className="overflow-x-auto p-2">
            <table className="w-full text-sm">
              <thead className="text-dark-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Member</th>
                  <th className="px-4 py-3 text-left font-semibold">Phone</th>
                  <th className="px-4 py-3 text-left font-semibold">Plan</th>
                  <th className="px-4 py-3 text-left font-semibold">Amount</th>
                  <th className="px-4 py-3 text-left font-semibold">Payment ID</th>
                  <th className="px-4 py-3 text-left font-semibold">Requested</th>
                  <th className="px-4 py-3 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-100">
                {pending.map((p) => (
                  <tr key={p.id} className="hover:bg-amber-50/40 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-dark-900">{p.name || '—'}</p>
                      {p.email && <p className="text-xs text-dark-400">{p.email}</p>}
                    </td>
                    <td className="px-4 py-3 text-dark-600">{p.phone || '—'}</td>
                    <td className="px-4 py-3">
                      {p.plan ? (
                        <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${PLAN_BADGE[p.plan] || 'bg-dark-100 text-dark-600 border-dark-200'}`}>
                          {p.plan}
                        </span>
                      ) : <span className="text-dark-400 text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3 font-semibold text-dark-900">
                      {p.amount ? `₹${fmt(p.amount)}` : <span className="text-dark-400 font-normal text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      {p.payment_id ? (
                        <span className="font-mono text-xs text-dark-500 bg-dark-100 px-2 py-1 rounded break-all">{p.payment_id}</span>
                      ) : <span className="text-dark-400 text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3 text-dark-600">{fmtDate(p.requested_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => markPaid(p.id)}
                          disabled={actingId === p.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold transition-colors"
                        >
                          <BadgeCheck className="w-4 h-4" /> Mark Paid
                        </button>
                        <button
                          onClick={() => dismissPending(p.id)}
                          disabled={actingId === p.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dark-200 text-dark-500 hover:bg-dark-50 disabled:opacity-50 text-xs font-medium transition-colors"
                        >
                          <X className="w-4 h-4" /> Dismiss
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Subscribers table */}
      <div className="bg-white rounded-2xl border border-dark-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-dark-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-dark-900">Subscriber List</h2>
          <span className="text-sm text-dark-400">{total} member{total !== 1 ? 's' : ''}</span>
        </div>

        {subscribers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Crown className="w-10 h-10 text-dark-200 mb-3" />
            <p className="text-dark-500 font-medium">No premium subscribers yet</p>
            <p className="text-dark-400 text-sm mt-1">Members will appear here after subscribing</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-dark-50 text-dark-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold">Member</th>
                  <th className="px-6 py-3 text-left font-semibold">Phone</th>
                  <th className="px-6 py-3 text-left font-semibold">Plan</th>
                  <th className="px-6 py-3 text-left font-semibold">Amount</th>
                  <th className="px-6 py-3 text-left font-semibold">Subscribed On</th>
                  <th className="px-6 py-3 text-left font-semibold">Payment ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-100">
                {subscribers.map((s, i) => (
                  <motion.tr
                    key={s.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-dark-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                          <Crown className="w-4 h-4 text-amber-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-dark-900">{s.name || '—'}</p>
                          {s.email && <p className="text-xs text-dark-400">{s.email}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-dark-600">{s.phone || '—'}</td>
                    <td className="px-6 py-4">
                      {s.plan ? (
                        <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${PLAN_BADGE[s.plan] || 'bg-dark-100 text-dark-600 border-dark-200'}`}>
                          {s.plan}
                        </span>
                      ) : (
                        <span className="text-dark-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-semibold text-dark-900">
                      {s.amount ? `₹${fmt(s.amount)}` : <span className="text-dark-400 font-normal text-xs">—</span>}
                    </td>
                    <td className="px-6 py-4 text-dark-600">
                      <div className="flex items-center gap-1.5">
                        <CalendarDays className="w-3.5 h-3.5 text-dark-400" />
                        {fmtDate(s.premium_since)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {s.payment_id ? (
                        <span className="font-mono text-xs text-dark-500 bg-dark-100 px-2 py-1 rounded">
                          {s.payment_id}
                        </span>
                      ) : (
                        <span className="text-dark-400 text-xs">—</span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
