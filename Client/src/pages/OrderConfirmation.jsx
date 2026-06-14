import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle2, Package, Truck, MapPin, ArrowRight, Calendar, Clock, Home, ShoppingBag } from 'lucide-react'

const API_BASE_URL = (() => {
  const configured = import.meta.env.VITE_API_BASE_URL
  if (configured) return configured
  const protocol = window.location.protocol || 'http:'
  const hostname = window.location.hostname || 'localhost'
  return `${protocol}//${hostname}:7999/api/v1`
})()

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d)) return dateStr
  return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

export default function OrderConfirmation() {
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('order_id')
  const [order, setOrder] = useState(null)

  useEffect(() => {
    if (!orderId) return
    fetch(`${API_BASE_URL}/orders/${orderId}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setOrder(data) })
      .catch(() => {})
  }, [orderId])

  const displayId = order?.order_number || (orderId ? `AMD${orderId.slice(-8).toUpperCase()}` : 'AMD000000')
  const deliveryDate = order?.delivery_date ? formatDate(order.delivery_date) : null
  const deliveryTime = order?.delivery_time || null

  // Payment is confirmed once it's marked paid (or the order is delivered).
  // Until then we show the "pending — please wait 2–3 hours" panel.
  const paymentConfirmed = String(order?.payment_status || '').toLowerCase() === 'paid' || order?.status === 'delivered'
  const pending = !paymentConfirmed

  const trackerSteps = [
    { icon: CheckCircle2, label: 'Order Placed', time: 'Just now', done: true },
    {
      icon: Clock,
      label: paymentConfirmed ? 'Payment Confirmed' : 'Payment Confirmation',
      time: paymentConfirmed ? 'Done' : 'Usually within 2–3 hours',
      done: paymentConfirmed,
    },
    { icon: Package, label: 'Preparing', time: 'After payment is confirmed', done: false },
    {
      icon: Truck,
      label: 'Out for Delivery',
      time: deliveryDate ? `${deliveryDate}` : 'Date TBD',
      done: false,
    },
  ]

  return (
    <div className="min-h-screen bg-parchment pt-24 pb-16 px-4">
      <div className="max-w-lg mx-auto text-center">

        {/* Hero icon — celebratory check when confirmed, calm clock when pending */}
        <div className="relative flex justify-center mb-8">
          {paymentConfirmed && [...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, opacity: 1, x: 0, y: 0 }}
              animate={{
                scale: [0, 1, 0.8],
                opacity: [1, 1, 0],
                x: Math.cos((i / 8) * Math.PI * 2) * 80,
                y: Math.sin((i / 8) * Math.PI * 2) * 80,
              }}
              transition={{ duration: 0.8, delay: i * 0.05 }}
              className="absolute w-3 h-3 rounded-full"
              style={{ background: ['#718d3e', '#C5A028', '#e07b7b', '#6ab9c9', '#b57bce'][i % 5] }}
            />
          ))}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className={`w-24 h-24 rounded-full flex items-center justify-center ${
              paymentConfirmed ? 'bg-green-100' : 'bg-amber-100'
            }`}
          >
            {paymentConfirmed
              ? <CheckCircle2 size={48} className="text-green-500" />
              : <Clock size={46} className="text-amber-500" />}
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <p className="text-olive-600 text-sm font-semibold uppercase tracking-widest mb-2">Order Placed!</p>
          <h1 className="font-display text-4xl font-bold text-olive-900 mb-3">
            {paymentConfirmed ? "Woohoo! It's on its way 🎉" : 'Thank you! Your order is placed'}
          </h1>
          <p className="text-olive-600 leading-relaxed mb-2">
            {paymentConfirmed
              ? "Your order is being carefully packed. You'll receive an SMS update when it's out for delivery."
              : "We've received your order. Your payment is being confirmed — we'll start packing as soon as it's done."}
          </p>
          <p className="text-olive-400 text-sm mb-6">
            Order ID: <span className="font-bold text-olive-700">#{displayId}</span>
          </p>

          {/* Payment status */}
          {order && (
            <div className="mb-6">
              <span className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold border ${
                paymentConfirmed
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {paymentConfirmed ? <CheckCircle2 size={15} /> : <Clock size={15} />}
                {paymentConfirmed ? 'Payment Confirmed' : 'Payment Pending'}
              </span>
            </div>
          )}
        </motion.div>

        {/* Prominent pending panel */}
        {pending && (
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-8 text-left flex gap-3"
          >
            <Clock className="text-amber-500 shrink-0 mt-0.5" size={20} />
            <div>
              <p className="font-semibold text-amber-800 mb-1">Payment pending — please wait</p>
              <p className="text-sm text-amber-700 leading-relaxed">
                It usually takes about <span className="font-semibold">2–3 hours</span> to confirm your payment.
                Your order will be confirmed soon and you'll be notified — there's no need to pay again. You can
                track it anytime under <span className="font-semibold">My Orders</span>.
              </p>
            </div>
          </motion.div>
        )}

        {/* Delivery schedule highlight */}
        {(deliveryDate || deliveryTime) && (
          <div className="inline-flex items-center gap-4 bg-olive-50 border border-olive-200 rounded-2xl px-5 py-3 mb-8">
            {deliveryDate && (
              <span className="flex items-center gap-1.5 text-sm font-medium text-olive-800">
                <Calendar size={15} className="text-olive-600" />
                {deliveryDate}
              </span>
            )}
            {deliveryTime && (
              <span className="flex items-center gap-1.5 text-sm font-medium text-olive-800">
                <Clock size={15} className="text-olive-600" />
                {deliveryTime}
              </span>
            )}
          </div>
        )}

        {/* Tracker */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="card p-6 mb-8 text-left"
        >
          <h2 className="font-display font-bold text-olive-900 text-lg mb-5">Order Tracker</h2>
          <div className="space-y-5">
            {trackerSteps.map((s, i) => (
              <div key={s.label} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                    s.done ? 'bg-green-100 text-green-600'
                      : i === 1 && pending ? 'bg-amber-100 text-amber-600'
                      : 'bg-olive-100 text-olive-400'
                  }`}>
                    <s.icon size={17} />
                  </div>
                  {i < trackerSteps.length - 1 && (
                    <div className={`w-px flex-1 mt-1 ${s.done ? 'bg-green-300' : 'bg-olive-200'}`}
                      style={{ minHeight: '20px' }} />
                  )}
                </div>
                <div className="pb-4">
                  <p className={`font-semibold text-sm ${
                    s.done ? 'text-green-700' : i === 1 && pending ? 'text-amber-700' : 'text-olive-500'
                  }`}>
                    {s.label}
                  </p>
                  <p className="text-xs text-olive-400">{s.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Two actions: Home + Continue Shopping */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Link to="/" className="btn-outline flex items-center gap-2 justify-center">
            <Home size={16} /> Home
          </Link>
          <Link to="/menu" className="btn-primary flex items-center gap-2 justify-center">
            <ShoppingBag size={16} /> Continue Shopping <ArrowRight size={15} />
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
