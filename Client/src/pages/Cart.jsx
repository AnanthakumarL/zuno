import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingCart, Plus, Minus, Trash2, ArrowRight, ArrowLeft,
  Truck, Tag, Heart, ShoppingBag, Sparkles, PackageOpen, LogIn, X,
} from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useAuth } from '../context/AuthContext'
import { fetchRealtimeCatalog, fallbackImage } from '../services/realtimeCatalog'

function LoginRequiredModal({ onClose }) {
  const navigate = useNavigate()
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 24 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          onClick={e => e.stopPropagation()}
          className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
        >
          <div className="bg-gradient-to-br from-stone-800 to-stone-900 px-6 pt-8 pb-10 text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-4">
              <LogIn size={28} className="text-white" />
            </div>
            <h2 className="text-white font-display text-2xl font-bold mb-2">Login to continue</h2>
            <p className="text-stone-300 text-sm leading-relaxed">
              Please sign in to proceed to checkout and place your order.
            </p>
          </div>
          <div className="-mt-5 bg-white rounded-t-3xl px-6 pt-6 pb-7">
            <button
              onClick={() => { onClose(); navigate('/login', { state: { from: { pathname: '/checkout' } } }) }}
              className="flex items-center justify-center gap-2 w-full bg-stone-900 hover:bg-stone-700 text-white font-semibold py-3.5 rounded-xl transition-colors mb-3"
            >
              <LogIn size={16} /> Login to my account
            </button>
            <button
              onClick={() => { onClose(); navigate('/signup', { state: { from: { pathname: '/checkout' } } }) }}
              className="flex items-center justify-center gap-2 w-full border border-stone-300 text-stone-700 hover:bg-stone-50 font-medium py-3.5 rounded-xl transition-colors mb-4"
            >
              Create a free account
            </button>
            <button
              onClick={onClose}
              className="block w-full text-center text-sm text-stone-400 hover:text-stone-600 py-1 transition-colors"
            >
              Maybe later
            </button>
          </div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X size={16} className="text-white" />
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default function Cart() {
  const {
    items, removeItem, updateQty, subtotal, delivery, total,
    isFreeDelivery, amountForFreeDelivery, clearCart, addItem,
  } = useCart()
  const { items: wishlistItems, removeFromWishlist } = useWishlist()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [addons, setAddons] = useState([])
  const [showLoginModal, setShowLoginModal] = useState(false)

  useEffect(() => {
    fetchRealtimeCatalog().then(data => {
      setAddons(data.products.filter(p => p.category === 'add-ons'))
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (location.hash === '#wishlist') {
      setTimeout(() => {
        document.getElementById('wishlist-section')?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
  }, [location.hash])

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-24 bg-[#F9F8F6] flex flex-col items-center justify-center gap-6 px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="w-28 h-28 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-6">
            <PackageOpen size={44} className="text-stone-300" />
          </div>
          <h1 className="font-display text-3xl font-bold text-stone-900 mb-3">Your cart is empty</h1>
          <p className="text-stone-500 max-w-sm mx-auto mb-8">
            Looks like you haven't added anything yet. Explore the shop and find your favourites.
          </p>
          <Link to="/menu" className="btn-primary inline-flex items-center gap-2">
            Browse Shop <ArrowRight size={16} />
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F9F8F6] pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="font-display text-4xl font-bold text-stone-900">Your Cart</h1>
            <p className="text-stone-400 mt-1">{items.length} item{items.length !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={clearCart}
            className="text-sm text-rose-500 hover:text-rose-700 font-medium transition-colors"
          >
            Clear cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence initial={false}>
              {items.map(item => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, x: -30, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="card p-5 flex gap-5"
                >
                  <Link to={`/product/${item.id}`}>
                    <img src={item.image} alt={item.name}
                      className="w-24 h-24 rounded-2xl object-cover shrink-0" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-2 mb-1">
                      <Link
                        to={`/product/${item.id}`}
                        className="font-display font-bold text-stone-900 text-lg hover:text-stone-600 truncate"
                      >
                        {item.name}
                      </Link>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-stone-300 hover:text-rose-500 transition-colors shrink-0"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                    <p className="text-xs text-stone-400 mb-3">{item.weight} · {item.category}</p>

                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-full px-2 py-1">
                        <button
                          onClick={() => updateQty(item.id, Math.max(item.minOrderQty ?? 1, item.quantity - (item.orderMultiple ?? 1)))}
                          className="w-7 h-7 rounded-full hover:bg-stone-200 flex items-center justify-center transition-colors"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="font-bold text-stone-800 w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQty(item.id, item.quantity + (item.orderMultiple ?? 1))}
                          className="w-7 h-7 rounded-full hover:bg-stone-200 flex items-center justify-center transition-colors"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <div className="text-right">
                        <span className="font-display font-bold text-xl text-stone-800">
                          ₹{item.price * item.quantity}
                        </span>
                        {item.quantity > 1 && (
                          <p className="text-xs text-stone-400">₹{item.price} each</p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <Link
              to="/menu"
              className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-800 transition-colors mt-2"
            >
              <ArrowLeft size={15} /> Continue Shopping
            </Link>
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24 space-y-5">
              <h2 className="font-display font-bold text-stone-900 text-xl">Order Summary</h2>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Promo code"
                    className="input-field pl-9 py-2.5 text-sm"
                  />
                </div>
                <button className="btn-outline py-2 px-4 text-sm whitespace-nowrap">Apply</button>
              </div>

              <div className="space-y-3 text-sm pt-2">
                <div className="flex justify-between text-stone-500">
                  <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-stone-500">
                  <span className="flex items-center gap-1.5">
                    <Truck size={13} /> Delivery Charges
                  </span>
                  <span className={delivery === 0 ? 'text-green-600 font-semibold' : ''}>
                    {delivery === 0 ? 'FREE' : `₹${delivery}`}
                  </span>
                </div>
                {!isFreeDelivery && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-2">
                    <p className="text-xs text-amber-800 font-medium">
                      🎁 Add ₹{amountForFreeDelivery} more for FREE delivery!
                    </p>
                  </div>
                )}
                {isFreeDelivery && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-2">
                    <p className="text-xs text-green-800 font-medium">
                      🎉 Yay! You got FREE delivery!
                    </p>
                  </div>
                )}
              </div>

              <div className="border-t border-stone-100 pt-4 flex justify-between font-bold text-stone-900">
                <span className="text-lg">Total</span>
                <span className="font-display text-2xl">₹{total}</span>
              </div>

              <button
                onClick={() => isAuthenticated ? navigate('/checkout') : setShowLoginModal(true)}
                className="btn-primary flex items-center justify-center gap-2 w-full"
              >
                Proceed to Checkout <ArrowRight size={16} />
              </button>
              {showLoginModal && <LoginRequiredModal onClose={() => setShowLoginModal(false)} />}

              <p className="text-xs text-center text-stone-400">Secure checkout · SSL encrypted</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Add-ons Section ── */}
      {addons.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-4">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h2 className="font-display text-2xl font-bold text-stone-900">Add-ons</h2>
            <span className="text-sm text-stone-400">Complete your order</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {addons.map(addon => {
              const inCart = items.some(i => i.id === addon.id)
              return (
                <motion.div
                  key={addon.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card p-3 flex flex-col gap-2"
                >
                  <Link to={`/product/${addon.id}`}>
                    <img
                      src={addon.image}
                      alt={addon.name}
                      onError={e => { e.target.onerror = null; e.target.src = fallbackImage }}
                      className="w-full aspect-square rounded-xl object-cover"
                    />
                  </Link>
                  <div className="flex-1">
                    <Link to={`/product/${addon.id}`} className="font-display font-semibold text-stone-900 text-sm leading-tight hover:text-stone-600 line-clamp-2">
                      {addon.name}
                    </Link>
                    <p className="font-display font-bold text-stone-800 text-sm mt-1">₹{addon.price}</p>
                  </div>
                  <button
                    onClick={() => addItem(addon, addon.minOrderQty ?? 1)}
                    className={`w-full flex items-center justify-center gap-1.5 text-xs font-medium py-2 rounded-lg transition-colors ${
                      inCart
                        ? 'bg-olive-50 text-olive-700 border border-olive-200'
                        : 'bg-olive-700 hover:bg-olive-800 text-white'
                    }`}
                  >
                    <ShoppingCart size={12} />
                    {inCart ? 'Added' : 'Add to Cart'}
                  </button>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Wishlist Section ── */}
      {wishlistItems.length > 0 && (
        <div id="wishlist-section" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-6">
          <div className="flex items-center gap-3 mb-6">
            <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
            <h2 className="font-display text-2xl font-bold text-stone-900">Your Wishlist</h2>
            <span className="text-sm text-stone-400">{wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <AnimatePresence initial={false}>
              {wishlistItems.map(item => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.25 }}
                  className="card p-4 flex flex-col gap-3"
                >
                  <Link to={`/product/${item.id}`}>
                    <img
                      src={item.image}
                      alt={item.name}
                      onError={e => { e.target.onerror = null; e.target.src = fallbackImage }}
                      className="w-full aspect-square rounded-xl object-cover"
                    />
                  </Link>
                  <div className="flex-1">
                    <Link to={`/product/${item.id}`} className="font-display font-semibold text-stone-900 text-sm leading-tight hover:text-stone-600 line-clamp-1">
                      {item.name}
                    </Link>
                    <p className="text-xs text-stone-400 mt-0.5">{item.weight} · {item.category}</p>
                    <p className="font-display font-bold text-stone-800 mt-1">₹{item.price}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { addItem(item, item.minOrderQty ?? 1); removeFromWishlist(item.id) }}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-olive-700 hover:bg-olive-800 text-white text-xs font-medium py-2 rounded-lg transition-colors"
                    >
                      <ShoppingBag size={13} /> Move to Cart
                    </button>
                    <button
                      onClick={() => removeFromWishlist(item.id)}
                      className="p-2 text-stone-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  )
}
