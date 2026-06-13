import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Phone, ArrowRight, ShoppingBag, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [step, setStep] = useState(1) // 1: phone, 2: OTP
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [sentOtp, setSentOtp] = useState('')
  const [loading, setLoading] = useState(false)

  const from = location.state?.from?.pathname || '/'

  const handleRequestOtp = async (e) => {
    e.preventDefault()

    if (phone.length !== 10) {
      toast.error('Phone number must be exactly 10 digits')
      return
    }

    setLoading(true)
    try {
      const identifier = '+91' + phone
      const response = await fetch(`${API_BASE}/auth/otp/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send OTP')
      }

      setSentOtp(data.otp)
      toast.success(`OTP sent to +91${phone}! (Demo: ${data.otp})`)
      setStep(2)
    } catch (error) {
      toast.error(error.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()

    if (!otp || otp.length !== 6) {
      toast.error('Please enter the 6-digit OTP')
      return
    }

    setLoading(true)
    try {
      const identifier = '+91' + phone
      const response = await fetch(`${API_BASE}/auth/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, otp }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'OTP verification failed')
      }

      login(data.account)
      toast.success(data.created ? 'Account created! Welcome to Zuno!' : 'Welcome back!')
      navigate(from, { replace: true })
    } catch (error) {
      toast.error(error.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-parchment via-white to-parchment pt-20 pb-12 px-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 group mb-4">
            <span className="bg-olive-700 p-2 rounded-xl group-hover:bg-olive-900 transition-colors">
              <ShoppingBag size={24} className="text-white" />
            </span>
            <span className="font-display text-xl font-bold text-stone-900 uppercase tracking-[0.18em]">
              Zuno
            </span>
          </Link>
          <h1 className="text-3xl font-display font-bold text-stone-900 mb-2">
            Welcome Back
          </h1>
          <p className="text-stone-600">
            Login to continue shopping
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-stone-200 p-8">
          {step === 1 ? (
            <form onSubmit={handleRequestOtp} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Phone Number
                </label>
                <div className="flex gap-2">
                  <div className="flex items-center px-4 py-3 bg-stone-100 rounded-lg border border-stone-300">
                    <Phone size={20} className="text-stone-500 mr-2" />
                    <span className="font-medium text-stone-700">+91</span>
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="9876543210"
                    maxLength={10}
                    className="flex-1 px-4 py-3 rounded-lg border border-stone-300 focus:border-olive-700 focus:ring-2 focus:ring-olive-700/20 outline-none transition-all"
                    disabled={loading}
                    autoFocus
                  />
                </div>
                <p className="text-xs text-stone-500 mt-1">Enter your 10-digit mobile number</p>
              </div>

              <button
                type="submit"
                disabled={loading || phone.length !== 10}
                className="w-full btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span>Sending OTP...</span>
                ) : (
                  <>
                    <span>Send OTP</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="text-center pb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-olive-100 mb-4">
                  <CheckCircle className="text-olive-700" size={32} />
                </div>
                <p className="text-stone-600">
                  We sent a 6-digit code to{' '}
                  <span className="font-medium text-stone-900">+91 {phone}</span>
                </p>
                {sentOtp && (
                  <p className="text-xs text-olive-700 mt-2 bg-olive-50 py-2 px-4 rounded-lg inline-block">
                    Demo OTP: <span className="font-mono font-bold">{sentOtp}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2 text-center">
                  Enter Verification Code
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full text-center text-2xl tracking-[0.5em] font-mono py-4 rounded-lg border-2 border-stone-300 focus:border-olive-700 focus:ring-2 focus:ring-olive-700/20 outline-none transition-all"
                  disabled={loading}
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span>Verifying...</span>
                ) : (
                  <>
                    <span>Verify & Login</span>
                    <CheckCircle size={18} />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => { setStep(1); setOtp('') }}
                className="w-full text-stone-600 hover:text-stone-900 text-sm"
                disabled={loading}
              >
                ← Change number
              </button>
            </form>
          )}

          {step === 1 && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-stone-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-stone-500">
                    Don't have an account?
                  </span>
                </div>
              </div>

              <Link
                to="/signup"
                state={{ from: location.state?.from }}
                className="block w-full text-center py-3 rounded-lg border-2 border-olive-700 text-olive-700 font-medium hover:bg-olive-50 transition-colors"
              >
                Create Account
              </Link>
            </>
          )}
        </div>

        <div className="text-center mt-6">
          <Link to="/" className="text-stone-600 hover:text-stone-900 text-sm">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
