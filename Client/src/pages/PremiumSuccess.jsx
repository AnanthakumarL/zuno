import React, { useEffect, useState } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Crown, CheckCircle2, AlertCircle, RefreshCw, LogIn } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const API_BASE_URL = (() => {
  const configured = import.meta.env.VITE_API_BASE_URL
  if (configured) return configured
  const protocol = window.location.protocol || 'http:'
  const hostname = window.location.hostname || 'localhost'
  return `${protocol}//${hostname}:7999/api/v1`
})()

export default function PremiumSuccess() {
  const [searchParams] = useSearchParams()
  const { user, updateUser, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  // Razorpay appends these to the callback URL after payment
  const paymentId  = searchParams.get('razorpay_payment_id')
  const linkStatus = searchParams.get('razorpay_payment_link_status')

  const [status, setStatus] = useState('loading') // loading | success | error | login-required

  useEffect(() => {
    // Payment link did not result in a paid status
    if (linkStatus && linkStatus !== 'paid') {
      setStatus('error')
      return
    }

    // No payment ID in callback — user may have landed here directly
    if (!paymentId) {
      setStatus('error')
      return
    }

    // User session expired or not logged in
    if (!isAuthenticated || !user?.id) {
      setStatus('login-required')
      return
    }

    const activate = async () => {
      try {
        let planInfo = {}
        try {
          const raw = localStorage.getItem('zuno_pending_plan')
          if (raw) { planInfo = JSON.parse(raw); localStorage.removeItem('zuno_pending_plan') }
        } catch {}
        await fetch(`${API_BASE_URL}/payments/activate-premium`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            account_id: user.id,
            razorpay_payment_id: paymentId,
            plan: planInfo.plan || null,
            amount: planInfo.amount || null,
          }),
        })
        updateUser({ attributes: { ...(user?.attributes || {}), is_premium: true } })
        setStatus('success')

        // Auto-redirect to shop after 4 seconds
        setTimeout(() => navigate('/menu'), 4000)
      } catch {
        setStatus('error')
      }
    }

    activate()
  }, [paymentId, linkStatus, isAuthenticated])

  return (
    <div className="min-h-screen bg-[#F9F8F6] pt-20 pb-16 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden"
      >

        {/* Loading */}
        {status === 'loading' && (
          <>
            <div className="bg-gradient-to-br from-amber-400 to-amber-600 px-8 pt-10 pb-14 text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-4">
                <RefreshCw size={30} className="text-white animate-spin" />
              </div>
              <h1 className="text-white font-display text-2xl font-bold">Activating Premium…</h1>
              <p className="text-amber-100 text-sm mt-2">Please wait a moment.</p>
            </div>
            <div className="-mt-6 bg-white rounded-t-3xl px-8 py-8 text-center">
              <p className="text-stone-500 text-sm">We're confirming your payment and unlocking your benefits.</p>
            </div>
          </>
        )}

        {/* Success */}
        {status === 'success' && (
          <>
            <div className="bg-gradient-to-br from-amber-400 to-amber-600 px-8 pt-10 pb-14 text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-4">
                <Crown size={30} className="text-white" />
              </div>
              <h1 className="text-white font-display text-2xl font-bold mb-1">Welcome to Premium!</h1>
              <p className="text-amber-100 text-sm">Your membership is now active.</p>
            </div>
            <div className="-mt-6 bg-white rounded-t-3xl px-8 py-8">
              <div className="space-y-3 mb-8">
                {[
                  'Members-only deal prices on products',
                  'Free delivery on every order',
                  '24h early access to every sale',
                  '15-day easy returns',
                  'Priority customer support',
                ].map(b => (
                  <div key={b} className="flex items-center gap-2 text-sm text-stone-700">
                    <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                    {b}
                  </div>
                ))}
              </div>
              <Link
                to="/menu"
                className="flex items-center justify-center gap-2 w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3.5 rounded-xl transition-colors"
              >
                <Crown size={16} /> Start shopping as Premium
              </Link>
              <p className="text-xs text-stone-400 text-center mt-3">Redirecting to shop automatically…</p>
            </div>
          </>
        )}

        {/* Login required */}
        {status === 'login-required' && (
          <>
            <div className="bg-gradient-to-br from-stone-700 to-stone-900 px-8 pt-10 pb-14 text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-4">
                <LogIn size={30} className="text-white" />
              </div>
              <h1 className="text-white font-display text-2xl font-bold mb-1">Payment received!</h1>
              <p className="text-stone-300 text-sm">Log in to activate your Premium membership.</p>
            </div>
            <div className="-mt-6 bg-white rounded-t-3xl px-8 py-8">
              <p className="text-sm text-stone-600 mb-6 text-center">
                Your payment was successful. Please log in so we can activate your account.
                Keep this page open — you'll be redirected back here after logging in.
              </p>
              <Link
                to={`/login?redirect=/premium-success?razorpay_payment_id=${paymentId}&razorpay_payment_link_status=paid`}
                className="flex items-center justify-center gap-2 w-full bg-stone-900 hover:bg-stone-700 text-white font-semibold py-3.5 rounded-xl transition-colors"
              >
                <LogIn size={16} /> Log in to activate
              </Link>
            </div>
          </>
        )}

        {/* Error */}
        {status === 'error' && (
          <>
            <div className="bg-gradient-to-br from-rose-500 to-rose-700 px-8 pt-10 pb-14 text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={30} className="text-white" />
              </div>
              <h1 className="text-white font-display text-2xl font-bold mb-1">Activation failed</h1>
              <p className="text-rose-100 text-sm">Something went wrong.</p>
            </div>
            <div className="-mt-6 bg-white rounded-t-3xl px-8 py-8">
              <p className="text-sm text-stone-600 mb-2 text-center">
                If you were charged, please contact support with your payment ID:
              </p>
              {paymentId && (
                <p className="text-center font-mono text-xs bg-stone-100 rounded-lg px-3 py-2 text-stone-700 mb-6 break-all">
                  {paymentId}
                </p>
              )}
              <div className="flex flex-col gap-3">
                <Link
                  to="/subscribe"
                  className="flex items-center justify-center w-full bg-stone-900 hover:bg-stone-700 text-white font-semibold py-3.5 rounded-xl transition-colors"
                >
                  Back to Subscribe
                </Link>
                <Link
                  to="/contact"
                  className="flex items-center justify-center w-full border border-stone-300 text-stone-700 hover:bg-stone-50 font-medium py-3 rounded-xl transition-colors text-sm"
                >
                  Contact support
                </Link>
              </div>
            </div>
          </>
        )}

      </motion.div>
    </div>
  )
}
