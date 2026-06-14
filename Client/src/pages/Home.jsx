import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import {
  ArrowRight, Leaf, Truck, Award, RefreshCw,
} from 'lucide-react'
import { fetchRealtimeCatalog } from '../services/realtimeCatalog'
import { useCart } from '../context/CartContext'
import ProductCard from '../components/ProductCard'

/* ─── Fade-up wrapper ─── */
function FadeUp({ children, delay = 0, className = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

const makePerks = (threshold) => [
  { icon: Award,     title: 'Genuine Products',    desc: '100% authentic items sourced from trusted brands and sellers.' },
  { icon: Leaf,      title: 'Best Prices',         desc: 'Honest, everyday low prices with regular deals and offers.' },
  { icon: Truck,     title: 'Fast, Free Delivery', desc: `Complimentary delivery across India on every order over ₹${threshold}.` },
  { icon: RefreshCw, title: 'Easy 5-Day Returns',  desc: 'Changed your mind? Return or replace within 5 days, no questions asked.' },
]

export default function Home() {
  const { freeDeliveryThreshold } = useCart()
  const perks = makePerks(freeDeliveryThreshold)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  // Signature of the last applied catalog — lets the 30s poll skip a state
  // update (and the resulting re-render of every product card) when nothing
  // actually changed.
  const lastSigRef = useRef('')

  useEffect(() => {
    let mounted = true

    const loadCatalog = async () => {
      try {
        const data = await fetchRealtimeCatalog()
        if (!mounted) return

        const sig = data.products
          .map(p => `${p.id}:${p.price}:${p.image}:${p.bestseller ? 1 : 0}:${p.new ? 1 : 0}:${p.name}`)
          .join('|')
        if (sig !== lastSigRef.current) {
          lastSigRef.current = sig
          setProducts(data.products)
        }
      } catch (_err) {
        if (!mounted) return
        // Keep the last good catalog on a transient poll failure; only clear
        // if we never managed to load anything.
        if (!lastSigRef.current) setProducts([])
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadCatalog()
    const interval = setInterval(loadCatalog, 30000)

    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [])

  const bestsellers = useMemo(() => {
    const featured = products.filter(p => p.bestseller)
    const nonFeatured = products.filter(p => !p.bestseller)
    return [...featured, ...nonFeatured].slice(0, 8)
  }, [products])

  // The rest of the catalog (not already shown in Bestsellers), newest first,
  // so the lower grid lists more products without repeating the top ones.
  const moreProducts = useMemo(() => {
    const shownIds = new Set(bestsellers.map(p => p.id))
    const rest = products.filter(p => !shownIds.has(p.id))
    const fresh = rest.filter(p => p.new)
    const others = rest.filter(p => !p.new)
    return [...fresh, ...others].slice(0, 8)
  }, [products, bestsellers])

  const marqueeItems = useMemo(() => {
    if (!products.length) return ['New Arrivals', `Free delivery over ₹${freeDeliveryThreshold}`, 'Genuine products', 'Easy 5-day returns']
    return products.slice(0, 10).map(p => p.name)
  }, [products, freeDeliveryThreshold])

  return (
    <div className="min-h-screen bg-[#F9F8F6]">

      {/* ══ HERO ══ */}
      <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-white">
        {/* soft colour blobs */}
        <div className="absolute -top-32 -right-32 w-[520px] h-[520px] rounded-full bg-amber-50 blur-[100px] opacity-80" />
        <div className="absolute bottom-0 -left-24 w-96 h-96 rounded-full bg-olive-50 blur-[80px] opacity-70" />
        <div className="absolute top-1/3 left-1/2 w-72 h-72 rounded-full bg-stone-100 blur-3xl opacity-60" />

        <div className="relative max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-28 pb-16
                        grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-16 items-center">

          {/* ── Left: text ── */}
          <div className="max-w-2xl">

            {/* pill badge */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 bg-olive-50 border border-olive-200 text-olive-800 text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-8"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-olive-600 animate-pulse" />
              New arrivals every week
            </motion.div>

            {/* headline */}
            <motion.h1
              initial={{ opacity: 0, y: 36 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.75 }}
              className="font-display font-bold text-stone-900 leading-[1.04] mb-6"
              style={{ fontSize: 'clamp(2.6rem, 6vw, 5.5rem)' }}
            >
              Your everyday<br />
              store,{' '}
              <span className="relative inline-block">
                <span className="relative z-10 italic text-olive-700">reimagined.</span>
                <span className="absolute bottom-1 left-0 right-0 h-3 bg-amber-100 -z-0 rounded" />
              </span>
            </motion.h1>

            {/* sub-text */}
            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
              className="text-stone-500 text-lg leading-relaxed mb-10 max-w-lg"
            >
              Electronics, fashion, home, beauty and more — hand-picked and delivered
              across India with honest prices and zero surprises.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.48 }}
              className="flex flex-wrap gap-3 mb-12"
            >
              <Link to="/menu"
                className="inline-flex items-center gap-2 bg-stone-900 hover:bg-stone-700 text-white font-semibold text-sm px-7 py-3.5 rounded-full active:scale-95 transition-all duration-200 shadow-md"
              >
                Shop Now <ArrowRight size={15} />
              </Link>
              <Link to="/subscribe"
                className="inline-flex items-center gap-2 border-2 border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 font-semibold text-sm px-7 py-3.5 rounded-full active:scale-95 transition-all duration-200"
              >
                ✦ Premium — ₹99/mo
              </Link>
            </motion.div>

            {/* category quick-links */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
              className="flex flex-wrap gap-2"
            >
              {['Electronics', 'Fashion', 'Home', 'Beauty', 'Toys', 'Sports', 'Books'].map(cat => (
                <Link key={cat} to={`/menu`}
                  className="px-3.5 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-900 text-xs font-medium transition-colors"
                >
                  {cat}
                </Link>
              ))}
            </motion.div>
          </div>

          {/* ── Right: image mosaic ── */}
          <motion.div
            initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="hidden lg:grid grid-cols-2 gap-3 w-[420px] shrink-0"
          >
            {[
              { src: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80', tall: true },
              { src: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80', tall: false },
              { src: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&q=80', tall: false },
              { src: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400&q=80', tall: true },
            ].map((img, i) => (
              <motion.div
                key={i}
                animate={{ y: i % 2 === 0 ? [0, -10, 0] : [0, 10, 0] }}
                transition={{ duration: 4 + i * 0.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}
                className={`rounded-2xl overflow-hidden shadow-md border border-stone-100 ${img.tall ? 'row-span-2' : ''}`}
                style={{ height: img.tall ? '280px' : '130px' }}
              >
                <img src={img.src} alt="" className="w-full h-full object-cover" />
              </motion.div>
            ))}

            {/* floating deal badge */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white rounded-2xl shadow-xl border border-stone-100 px-5 py-3 flex items-center gap-3 whitespace-nowrap"
            >
              <span className="text-2xl">🛍️</span>
              <div>
                <p className="text-xs font-bold text-stone-900">Top Deals</p>
                <p className="text-xs text-stone-400">Up to 50% off today</p>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* ── Bottom stats bar ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75 }}
          className="relative border-t border-stone-100 bg-white/80 backdrop-blur-sm"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 sm:grid-cols-4 divide-x divide-stone-100">
            {[
              { value: '10,000+', label: 'Products listed' },
              { value: '₹0',      label: `Delivery on ₹${freeDeliveryThreshold}+` },
              { value: '4.9 ★',   label: 'Avg. customer rating' },
              { value: '5-day',   label: 'Hassle-free returns' },
            ].map(s => (
              <div key={s.label} className="py-5 px-6 text-center">
                <p className="font-display text-xl font-bold text-stone-900">{s.value}</p>
                <p className="text-stone-400 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ══ SCROLLING MARQUEE ══ */}
      <section className="py-6 bg-olive-700 overflow-hidden">
        <div className="marquee-track gap-12 px-4">
          {[...Array(2)].map((_, ri) =>
            marqueeItems.map((name, i) => (
              <span key={`${ri}-${i}`} className="flex items-center gap-3 text-white whitespace-nowrap">
                <span className="text-white/40 text-xl">✦</span>
                <span className="font-body font-medium text-sm tracking-wide">{name}</span>
              </span>
            ))
          )}
        </div>
      </section>

      {/* ══ BESTSELLERS ══ */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp className="flex items-end justify-between mb-12 gap-4 flex-wrap">
            <div>
              <p className="text-stone-400 font-body text-sm font-semibold uppercase tracking-widest mb-3">
                Most Loved
              </p>
              <h2 className="section-title">Our Bestsellers</h2>
            </div>
            <Link to="/menu" className="btn-outline flex items-center gap-2">
              View all <ArrowRight size={15} />
            </Link>
          </FadeUp>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              <p className="text-stone-500">Loading live products...</p>
            ) : bestsellers.length ? (
              bestsellers.map((p, i) => (
                <FadeUp key={p.id} delay={Math.min(i, 7) * 0.06}>
                  <ProductCard product={p} />
                </FadeUp>
              ))
            ) : (
              <p className="text-stone-500">No live products available at the moment.</p>
            )}
          </div>
        </div>
      </section>


      {/* ══ WHY ZENORA ══ */}
      <section className="py-20 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp className="text-center mb-14">
            <p className="text-stone-400 font-body text-sm font-semibold uppercase tracking-widest mb-3">
              Why Choose Us
            </p>
            <h2 className="section-title">The Zuno Promise</h2>
            <p className="section-subtitle mt-3 max-w-xl mx-auto">
              We believe great shopping starts with genuine products, fair prices and reliable delivery.
            </p>
          </FadeUp>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {perks.map((perk, i) => (
              <FadeUp key={perk.title} delay={i * 0.1}>
                <div className="card p-6 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-olive-50 flex items-center justify-center mx-auto mb-4">
                    <perk.icon size={22} className="text-olive-700" />
                  </div>
                  <h3 className="font-display font-bold text-stone-900 text-lg mb-2">{perk.title}</h3>
                  <p className="text-sm text-stone-500 leading-relaxed">{perk.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ══ MORE FROM THE COLLECTION ══ */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp className="flex items-end justify-between mb-12 gap-4 flex-wrap">
            <div>
              <p className="text-stone-400 font-body text-sm font-semibold uppercase tracking-widest mb-3">
                Keep Exploring
              </p>
              <h2 className="section-title">More Picks for You</h2>
            </div>
            <Link to="/menu" className="btn-outline flex items-center gap-2">
              View all <ArrowRight size={15} />
            </Link>
          </FadeUp>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              <p className="text-stone-500">Loading products...</p>
            ) : moreProducts.length ? (
              moreProducts.map((p, i) => (
                <FadeUp key={p.id} delay={Math.min(i, 7) * 0.06}>
                  <ProductCard product={p} />
                </FadeUp>
              ))
            ) : (
              <p className="text-stone-500">More pieces coming soon.</p>
            )}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeUp>
            <p className="text-stone-400 font-body text-sm font-semibold uppercase tracking-widest mb-3">
              Ordering is Simple
            </p>
            <h2 className="section-title mb-14">How It Works</h2>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-8 left-1/4 right-1/4 h-px bg-stone-200" />

            {[
              { step: '01', title: 'Browse & Pick',    desc: 'Explore the store and find products you love.',             emoji: '🛍️' },
              { step: '02', title: 'Place Your Order',  desc: 'Checkout securely in under 2 minutes — no account needed.', emoji: '📦' },
              { step: '03', title: 'Fast Delivery',     desc: 'Delivered to your door, anywhere across India.',            emoji: '✨' },
            ].map((s, i) => (
              <FadeUp key={s.step} delay={i * 0.15}>
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-3xl">
                      {s.emoji}
                    </div>
                    <span className="absolute -top-1 -right-1 badge bg-olive-700 text-white text-[10px]">
                      {s.step}
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-stone-900 text-xl">{s.title}</h3>
                  <p className="text-sm text-stone-500 max-w-xs leading-relaxed">{s.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>

          <FadeUp delay={0.4} className="mt-14">
            <Link to="/menu" className="btn-primary inline-flex items-center gap-2 px-10 py-4">
              Start Shopping <ArrowRight size={18} />
            </Link>
          </FadeUp>
        </div>
      </section>

      {/* ══ NEWSLETTER ══ */}
      <section className="py-20 bg-stone-900">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <FadeUp>
            <p className="text-stone-400 text-sm font-semibold uppercase tracking-widest mb-3">
              Stay in the Loop
            </p>
            <h2 className="font-display text-4xl font-bold text-white mb-4">
              New arrivals, before anyone else
            </h2>
            <p className="text-stone-400 mb-8">
              Subscribe for new arrivals, exclusive offers, and the best deals
              delivered straight to your inbox.
            </p>
            <form
              className="flex gap-3 flex-col sm:flex-row"
              onSubmit={e => e.preventDefault()}
            >
              <input
                type="email"
                placeholder="Your email address"
                className="input-field flex-1 bg-stone-800 border-stone-700 text-white placeholder-stone-500
                           focus:ring-olive-500"
              />
              <button type="submit" className="btn-primary whitespace-nowrap">
                Subscribe
              </button>
            </form>
            <p className="text-stone-600 text-xs mt-4">
              No spam, ever. Unsubscribe anytime.
            </p>
          </FadeUp>
        </div>
      </section>
    </div>
  )
}
