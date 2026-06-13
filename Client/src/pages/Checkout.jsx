import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ChevronRight, MapPin, CreditCard, CheckCircle2,
  Lock, ArrowLeft, RefreshCw, Phone, Trash2, Plus, Loader2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

const API_BASE_URL = (() => {
  const configured = import.meta.env.VITE_API_BASE_URL
  if (configured) return configured
  const protocol = window.location.protocol || 'http:'
  const hostname = window.location.hostname || 'localhost'
  return `${protocol}//${hostname}:7999/api/v1`
})()

const PAYMENT_BUTTON_ID = import.meta.env.VITE_RAZORPAY_PAYMENT_BUTTON_ID
const ADDR_KEY = 'zuno_delivery_address'
const steps = ['Delivery', 'Payment']

// Parse comma-separated pin codes from admin config
function parsePins(str) {
  return (str || '').split(',').map(p => p.trim()).filter(Boolean)
}

// Returns null (ok) or an error message string
function checkDeliveryAvailability(pin, isPremium, config) {
  const attrs = config?.attributes || {}
  const setting = isPremium ? attrs.delivery_premium : attrs.delivery_normal

  // No admin config yet → allow delivery
  if (!setting) return null

  const noDeliveryMsg = `Delivery is not available at pin code ${pin}. Please change the pin code.`

  // Toggle OFF → delivery disabled for everyone
  if (!setting.enabled) return noDeliveryMsg

  // Toggle ON → delivery enabled; restrict to listed pins if any are configured
  const pins = parsePins(setting.pins)
  if (pins.length > 0 && !pins.includes(pin)) return noDeliveryMsg

  return null
}

const emptyForm = {
  name: '', phone: '', label: '',
  addr1: '', addr2: '',
  city: '', pin: '', state: '',
}

// ── Razorpay Payment Button connector ───────────────────────────────────────
// Embeds the Razorpay dashboard-generated payment button script inside a form.
// The form's onSubmit fires when Razorpay reports payment success, carrying
// razorpay_payment_id / razorpay_order_id / razorpay_signature as hidden fields.
function RazorpayPaymentButton({ buttonId, prefill, onSuccess }) {
  const formRef = useRef(null)

  useEffect(() => {
    const form = formRef.current
    if (!form || !buttonId) return
    form.innerHTML = '' // clear any previously injected script

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/payment-button.js'
    script.setAttribute('data-payment_button_id', buttonId)
    if (prefill?.name)    script.setAttribute('data-prefill.name',    prefill.name)
    if (prefill?.email)   script.setAttribute('data-prefill.email',   prefill.email)
    if (prefill?.contact) script.setAttribute('data-prefill.contact', prefill.contact)
    script.async = true
    form.appendChild(script)

    return () => { if (formRef.current) formRef.current.innerHTML = '' }
  }, [buttonId])

  const handleSubmit = (e) => {
    e.preventDefault()
    const fd = new FormData(e.target)
    onSuccess?.({
      razorpay_payment_id: fd.get('razorpay_payment_id') ?? '',
      razorpay_order_id:   fd.get('razorpay_order_id')   ?? '',
      razorpay_signature:  fd.get('razorpay_signature')  ?? '',
    })
  }

  if (!buttonId) {
    return (
      <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 text-sm text-amber-800">
        <p className="font-semibold mb-1">Payment button not configured</p>
        <p>Set <code className="font-mono bg-amber-100 px-1 rounded">VITE_RAZORPAY_PAYMENT_BUTTON_ID</code> in your <code className="font-mono bg-amber-100 px-1 rounded">.env</code> file to the button ID from your Razorpay Dashboard.</p>
      </div>
    )
  }

  return <form ref={formRef} onSubmit={handleSubmit} />
}
// ────────────────────────────────────────────────────────────────────────────

export default function Checkout() {
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [deliveryData, setDeliveryData] = useState(null)

  const [form, setForm] = useState(emptyForm)
  const [pinError, setPinError] = useState('')
  const [pinLoading, setPinLoading] = useState(false)
  const [savedAddresses, setSavedAddresses] = useState([])
  const [selectedAddrId, setSelectedAddrId] = useState(null)
  const [showNewForm, setShowNewForm] = useState(true)

  // Pending DB order created before the payment button is shown
  const [pendingOrder, setPendingOrder] = useState(null)
  const [creatingOrder, setCreatingOrder] = useState(false)
  const [siteConfig, setSiteConfig] = useState(null)

  const { items, subtotal, delivery, total, isFreeDelivery, amountForFreeDelivery, clearCart } = useCart()
  const { user, isPremium } = useAuth()
  const navigate = useNavigate()

  // ── Address helpers ──────────────────────────────────────────────────────

  const fetchSavedAddresses = async (phone) => {
    if (phone.length !== 10) return
    try {
      const res = await fetch(`${API_BASE_URL}/addresses?phone=91${phone}`)
      if (!res.ok) return
      const data = await res.json()
      const list = data.data || []
      setSavedAddresses(list)
      if (list.length > 0) {
        setShowNewForm(false)
        setSelectedAddrId(list[0].id)
        applyAddress(list[0])
      }
    } catch {}
  }

  const applyAddress = (addr) => {
    setForm(prev => ({
      ...prev,
      name:  addr.name || `${addr.fname || ''} ${addr.lname || ''}`.trim(),
      label: addr.label || '',
      addr1: addr.addr1 || '', addr2: addr.addr2 || '',
      city:  addr.city  || '', pin:  addr.pin   || '',
      state: addr.state || '',
    }))
  }

  const deleteAddress = async (id) => {
    try {
      await fetch(`${API_BASE_URL}/addresses/${id}`, { method: 'DELETE' })
      const updated = savedAddresses.filter(a => a.id !== id)
      setSavedAddresses(updated)
      if (selectedAddrId === id) {
        if (updated.length > 0) { setSelectedAddrId(updated[0].id); applyAddress(updated[0]) }
        else { setSelectedAddrId(null); setShowNewForm(true); setForm(prev => ({ ...emptyForm, phone: prev.phone })) }
      }
    } catch {}
  }

  // Auto-lookup city & state from pin code via India Post API
  const lookupPin = async (pin) => {
    if (pin.length !== 6) return
    setPinLoading(true)
    setPinError('')
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`)
      const data = await res.json()
      if (data[0]?.Status === 'Success') {
        const post = data[0].PostOffice?.[0]
        if (post) {
          setForm(prev => ({ ...prev, city: post.District, state: post.State }))
        }
      } else {
        setPinError('Pin code not found')
      }
    } catch {
      setPinError('Could not look up pin code')
    } finally {
      setPinLoading(false)
    }
  }

  useEffect(() => {
    fetch(`${API_BASE_URL}/site-config`).then(r => r.json()).then(setSiteConfig).catch(() => {})
  }, [])

  useEffect(() => {
    // Pre-fill name & phone from logged-in user
    if (user) {
      const rawPhone = user.phone?.replace(/^\+91/, '').replace(/^91/, '') || ''
      setForm(prev => ({
        ...prev,
        name:  user.name?.trim() || prev.name,
        phone: rawPhone || prev.phone,
      }))
      if (rawPhone.length === 10) fetchSavedAddresses(rawPhone)
    }
    // Restore last-used address (address fields only, not name/phone)
    try {
      const saved = localStorage.getItem(ADDR_KEY)
      if (saved) {
        const { addr1, addr2, city, pin, state } = JSON.parse(saved)
        setForm(prev => ({ ...prev, addr1: addr1 || '', addr2: addr2 || '', city: city || '', pin: pin || '', state: state || '' }))
      }
    } catch {}
  }, [user])

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }))

  // ── Step navigation ──────────────────────────────────────────────────────

  const handleDeliveryContinue = async () => {
    const required = ['name', 'phone', 'addr1', 'city', 'state', 'pin']
    for (const field of required) {
      if (!form[field]?.trim()) { toast.error('Please fill all required fields'); return }
    }
    if (form.phone.length !== 10) { toast.error('Phone number must be exactly 10 digits'); return }
    if (form.pin.length !== 6) { toast.error('Please enter a valid 6-digit pin code'); return }

    const deliveryErr = checkDeliveryAvailability(form.pin.trim(), isPremium, siteConfig)
    if (deliveryErr) { toast.error(deliveryErr, { duration: 5000, icon: '🚫' }); return }

    localStorage.setItem(ADDR_KEY, JSON.stringify({ addr1: form.addr1, addr2: form.addr2, city: form.city, pin: form.pin, state: form.state }))
    fetch(`${API_BASE_URL}/addresses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: '91' + form.phone,
        name: form.name.trim(),
        label: form.label || null,
        addr1: form.addr1.trim(), addr2: form.addr2.trim() || null,
        city: form.city.trim(), state: form.state.trim(), pin: form.pin.trim(),
      }),
    }).catch(() => {})

    const delivery_data = {
      customer_name: form.name.trim(),
      customer_identifier: '+91' + form.phone,
      customer_email: null,
      customer_phone: '+91' + form.phone,
      shipping_address: [form.addr1.trim(), form.addr2.trim(), form.city.trim(), form.state.trim(), form.pin.trim()].filter(Boolean).join(', '),
    }
    setDeliveryData(delivery_data)

    // Create the DB order immediately so the Razorpay button is ready on the next step
    setCreatingOrder(true)
    try {
      const res = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: delivery_data.customer_name,
          customer_identifier: delivery_data.customer_identifier,
          customer_email: null,
          customer_phone: delivery_data.customer_phone,
          shipping_address: delivery_data.shipping_address,
          items: items.map(i => ({ product_id: i.id, quantity: i.quantity, price: i.price, name: i.name })),
          subtotal,
          delivery_charge: delivery,
          total,
          order_type: 'B2C',
          status: 'pending',
          payment_method: 'razorpay',
          payment_status: 'unpaid',
          account_id: user?.id || null,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || 'Could not prepare your order')
      }
      const order = await res.json()
      setPendingOrder(order)
      setStep(1)
    } catch (err) {
      toast.error(err.message || 'Something went wrong. Please try again.')
    } finally {
      setCreatingOrder(false)
    }
  }

  // Called by RazorpayPaymentButton when Razorpay reports payment success
  const handlePaymentSuccess = async ({ razorpay_payment_id, razorpay_order_id, razorpay_signature }) => {
    setLoading(true)
    try {
      // Best-effort server-side signature verification
      if (razorpay_order_id && razorpay_signature) {
        await fetch(`${API_BASE_URL}/payments/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            order_id: pendingOrder.id,
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
          }),
        }).catch(() => {})
      }
      clearCart()
      toast.success('Payment successful!')
      navigate(`/order-confirmation?order_id=${pendingOrder.id}`)
    } catch {
      clearCart()
      navigate(`/order-confirmation?order_id=${pendingOrder.id}`)
    } finally {
      setLoading(false)
    }
  }

  // ────────────────────────────────────────────────────────────────────────

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-24 bg-[#F9F8F6] flex flex-col items-center justify-center gap-4">
        <h2 className="font-display text-2xl text-stone-900">Nothing to checkout</h2>
        <Link to="/menu" className="btn-primary">Browse Shop</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F9F8F6] pt-20 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          <Link to="/cart" className="flex items-center gap-2 text-sm text-stone-400 hover:text-stone-800 mb-4 transition-colors">
            <ArrowLeft size={15} /> Back to cart
          </Link>
          <h1 className="font-display text-4xl font-bold text-stone-900">Checkout</h1>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-2 mb-10">
          {steps.map((s, i) => (
            <React.Fragment key={s}>
              <div
                className={`flex items-center gap-2 cursor-pointer ${i <= step ? '' : 'opacity-40'}`}
                onClick={() => i < step && setStep(i)}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                  ${i < step ? 'bg-green-500 text-white' : i === step ? 'bg-olive-700 text-white' : 'bg-stone-200 text-stone-500'}`}>
                  {i < step ? <CheckCircle2 size={14} /> : i + 1}
                </div>
                <span className={`text-sm font-medium ${i === step ? 'text-stone-900' : 'text-stone-400'}`}>{s}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-px mx-2 ${i < step ? 'bg-green-400' : 'bg-stone-200'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2">

            {/* ── Step 0 — Delivery ── */}
            {step === 0 && (
              <motion.div key="delivery" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="card p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center">
                    <MapPin size={18} className="text-stone-600" />
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-xl text-stone-900">Delivery Details</h2>
                    <p className="text-xs text-stone-400 mt-0.5">We deliver across India</p>
                  </div>
                </div>

                {/* ── Name + Phone (always shown) ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">Full Name <span className="text-rose-500">*</span></label>
                    <input value={form.name} onChange={set('name')} placeholder="Your full name" className="input-field" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">Phone <span className="text-rose-500">*</span></label>
                    <div className="flex gap-2">
                      <div className="flex items-center px-3 py-2.5 bg-stone-100 rounded-lg border border-stone-300 shrink-0">
                        <Phone size={16} className="text-stone-500 mr-1.5" />
                        <span className="font-medium text-stone-700 text-sm">+91</span>
                      </div>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 10)
                          setForm(prev => ({ ...prev, phone: val }))
                          if (val.length === 10) fetchSavedAddresses(val)
                        }}
                        placeholder="9876543210"
                        maxLength={10}
                        className="input-field flex-1"
                      />
                    </div>
                  </div>
                </div>

                {/* ── Saved Addresses ── */}
                {savedAddresses.length > 0 && (
                  <div className="mb-6">
                    <p className="text-sm font-semibold text-stone-700 mb-3">
                      Saved Addresses
                      <span className="ml-2 text-xs font-normal text-stone-400">Select to use</span>
                    </p>
                    <div className="space-y-2 mb-3">
                      {savedAddresses.map(addr => {
                        const addrName = addr.name || `${addr.fname || ''} ${addr.lname || ''}`.trim()
                        const isSelected = selectedAddrId === addr.id && !showNewForm
                        const deliveryErr = checkDeliveryAvailability(addr.pin, isPremium, siteConfig)
                        const isBlocked = !!deliveryErr
                        return (
                          <div key={addr.id}>
                            <div
                              onClick={() => {
                                if (isBlocked) return
                                setSelectedAddrId(addr.id); applyAddress(addr); setShowNewForm(false)
                              }}
                              className={`flex items-start gap-3 p-4 rounded-xl border-2 transition-all ${
                                isBlocked
                                  ? 'border-rose-200 bg-rose-50 cursor-not-allowed opacity-70'
                                  : isSelected
                                    ? 'border-olive-600 bg-olive-50 cursor-pointer'
                                    : 'border-stone-200 hover:border-stone-300 bg-white cursor-pointer'
                              }`}
                            >
                              <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                isBlocked ? 'border-rose-300' : isSelected ? 'border-olive-600' : 'border-stone-300'
                              }`}>
                                {isSelected && !isBlocked && <div className="w-2 h-2 rounded-full bg-olive-600" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <p className="text-sm font-semibold text-stone-900">{addrName}</p>
                                  {addr.label && (
                                    <span className="text-xs font-medium text-olive-700 bg-olive-50 border border-olive-200 px-2 py-0.5 rounded-full">
                                      {addr.label}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-stone-600">
                                  {addr.addr1}{addr.addr2 ? `, ${addr.addr2}` : ''}
                                </p>
                                <p className="text-xs text-stone-400">
                                  {addr.city}{addr.state ? `, ${addr.state}` : ''} – {addr.pin}
                                </p>
                              </div>
                              <button
                                onClick={(e) => { e.stopPropagation(); deleteAddress(addr.id) }}
                                className="p-1.5 text-stone-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                            {isBlocked && (
                              <p className="text-xs text-rose-500 mt-1 ml-1 flex items-center gap-1">
                                🚫 Delivery is not available at pin {addr.pin}. Please select another address.
                              </p>
                            )}
                          </div>
                        )
                      })}
                    </div>
                    <button
                      onClick={() => { setSelectedAddrId(null); setShowNewForm(v => !v) }}
                      className="flex items-center gap-2 text-sm font-medium text-olive-700 hover:text-olive-900 transition-colors"
                    >
                      <Plus size={15} />
                      {showNewForm ? 'Cancel new address' : '+ Add a new address'}
                    </button>
                  </div>
                )}

                {/* ── New Address Form ── */}
                {(showNewForm || savedAddresses.length === 0) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                    {/* Address label */}
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-stone-700 mb-2">Address Label <span className="text-stone-400 text-xs">(Optional)</span></label>
                      <div className="flex gap-2 flex-wrap">
                        {['Home', 'Work', 'Other'].map(lbl => (
                          <button
                            key={lbl}
                            type="button"
                            onClick={() => setForm(prev => ({ ...prev, label: prev.label === lbl ? '' : lbl }))}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                              form.label === lbl
                                ? 'bg-olive-700 border-olive-700 text-white'
                                : 'border-stone-300 text-stone-600 hover:border-stone-400'
                            }`}
                          >
                            {lbl}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Address Line 1 */}
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-stone-700 mb-1.5">Address Line 1 <span className="text-rose-500">*</span></label>
                      <input value={form.addr1} onChange={set('addr1')} placeholder="House no. / flat / street" className="input-field" />
                    </div>

                    {/* Address Line 2 */}
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-stone-700 mb-1.5">Address Line 2 <span className="text-stone-400 text-xs">(Optional)</span></label>
                      <input value={form.addr2} onChange={set('addr2')} placeholder="Locality / landmark" className="input-field" />
                    </div>

                    {/* Pin code */}
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1.5">Pin Code <span className="text-rose-500">*</span></label>
                      <div className="relative">
                        <input
                          value={form.pin}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '').slice(0, 6)
                            setForm(prev => ({ ...prev, pin: val }))
                            setPinError('')
                            if (val.length === 6) lookupPin(val)
                          }}
                          placeholder="600001"
                          maxLength={6}
                          className={`input-field pr-8 ${pinError ? 'border-rose-400' : ''}`}
                        />
                        {pinLoading && (
                          <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 animate-spin" />
                        )}
                      </div>
                      {pinError && <p className="text-xs text-rose-500 mt-1">{pinError}</p>}
                      {!pinError && form.city && <p className="text-xs text-emerald-600 mt-1">✓ {form.city}, {form.state}</p>}
                      {!pinError && form.pin.length === 6 && (() => {
                        const err = checkDeliveryAvailability(form.pin, isPremium, siteConfig)
                        return err ? <p className="text-xs text-rose-500 mt-1">🚫 {err}</p> : null
                      })()}
                    </div>

                    {/* City */}
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1.5">City <span className="text-rose-500">*</span></label>
                      <input value={form.city} onChange={set('city')} placeholder="Auto-filled from pin" className="input-field" />
                    </div>

                    {/* State */}
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-stone-700 mb-1.5">State <span className="text-rose-500">*</span></label>
                      <input value={form.state} onChange={set('state')} placeholder="Auto-filled from pin" className="input-field" />
                    </div>
                  </div>
                )}

                {(() => {
                  const pinBlocked = form.pin.length === 6 && !!checkDeliveryAvailability(form.pin, isPremium, siteConfig)
                  return (
                    <button
                      onClick={handleDeliveryContinue}
                      disabled={creatingOrder || pinBlocked}
                      className="btn-primary mt-6 flex items-center gap-2 ml-auto disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {creatingOrder
                        ? <><RefreshCw size={15} className="animate-spin" /> Preparing…</>
                        : <>Continue to Payment <ChevronRight size={16} /></>
                      }
                    </button>
                  )
                })()}
              </motion.div>
            )}

            {/* ── Step 1 — Payment ── */}
            {step === 1 && (
              <motion.div key="payment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="card p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center">
                    <CreditCard size={18} className="text-stone-600" />
                  </div>
                  <h2 className="font-display font-bold text-xl text-stone-900">Payment</h2>
                </div>

                {/* Amount summary */}
                <div className="p-4 rounded-2xl border border-stone-200 bg-stone-50 mb-6">
                  <div className="flex justify-between items-center text-sm text-stone-600 mb-1">
                    <span>Subtotal</span><span>₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-stone-600 mb-1">
                    <span>Delivery</span>
                    <span className={delivery === 0 ? 'text-green-600 font-semibold' : ''}>
                      {delivery === 0 ? 'FREE' : `₹${delivery}`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-base font-bold text-stone-900 border-t border-stone-200 pt-2 mt-2">
                    <span>Total to pay</span><span className="font-display text-lg">₹{total}</span>
                  </div>
                </div>

                {/* Amount reminder — user types this into Razorpay's custom-amount field */}
                <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 mb-5">
                  <div>
                    <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-0.5">Enter this amount in the payment window</p>
                    <p className="font-display text-3xl font-bold text-stone-900">₹{total}</p>
                    <p className="text-xs text-stone-400 mt-0.5">
                      Subtotal ₹{subtotal}{delivery > 0 ? ` + Delivery ₹${delivery}` : ' · Free delivery'}
                    </p>
                  </div>
                  <div className="text-4xl select-none">💳</div>
                </div>

                {/* Razorpay Payment Button */}
                <div className="mb-6">
                  <p className="text-xs text-stone-400 mb-3 text-center">
                    Supports UPI · Cards · Net Banking · Wallets
                  </p>
                  <div className="flex justify-center">
                    <RazorpayPaymentButton
                      buttonId={PAYMENT_BUTTON_ID}
                      prefill={{
                        name:    deliveryData?.customer_name,
                        email:   '',
                        contact: deliveryData?.customer_phone,
                      }}
                      onSuccess={handlePaymentSuccess}
                    />
                  </div>
                  {loading && (
                    <div className="flex items-center justify-center gap-2 mt-4 text-sm text-stone-500">
                      <RefreshCw size={14} className="animate-spin" /> Confirming payment…
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-center gap-2 text-xs text-stone-400 mb-6">
                  <Lock size={12} /> Secured by Razorpay · 256-bit SSL
                </div>

                <div className="flex justify-start">
                  <button
                    onClick={() => {
                      setPendingOrder(null)
                      setStep(0)
                    }}
                    className="btn-outline flex items-center gap-2"
                  >
                    <ArrowLeft size={15} /> Back
                  </button>
                </div>
              </motion.div>
            )}

          </div>

          {/* Sidebar */}
          <div className="card p-5 sticky top-24">
            <h3 className="font-display font-bold text-stone-900 text-lg mb-4">Your Order</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {items.map(item => (
                <div key={item.id} className="flex items-center gap-3">
                  <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-stone-800 truncate">{item.name}</p>
                    <p className="text-xs text-stone-400">×{item.quantity}</p>
                  </div>
                  <span className="text-xs font-bold text-stone-800">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-stone-100 mt-4 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-stone-400"><span>Subtotal</span><span>₹{subtotal}</span></div>
              <div className="flex justify-between text-stone-400">
                <span>Delivery Charges</span>
                <span className={delivery === 0 ? 'text-green-600 font-semibold' : ''}>
                  {delivery === 0 ? 'FREE' : `₹${delivery}`}
                </span>
              </div>
              {!isFreeDelivery && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 mt-2">
                  <p className="text-xs text-amber-800 font-medium">Add ₹{amountForFreeDelivery} more for FREE delivery!</p>
                </div>
              )}
              {isFreeDelivery && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-2.5 mt-2">
                  <p className="text-xs text-green-800 font-medium">You got FREE delivery!</p>
                </div>
              )}
              <div className="flex justify-between font-bold text-stone-900 text-base border-t border-stone-100 pt-2 mt-2">
                <span>Total</span><span className="font-display">₹{total}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
