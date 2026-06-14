import React, { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import {
  Crown, Truck, Tag, Headphones, Gift, ShieldCheck,
  Bell, Check, ChevronDown, ChevronUp, ArrowRight, Sparkles,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import toast from 'react-hot-toast'

// Razorpay hosted payment link for Premium Monthly (₹99/month)
const PREMIUM_MONTHLY_LINK = 'https://rzp.io/rzp/eqFM3TZV'
const PREMIUM_ANNUAL_LINK  = 'https://rzp.io/rzp/Lp9y9a3'

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

const benefits = [
  {
    icon: Bell,
    title: 'Pre-Sale Access',
    desc: 'Get notified and shop new arrivals and sale events 24 hours before everyone else.',
    color: 'bg-violet-50 text-violet-700',
  },
  {
    icon: Truck,
    title: 'Free Delivery Always',
    desc: 'Free delivery on every order, no minimum required — no matter how small the cart.',
    color: 'bg-emerald-50 text-emerald-700',
  },
  {
    icon: Tag,
    title: 'Members-Only Deals',
    desc: 'Exclusive discounts and flash sales visible only to Zuno Premium members.',
    color: 'bg-amber-50 text-amber-700',
  },
  {
    icon: Headphones,
    title: 'Priority Support',
    desc: 'Skip the queue — your queries are handled first with a dedicated support lane.',
    color: 'bg-sky-50 text-sky-700',
  },
  {
    icon: Gift,
    title: 'Birthday Surprise',
    desc: 'A special discount coupon lands in your inbox every year on your birthday.',
    color: 'bg-rose-50 text-rose-600',
  },
  {
    icon: ShieldCheck,
    title: 'Extended Returns',
    desc: 'Return window extended to 15 days (vs 5 days for free members) on all purchases.',
    color: 'bg-olive-50 text-olive-700',
  },
]

const makePlans = (threshold) => [
  {
    id: 'free',
    label: 'Free',
    price: '₹0',
    period: 'forever',
    highlight: false,
    badge: null,
    features: [
      'Shop across all categories',
      `Free delivery on orders over ₹${threshold}`,
      '5-day easy returns',
      'Order tracking',
      'Wishlist',
    ],
    missing: [
      '24h pre-sale access',
      'Members-only deals',
      'Free delivery on ALL orders',
      'Priority support',
      'Birthday discount',
      '15-day returns',
    ],
    cta: 'Current plan',
    ctaDisabled: true,
  },
  {
    id: 'monthly',
    label: 'Premium Monthly',
    price: '₹99',
    period: 'per month',
    highlight: false,
    badge: null,
    features: [
      'Everything in Free',
      '24h pre-sale access',
      'Free delivery on every order',
      'Members-only deals & flash sales',
      'Priority customer support',
      'Birthday discount coupon',
      '15-day easy returns',
    ],
    missing: [],
    cta: 'Subscribe Monthly',
    ctaDisabled: false,
  },
  {
    id: 'annual',
    label: 'Premium Annual',
    price: '₹599',
    period: 'per year',
    highlight: true,
    badge: 'Best value — save 58%',
    features: [
      'Everything in Premium Monthly',
      'Save ₹589 vs monthly billing',
      'Early access to annual mega-sale',
      'Priority queue during peak sales',
    ],
    missing: [],
    cta: 'Subscribe Annually',
    ctaDisabled: false,
  },
]

const makeFaqs = (threshold) => [
  {
    q: 'When does pre-sale access start?',
    a: 'As a Premium member you get access to sale events and new product drops 24 hours before they go live for all shoppers. You will receive an email notification as soon as the early window opens.',
  },
  {
    q: 'Is delivery really free on every order?',
    a: `Yes — Premium members get free delivery on every order regardless of value. Free members get free delivery on orders over ₹${threshold}.`,
  },
  {
    q: 'Can I cancel at any time?',
    a: 'Monthly plans can be cancelled anytime from your account settings — your benefits continue until the end of the billing period. Annual plans are non-refundable after 7 days.',
  },
  {
    q: 'How does the birthday discount work?',
    a: 'On your birthday (taken from your profile) we email you a 15% discount coupon valid for 7 days on any purchase — no minimum order required.',
  },
  {
    q: 'What are members-only deals?',
    a: 'Certain products and flash-sale prices are visible and purchasable only by Premium members. These are marked with a crown badge on the product listing.',
  },
]

function FAQ({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-stone-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-stone-50 transition-colors"
      >
        <span className="font-medium text-stone-900 text-sm sm:text-base">{q}</span>
        {open ? <ChevronUp size={18} className="text-stone-500 shrink-0" /> : <ChevronDown size={18} className="text-stone-500 shrink-0" />}
      </button>
      {open && (
        <div className="px-6 pb-5 text-sm text-stone-600 leading-relaxed border-t border-stone-100 pt-3">
          {a}
        </div>
      )}
    </div>
  )
}

function PlanCard({ plan, isPremium, onSubscribeClick }) {
  const isCurrentPlan = plan.id === 'free' || (isPremium && plan.id !== 'free')

  return (
    <div
      className={`relative flex flex-col rounded-2xl border ${
        plan.highlight
          ? 'border-olive-700 shadow-xl shadow-olive-900/10'
          : 'border-stone-200 shadow-sm'
      } bg-white overflow-hidden`}
    >
      {plan.badge && (
        <div className="bg-olive-700 text-white text-xs font-bold text-center py-2 tracking-wide uppercase">
          {plan.badge}
        </div>
      )}
      <div className="p-6 flex flex-col flex-1 gap-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-stone-500 mb-1">{plan.label}</p>
          <div className="flex items-end gap-1">
            <span className="font-display text-4xl font-bold text-stone-900">{plan.price}</span>
            <span className="text-stone-500 text-sm mb-1">/ {plan.period}</span>
          </div>
        </div>

        <ul className="flex flex-col gap-2.5 flex-1">
          {plan.features.map(f => (
            <li key={f} className="flex items-start gap-2 text-sm text-stone-700">
              <Check size={15} className="text-emerald-600 mt-0.5 shrink-0" />
              {f}
            </li>
          ))}
          {plan.missing.map(f => (
            <li key={f} className="flex items-start gap-2 text-sm text-stone-400 line-through">
              <span className="w-3.5 h-3.5 mt-0.5 shrink-0 inline-block rounded-full border border-stone-300" />
              {f}
            </li>
          ))}
        </ul>

        {isCurrentPlan ? (
          <button disabled className="w-full py-3 rounded-xl text-sm font-semibold bg-stone-100 text-stone-400 cursor-default">
            {isPremium && plan.id !== 'free' ? 'Current plan' : plan.cta}
          </button>
        ) : (
          <button
            onClick={() => onSubscribeClick(plan)}
            className={`w-full py-3 rounded-xl text-sm font-semibold transition-colors ${
              plan.highlight
                ? 'bg-olive-700 hover:bg-olive-800 text-white'
                : 'bg-stone-900 hover:bg-stone-700 text-white'
            }`}
          >
            {plan.cta}
          </button>
        )}
      </div>
    </div>
  )
}

export default function Subscribe() {
  const { isAuthenticated, isPremium } = useAuth()
  const { freeDeliveryThreshold } = useCart()
  const plans = makePlans(freeDeliveryThreshold)
  const faqs = makeFaqs(freeDeliveryThreshold)
  const navigate = useNavigate()

  function handleSubscribeClick(plan) {
    if (plan.id === 'monthly') {
      if (!isAuthenticated) {
        toast.error('Please log in first to subscribe', { icon: '🔒' })
        navigate('/login')
        return
      }
      localStorage.setItem('zuno_pending_plan', JSON.stringify({ plan: 'monthly', amount: 99 }))
      window.location.href = PREMIUM_MONTHLY_LINK
      return
    }
    // Annual plan
    if (!isAuthenticated) {
      toast.error('Please log in first to subscribe', { icon: '🔒' })
      navigate('/login')
      return
    }
    localStorage.setItem('zuno_pending_plan', JSON.stringify({ plan: 'annual', amount: 599 }))
    window.location.href = PREMIUM_ANNUAL_LINK
  }

  return (
    <div className="min-h-screen bg-[#F9F8F6] pt-16">

      {/* ── Hero ── */}
      <section className="relative bg-white py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-olive-50 blur-3xl opacity-60" />
          <div className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full bg-amber-50 blur-3xl opacity-50" />
        </div>
        <div className="relative max-w-3xl mx-auto text-center">
          <FadeUp>
            <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
              <Crown size={13} />
              Zuno Premium
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-stone-900 leading-tight mb-4">
              Shop smarter.<br />Save more.
            </h1>
            <p className="text-stone-500 text-lg leading-relaxed max-w-xl mx-auto mb-8">
              Get early access to every sale, free delivery on every order, and members-only prices — all for less than ₹2 a day.
            </p>
            <a href="#plans" className="btn-primary inline-flex items-center gap-2">
              <Sparkles size={16} />
              See plans
            </a>
          </FadeUp>
        </div>
      </section>

      {/* ── Benefits ── */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <FadeUp className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold text-stone-900 mb-3">Everything Premium unlocks</h2>
            <p className="text-stone-500 max-w-md mx-auto">Six ways your shopping gets better the moment you subscribe.</p>
          </FadeUp>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {benefits.map((b, i) => {
              const Icon = b.icon
              return (
                <FadeUp key={b.title} delay={i * 0.07}>
                  <div className="bg-white rounded-2xl border border-stone-100 p-6 flex gap-4 items-start hover:shadow-md transition-shadow">
                    <span className={`p-2.5 rounded-xl ${b.color} shrink-0`}>
                      <Icon size={20} />
                    </span>
                    <div>
                      <h3 className="font-semibold text-stone-900 mb-1">{b.title}</h3>
                      <p className="text-sm text-stone-500 leading-relaxed">{b.desc}</p>
                    </div>
                  </div>
                </FadeUp>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Pre-sale spotlight ── */}
      <section className="py-16 px-4 bg-olive-700">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center gap-8">
          <FadeUp className="shrink-0">
            <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center">
              <Bell size={36} className="text-white" />
            </div>
          </FadeUp>
          <FadeUp delay={0.1}>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mb-2">
              Be first. Every time.
            </h2>
            <p className="text-olive-200 leading-relaxed">
              Whether it's a flash sale, a new product drop, or the annual mega-sale — Premium members get a 24-hour head start. The best deals sell out fast; make sure you're first in line.
            </p>
          </FadeUp>
        </div>
      </section>

      {/* ── Plans ── */}
      <section id="plans" className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <FadeUp className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold text-stone-900 mb-3">Simple, honest pricing</h2>
            <p className="text-stone-500">No hidden fees. Cancel anytime on monthly plans.</p>
          </FadeUp>
          <div className="grid sm:grid-cols-3 gap-6 items-start">
            {plans.map((plan, i) => (
              <FadeUp key={plan.id} delay={i * 0.1}>
                <PlanCard
                  plan={plan}
                  isPremium={isPremium}
                  onSubscribeClick={handleSubscribeClick}
                />
              </FadeUp>
            ))}
          </div>
          <FadeUp delay={0.3} className="text-center mt-8">
            <p className="text-xs text-stone-400">
              All prices inclusive of GST · Secure payments via Razorpay ·{' '}
              <Link to="/contact" className="underline hover:text-stone-600">Need help?</Link>
            </p>
          </FadeUp>
        </div>
      </section>

      {/* ── Social proof ── */}
      <section className="py-16 px-4 bg-stone-900">
        <div className="max-w-4xl mx-auto grid sm:grid-cols-3 gap-8 text-center">
          {[
            { stat: '24h', label: 'early access to every sale' },
            { stat: '₹0', label: 'delivery on all orders' },
            { stat: '15', label: 'day return window (Premium)' },
          ].map((item, i) => (
            <FadeUp key={item.stat} delay={i * 0.1}>
              <p className="font-display text-5xl font-bold text-white mb-2">{item.stat}</p>
              <p className="text-stone-400 text-sm">{item.label}</p>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto">
          <FadeUp className="text-center mb-10">
            <h2 className="font-display text-3xl font-bold text-stone-900 mb-3">Common questions</h2>
          </FadeUp>
          <FadeUp delay={0.1} className="flex flex-col gap-3">
            {faqs.map(f => <FAQ key={f.q} {...f} />)}
          </FadeUp>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="py-20 px-4 bg-white border-t border-stone-100">
        <FadeUp className="max-w-xl mx-auto text-center">
          <Crown size={36} className="text-olive-700 mx-auto mb-4" />
          <h2 className="font-display text-3xl font-bold text-stone-900 mb-3">Ready to go Premium?</h2>
          <p className="text-stone-500 mb-8">Join thousands of Zuno shoppers who never miss a deal.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="#plans"
              className="btn-primary inline-flex items-center justify-center gap-2"
            >
              <Crown size={16} />
              Choose a plan
            </a>
            <Link
              to="/menu"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-stone-300 text-stone-700 hover:bg-stone-50 text-sm font-medium transition-colors"
            >
              Browse the store
              <ArrowRight size={15} />
            </Link>
          </div>
        </FadeUp>
      </section>

    </div>
  )
}
