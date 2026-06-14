import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Star, ShoppingCart, Heart, ChevronRight,
  Plus, Minus, Share2, CheckCircle2, Leaf, Crown, X, LogIn, Zap, Check,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { fetchRealtimeCatalog, fallbackImage } from '../services/realtimeCatalog'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useAuth } from '../context/AuthContext'
import ProductCard from '../components/ProductCard'

const PREMIUM_MONTHLY_LINK = 'https://rzp.io/rzp/eqFM3TZV'

// ── Upgrade to Premium popup ───────────────────────────────────────────────
function UpgradeToPremiumModal({ onClose, productName, premiumPrice }) {
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
          {/* Header */}
          <div className="bg-gradient-to-br from-amber-400 to-amber-600 px-6 pt-8 pb-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-4">
              <Crown size={28} className="text-white" />
            </div>
            <h2 className="text-white font-display text-2xl font-bold mb-1">Unlock Premium Price</h2>
            <p className="text-amber-100 text-sm leading-relaxed">
              Get <span className="text-white font-semibold">{productName}</span> for just{' '}
              <span className="text-white font-bold text-lg">₹{premiumPrice}</span> with Premium
            </p>
          </div>

          {/* Body */}
          <div className="-mt-6 bg-white rounded-t-3xl px-6 pt-6 pb-7">
            <p className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-3">Premium includes</p>
            <ul className="space-y-2 mb-6">
              {[
                'Members-only deal prices on products',
                'Free delivery on every order',
                '24h early access to every sale',
                '15-day easy returns',
                'Priority customer support',
              ].map(b => (
                <li key={b} className="flex items-center gap-2 text-sm text-stone-700">
                  <Check size={14} className="text-emerald-500 shrink-0" />
                  {b}
                </li>
              ))}
            </ul>

            <button
              onClick={() => { window.location.href = PREMIUM_MONTHLY_LINK }}
              className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3.5 rounded-xl transition-colors"
            >
              <Crown size={16} /> Subscribe for ₹99 / month
            </button>
            <p className="text-center text-xs text-stone-400 mt-2 mb-4">
              Secure payment via Razorpay · Cancel anytime
            </p>

            <button
              onClick={onClose}
              className="block w-full text-center text-sm text-stone-400 hover:text-stone-600 transition-colors"
            >
              Maybe later
            </button>
          </div>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <X size={16} className="text-white" />
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ── Login required popup ───────────────────────────────────────────────────
function LoginRequiredModal({ onClose, productName }) {
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
              Sign in to continue with{' '}
              <span className="text-white font-medium">{productName}</span>
            </p>
          </div>
          <div className="-mt-5 bg-white rounded-t-3xl px-6 pt-6 pb-7">
            <Link
              to="/login"
              onClick={onClose}
              className="flex items-center justify-center gap-2 w-full bg-stone-900 hover:bg-stone-700 text-white font-semibold py-3.5 rounded-xl transition-colors mb-3"
            >
              <LogIn size={16} /> Login to my account
            </Link>
            <Link
              to="/signup"
              onClick={onClose}
              className="flex items-center justify-center gap-2 w-full border border-stone-300 text-stone-700 hover:bg-stone-50 font-medium py-3.5 rounded-xl transition-colors mb-4"
            >
              Create a free account
            </Link>
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

// ── Main component ─────────────────────────────────────────────────────────
export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem, freeDeliveryThreshold } = useCart()
  const { isWishlisted, toggleWishlist } = useWishlist()
  const { isAuthenticated, isPremium, user } = useAuth()

  const [products, setProducts]       = useState([])
  const [product, setProduct]         = useState(null)
  const [loading, setLoading]         = useState(true)
  const [qty, setQty]                 = useState(1)
  const [activeImg, setActiveImg]     = useState(0)
  const [activeTab, setActiveTab]     = useState('description')
  const [pricingMode, setPricingMode] = useState('regular') // 'regular' | 'premium'

  const [showLoginModal,   setShowLoginModal]   = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  // Reset pricing mode when navigating to a different product
  useEffect(() => { setPricingMode('regular') }, [id])

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const data = await fetchRealtimeCatalog()
        if (!mounted) return
        const all = data.products
        const selected = all.find(p => String(p.id) === String(id)) || null
        setProducts(all)
        setProduct(selected)
        if (selected) setQty(selected.minOrderQty ?? 1)
      } catch {
        if (!mounted) return
        setProducts([])
        setProduct(null)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [id])

  function handlePremiumRadioClick(e) {
    e.preventDefault()
    if (!isAuthenticated) { setShowLoginModal(true); return }
    if (!isPremium)        { setShowUpgradeModal(true); return }
    setPricingMode('premium')
  }

  function handleUpgraded() {
    setShowUpgradeModal(false)
  }

  const activePrice = pricingMode === 'premium' && product?.premiumPrice
    ? product.premiumPrice
    : product?.price

  function handleAddToCart() {
    addItem({ ...product, price: activePrice }, qty)
  }

  function handleBuyNow() {
    if (!isAuthenticated) { setShowLoginModal(true); return }
    addItem({ ...product, price: activePrice }, qty)
    navigate('/checkout')
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center bg-[#F9F8F6]">
        <h2 className="font-display text-2xl text-stone-900 mb-2">Loading product...</h2>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center bg-[#F9F8F6]">
        <span className="text-6xl mb-4">📦</span>
        <h2 className="font-display text-2xl text-stone-900 mb-2">Product not found</h2>
        <p className="text-stone-500 mb-6">This product is no longer available.</p>
        <Link to="/menu" className="btn-primary">Back to Shop</Link>
      </div>
    )
  }

  const related = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4)

  return (
    <div className="min-h-screen bg-[#F9F8F6] pt-16">
      {showLoginModal && (
        <LoginRequiredModal
          productName={product.name}
          onClose={() => setShowLoginModal(false)}
        />
      )}
      {showUpgradeModal && (
        <UpgradeToPremiumModal
          productName={product.name}
          premiumPrice={product.premiumPrice}
          onClose={() => setShowUpgradeModal(false)}
        />
      )}

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <nav className="flex items-center gap-2 text-sm text-stone-400">
          <Link to="/" className="hover:text-stone-700 transition-colors">Home</Link>
          <ChevronRight size={14} />
          <Link to="/menu" className="hover:text-stone-700 transition-colors">Shop</Link>
          <ChevronRight size={14} />
          <span className="text-stone-700 font-medium truncate">{product.name}</span>
        </nav>
      </div>

      {/* Main */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

          {/* Image gallery */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <div className="relative rounded-3xl overflow-hidden aspect-square bg-stone-100 mb-4">
              <img
                src={product.gallery?.[activeImg] || product.image}
                alt={product.name}
                onError={e => { e.target.onerror = null; e.target.src = fallbackImage }}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.bestseller && <span className="badge bg-olive-700 text-white text-sm">Bestseller</span>}
                {product.new && <span className="badge bg-stone-900 text-white text-sm">New</span>}
                {product.originalPrice && (
                  <span className="badge bg-rose-500 text-white text-sm">
                    {Math.round((1 - product.price / product.originalPrice) * 100)}% off
                  </span>
                )}
              </div>
            </div>
            {product.gallery && product.gallery.length > 1 && (
              <div className="flex gap-3">
                {product.gallery.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                      activeImg === i ? 'border-olive-600' : 'border-transparent opacity-60'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:sticky lg:top-24"
          >
            <p className="text-stone-400 text-sm font-semibold uppercase tracking-widest mb-2 capitalize">
              {product.category}
            </p>
            <h1 className="font-display text-4xl font-bold text-stone-900 mb-2">{product.name}</h1>
            <p className="text-stone-500 text-base mb-5 italic">{product.tagline}</p>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16}
                    className={i < Math.round(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-stone-200'}
                  />
                ))}
              </div>
              <span className="font-bold text-stone-800">{product.rating}</span>
              <span className="text-stone-400 text-sm">({product.reviews} reviews)</span>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {product.tags.map(tag => (
                <span key={tag} className="badge bg-stone-100 text-stone-600 text-xs">{tag}</span>
              ))}
            </div>

            {/* ── Pricing ── */}
            {product.premiumPrice ? (
              <div className="mb-6">
                <div className="flex flex-col gap-3">

                  {/* Regular price radio */}
                  <label
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => setPricingMode('regular')}
                  >
                    <input
                      type="radio"
                      name={`price-${product.id}`}
                      checked={pricingMode === 'regular'}
                      onChange={() => setPricingMode('regular')}
                      className="w-4 h-4 accent-stone-700 cursor-pointer"
                    />
                    <div className="flex items-baseline gap-2">
                      <span className="font-display text-3xl font-bold text-stone-800">₹{product.price}</span>
                      {product.originalPrice && (
                        <span className="text-base text-stone-400 line-through">₹{product.originalPrice}</span>
                      )}
                    </div>
                    <span className="text-xs text-stone-400 font-medium">Regular</span>
                  </label>

                  {/* Premium price radio */}
                  <label
                    className={`flex items-center gap-3 ${isPremium ? 'cursor-pointer' : 'cursor-pointer'}`}
                    onClick={handlePremiumRadioClick}
                  >
                    <input
                      type="radio"
                      name={`price-${product.id}`}
                      checked={pricingMode === 'premium'}
                      onChange={() => {}}
                      className="w-4 h-4 accent-amber-500 cursor-pointer"
                    />
                    <div className="flex items-center gap-2">
                      <span className={`font-display text-3xl font-bold ${isPremium ? 'text-amber-600' : 'text-stone-400'}`}>
                        ₹{product.premiumPrice}
                      </span>
                      <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">
                        <Crown size={11} /> Premium
                      </span>
                      {!isPremium && (
                        <span className="text-xs text-stone-400 font-medium">— members only</span>
                      )}
                    </div>
                  </label>
                </div>

                {/* Non-premium hint */}
                {!isPremium && (
                  <button
                    onClick={() => isAuthenticated ? setShowUpgradeModal(true) : setShowLoginModal(true)}
                    className="mt-3 flex items-center gap-1.5 text-xs text-amber-700 hover:text-amber-900 font-medium transition-colors"
                  >
                    <Crown size={12} />
                    Upgrade to Premium for ₹99/month to unlock this price
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-baseline gap-3 mb-6">
                <span className="font-display text-4xl font-bold text-stone-800">₹{product.price}</span>
                {product.originalPrice && (
                  <span className="text-lg text-stone-400 line-through">₹{product.originalPrice}</span>
                )}
              </div>
            )}

            {/* Qty */}
            <div className="flex items-center gap-4 mb-2">
              <div className="flex items-center gap-3 bg-white border border-stone-200 rounded-full px-2 py-1">
                <button
                  onClick={() => setQty(q => Math.max(product.minOrderQty ?? 1, q - (product.orderMultiple ?? 1)))}
                  className="w-8 h-8 rounded-full hover:bg-stone-100 flex items-center justify-center transition-colors"
                >
                  <Minus size={14} />
                </button>
                <span className="font-bold text-stone-800 w-8 text-center text-lg">{qty}</span>
                <button
                  onClick={() => setQty(q => q + (product.orderMultiple ?? 1))}
                  className="w-8 h-8 rounded-full hover:bg-stone-100 flex items-center justify-center transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>
              <span className="text-sm text-stone-500">
                Total: <span className="font-bold text-stone-800">₹{activePrice * qty}</span>
              </span>
            </div>
            {((product.minOrderQty ?? 1) > 1 || (product.orderMultiple ?? 1) > 1) && (
              <p className="text-xs text-stone-400 mb-4">
                Min. order: {product.minOrderQty ?? 1}
                {(product.orderMultiple ?? 1) > 1 && ` · Sold in multiples of ${product.orderMultiple}`}
              </p>
            )}

            {/* ── Action buttons ── */}
            <div className="flex gap-3 mb-4 flex-wrap">
              <button
                onClick={handleAddToCart}
                className="btn-primary flex items-center gap-2 flex-1"
              >
                <ShoppingCart size={16} />
                {pricingMode === 'premium' ? `Add to Cart · ₹${product.premiumPrice}` : 'Add to Cart'}
              </button>
              <button
                onClick={handleBuyNow}
                className="flex items-center gap-2 px-5 py-3 rounded-full bg-stone-900 hover:bg-stone-700 text-white text-sm font-semibold transition-colors flex-1 justify-center"
              >
                <Zap size={15} /> Buy Now
              </button>
            </div>

            <div className="flex gap-3 mb-8">
              <button
                onClick={() => toggleWishlist(product)}
                className="p-3 rounded-full border-2 border-stone-200 hover:border-stone-400 transition-colors"
              >
                <Heart size={20} className={isWishlisted(product.id) ? 'fill-rose-500 text-rose-500' : 'text-stone-400'} />
              </button>
              <button className="p-3 rounded-full border-2 border-stone-200 hover:border-stone-400 transition-colors">
                <Share2 size={20} className="text-stone-400" />
              </button>
            </div>

            {/* Perks */}
            <div className="bg-stone-50 rounded-2xl p-4 space-y-2.5 mb-6">
              {[
                isPremium ? 'Free delivery on every order (Premium)' : `Free delivery on orders over ₹${freeDeliveryThreshold}`,
                'Carefully packed — ships within 1–2 days',
                isPremium ? 'Easy 15-day returns & replacements (Premium)' : 'Easy 5-day returns & replacements',
              ].map(perk => (
                <div key={perk} className="flex items-start gap-2.5 text-sm text-stone-700">
                  <CheckCircle2 size={15} className="text-olive-600 mt-0.5 shrink-0" />
                  {perk}
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="border-b border-stone-200 mb-6">
              <div className="flex gap-6">
                {['description', 'details', 'warranty'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-3 text-sm font-medium capitalize transition-colors border-b-2 ${
                      activeTab === tab
                        ? 'border-olive-700 text-stone-900'
                        : 'border-transparent text-stone-400 hover:text-stone-700'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            <div className="text-sm text-stone-600 leading-relaxed">
              {activeTab === 'description' && <p>{product.description}</p>}
              {activeTab === 'details' && (
                <p><span className="font-semibold">Details:</span> {product.ingredients}</p>
              )}
              {activeTab === 'warranty' && (
                <div className="flex items-start gap-2">
                  <Leaf size={15} className="text-stone-400 mt-0.5 shrink-0" />
                  <p><span className="font-semibold">Warranty &amp; returns:</span> {product.allergens}</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-24">
            <h2 className="section-title mb-8">You Might Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
