import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Mail, Phone, User, Lock, ArrowRight, ShoppingBag, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1'

export default function Signup() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [step, setStep] = useState(1) // 1: form, 2: OTP verification
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [otp, setOtp] = useState('')
  const [sentOtp, setSentOtp] = useState('')
  const [loading, setLoading] = useState(false)

  const from = location.state?.from?.pathname || '/'

  const handleRequestOtp = async (e) => {
    e.preventDefault()

    // Validation
    if (!formData.name) {
      toast.error('Please enter your name')
      return
    }

    if (!formData.phone) {
      toast.error('Please enter your phone number')
      return
    }

    if (formData.phone.length !== 10) {
      toast.error('Phone number must be exactly 10 digits')
      return
    }

    if (!/^[0-9]{10}$/.test(formData.phone)) {
      toast.error('Phone number must contain only digits')
      return
    }

    if (!formData.password || formData.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/auth/signup/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email || null,
          phone: '+91' + formData.phone,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send OTP')
      }

      setSentOtp(data.otp || '')
      if (data.otp) {
        // WhatsApp not connected on the server — demo fallback shows the code.
        toast.success(`OTP sent! (Demo: ${data.otp})`)
      } else {
        toast.success(`OTP sent to your WhatsApp +91${formData.phone}`)
      }
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
      const response = await fetch(`${API_BASE}/auth/signup/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email || null,
          phone: '+91' + formData.phone,
          otp: otp,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'OTP verification failed')
      }

      // Check if account was newly created or already existed
      const isNewAccount = data.created === true
      
      // Update account with password
      const accountWithPassword = {
        ...data.account,
        attributes: {
          ...data.account.attributes,
          password: formData.password,
        },
      }

      login(accountWithPassword)
      
      // Show appropriate message based on account status
      if (isNewAccount) {
        toast.success('Account created successfully! 🎉')
      } else {
        toast.success('Welcome back! Logged in successfully')
      }
      
      navigate(from, { replace: true })
    } catch (error) {
      toast.error(error.message || 'Verification failed')
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
            Get Started
          </h1>
          <p className="text-stone-600">
            Create a new account or login if you already have one
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-stone-200 p-8">
          {step === 1 ? (
            <form onSubmit={handleRequestOtp} className="space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                    className="w-full pl-11 pr-4 py-3 rounded-lg border border-stone-300 focus:border-olive-700 focus:ring-2 focus:ring-olive-700/20 outline-none transition-all"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Phone Number (India Only) */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <div className="flex items-center px-4 py-3 bg-stone-100 rounded-lg border border-stone-300">
                    <Phone size={20} className="text-stone-500 mr-2" />
                    <span className="font-medium text-stone-700">+91</span>
                  </div>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 10)
                      setFormData({ ...formData, phone: value })
                    }}
                    placeholder="9876543210"
                    maxLength={10}
                    className="flex-1 px-4 py-3 rounded-lg border border-stone-300 focus:border-olive-700 focus:ring-2 focus:ring-olive-700/20 outline-none transition-all"
                    disabled={loading}
                  />
                </div>
                <p className="text-xs text-stone-500 mt-1">Enter 10-digit Indian mobile number</p>
              </div>

              {/* Email (Optional) */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Email <span className="text-stone-400 text-xs">(Optional)</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your@email.com"
                    className="w-full pl-11 pr-4 py-3 rounded-lg border border-stone-300 focus:border-olive-700 focus:ring-2 focus:ring-olive-700/20 outline-none transition-all"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="At least 6 characters"
                    className="w-full pl-11 pr-4 py-3 rounded-lg border border-stone-300 focus:border-olive-700 focus:ring-2 focus:ring-olive-700/20 outline-none transition-all"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Re-enter password"
                    className="w-full pl-11 pr-4 py-3 rounded-lg border border-stone-300 focus:border-olive-700 focus:ring-2 focus:ring-olive-700/20 outline-none transition-all"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span>Sending OTP...</span>
                ) : (
                  <>
                    <span>Continue</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              {/* OTP Info */}
              <div className="text-center pb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-olive-100 mb-4">
                  <CheckCircle className="text-olive-700" size={32} />
                </div>
                <p className="text-stone-600">
                  We sent a 6-digit code {sentOtp ? '' : 'on WhatsApp '}to{' '}
                  <span className="font-medium text-stone-900">
                    +91 {formData.phone}
                  </span>
                </p>
                {sentOtp && (
                  <p className="text-xs text-olive-700 mt-2 bg-olive-50 py-2 px-4 rounded-lg inline-block">
                    Demo OTP: <span className="font-mono font-bold">{sentOtp}</span>
                  </p>
                )}
              </div>

              {/* OTP Input */}
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

              {/* Verify Button */}
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span>Verifying...</span>
                ) : (
                  <>
                    <span>Verify & Continue</span>
                    <CheckCircle size={18} />
                  </>
                )}
              </button>

              {/* Back Button */}
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-stone-600 hover:text-stone-900 text-sm"
                disabled={loading}
              >
                ← Change details
              </button>
            </form>
          )}

          {/* Divider */}
          {step === 1 && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-stone-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-stone-500">
                    Already have an account?
                  </span>
                </div>
              </div>

              {/* Login Link */}
              <Link
                to="/login"
                state={{ from: location.state?.from }}
                className="block w-full text-center py-3 rounded-lg border-2 border-olive-700 text-olive-700 font-medium hover:bg-olive-50 transition-colors"
              >
                Login
              </Link>
            </>
          )}
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link to="/" className="text-stone-600 hover:text-stone-900 text-sm">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
