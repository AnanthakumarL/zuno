import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Package, ChevronDown, ChevronUp, Calendar, Clock,
  MapPin, ShoppingBag, ArrowRight, RefreshCw, Search, Phone,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { fallbackImage } from '../services/realtimeCatalog'

const API_BASE_URL = (() => {
  const configured = import.meta.env.VITE_API_BASE_URL
  if (configured) return configured
  const protocol = window.location.protocol || 'http:'
  const hostname = window.location.hostname || 'localhost'
  return `${protocol}//${hostname}:7999/api/v1`
})()

const STATUS_STYLES = {
  pending:    { label: 'Pending',     cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  assigned:   { label: 'Assigned',    cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  processing: { label: 'Preparing',   cls: 'bg-violet-50 text-violet-700 border-violet-200' },
  shipped:    { label: 'Out for Delivery', cls: 'bg-sky-50 text-sky-700 border-sky-200' },
  delivered:  { label: 'Delivered',   cls: 'bg-green-50 text-green-700 border-green-200' },
  cancelled:  { label: 'Cancelled',   cls: 'bg-red-50 text-red-700 border-red-200' },
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (isNaN(d)) return dateStr
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function OrderCard({ order }) {
  const [expanded, setExpanded] = useState(false)
  const status = STATUS_STYLES[order.status] || STATUS_STYLES.pending
  const items = Array.isArray(order.items) ? order.items : []

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="card overflow-hidden"
    >
      {/* Header row */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center gap-4 p-5 text-left hover:bg-stone-50 transition-colors"
      >
        <div className="w-10 h-10 rounded-xl bg-olive-50 flex items-center justify-center shrink-0">
          <Package size={18} className="text-olive-700" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-display font-bold text-stone-900 text-sm">
              #{order.order_number || order.id?.slice(-8).toUpperCase()}
            </span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${status.cls}`}>
              {status.label}
            </span>
          </div>
          <p className="text-xs text-stone-400 mt-0.5">
            {formatDate(order.created_at)} · {items.length} item{items.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="text-right shrink-0">
          <p className="font-display font-bold text-stone-900">₹{Number(order.total).toLocaleString('en-IN')}</p>
          {expanded
            ? <ChevronUp size={14} className="text-stone-400 ml-auto mt-1" />
            : <ChevronDown size={14} className="text-stone-400 ml-auto mt-1" />}
        </div>
      </button>

      {/* Expanded details */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="details"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-stone-100 pt-4 space-y-4">

              {/* Items list */}
              <div className="space-y-2">
                {items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <img
                      src={item.image || fallbackImage}
                      alt={item.name}
                      onError={e => { e.target.onerror = null; e.target.src = fallbackImage }}
                      className="w-10 h-10 rounded-lg object-cover shrink-0 bg-stone-100"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-stone-800 truncate">{item.name || `Item ${i + 1}`}</p>
                      <p className="text-xs text-stone-400">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-sm font-semibold text-stone-700 shrink-0">
                      ₹{Number(item.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Delivery schedule */}
              {(order.delivery_date || order.delivery_time) && (
                <div className="flex items-center gap-4 bg-olive-50 rounded-xl px-4 py-3">
                  {order.delivery_date && (
                    <span className="flex items-center gap-1.5 text-xs font-medium text-olive-800">
                      <Calendar size={13} className="text-olive-600" />
                      {formatDate(order.delivery_date)}
                    </span>
                  )}
                  {order.delivery_time && (
                    <span className="flex items-center gap-1.5 text-xs font-medium text-olive-800">
                      <Clock size={13} className="text-olive-600" />
                      {order.delivery_time}
                    </span>
                  )}
                </div>
              )}

              {/* Shipping address */}
              {order.shipping_address && (
                <div className="flex items-start gap-2 text-xs text-stone-500">
                  <MapPin size={13} className="text-stone-400 mt-0.5 shrink-0" />
                  <span>{order.shipping_address}</span>
                </div>
              )}

              {/* Totals */}
              <div className="border-t border-stone-100 pt-3 space-y-1 text-sm">
                <div className="flex justify-between text-stone-500">
                  <span>Subtotal</span><span>₹{Number(order.subtotal).toLocaleString('en-IN')}</span>
                </div>
                {Number(order.delivery_charge) > 0 && (
                  <div className="flex justify-between text-stone-500">
                    <span>Delivery</span><span>₹{Number(order.delivery_charge).toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-stone-900 pt-1 border-t border-stone-100">
                  <span>Total</span><span>₹{Number(order.total).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function Orders() {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [searching, setSearching] = useState(false)

  const fetchOrders = async (overrideParam) => {
    if (!user) { setLoading(false); return }

    // Primary: query by account_id (reliable link set at checkout time)
    // Fallback: query by phone if no account_id orders found
    const params = overrideParam
      ? [overrideParam]
      : [
          `account_id=${encodeURIComponent(user.id)}`,
          // phone fallback
          user.phone
            ? `customer_phone=${encodeURIComponent(user.phone.startsWith('+') ? user.phone : '+91' + user.phone)}`
            : null,
          user.email ? `customer_email=${encodeURIComponent(user.email)}` : null,
        ].filter(Boolean)

    try {
      let found = []
      for (const param of params) {
        const r = await fetch(`${API_BASE_URL}/orders?${param}&page_size=100`)
        if (!r.ok) continue
        const data = await r.json()
        if ((data.data || []).length > 0) { found = data.data; break }
      }
      setOrders(found)
      setError('')
    } catch {
      setError('Failed to load orders. Please try again.')
    } finally {
      setLoading(false)
      setSearching(false)
    }
  }

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return }
    fetchOrders()
  }, [isAuthenticated, user])

  const handleSearch = (e) => {
    e.preventDefault()
    const val = searchInput.trim()
    if (!val) return
    setSearching(true)
    setLoading(true)
    // detect phone vs email
    const isPhone = /^\d{10}$/.test(val)
    const param = isPhone
      ? `customer_phone=${encodeURIComponent('+91' + val)}`
      : `customer_email=${encodeURIComponent(val)}`
    fetchOrders(param)
  }

  return (
    <div className="min-h-screen bg-[#F9F8F6] pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="mb-6">
          <h1 className="font-display text-4xl font-bold text-stone-900">My Orders</h1>
          <p className="text-stone-400 mt-1">
            {loading ? 'Loading…' : `${orders.length} order${orders.length !== 1 ? 's' : ''} placed`}
          </p>
        </div>

        {/* Search by phone / email */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-8">
          <div className="relative flex-1">
            <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Search by phone (10 digits) or email used at checkout"
              className="input-field pl-10 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={searching}
            className="btn-primary flex items-center gap-2 px-5 shrink-0 disabled:opacity-60"
          >
            {searching ? <RefreshCw size={14} className="animate-spin" /> : <Search size={14} />}
            Search
          </button>
        </form>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-24">
            <RefreshCw size={28} className="animate-spin text-stone-300" />
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="card p-6 text-center text-rose-600 text-sm">{error}</div>
        )}

        {/* Empty */}
        {!loading && !error && orders.length === 0 && (
          <div className="card p-10 text-center">
            <ShoppingBag size={40} className="text-stone-200 mx-auto mb-4" />
            <p className="font-display text-xl font-bold text-stone-900 mb-2">No orders yet</p>
            <p className="text-stone-500 text-sm mb-6">Time to treat yourself to something new!</p>
            <Link to="/menu" className="btn-primary inline-flex items-center gap-2">
              Browse Shop <ArrowRight size={15} />
            </Link>
          </div>
        )}

        {/* Orders list */}
        {!loading && !error && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map(order => <OrderCard key={order.id} order={order} />)}
          </div>
        )}
      </div>
    </div>
  )
}
