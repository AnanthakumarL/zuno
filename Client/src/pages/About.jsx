import React, { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { ArrowRight, Leaf, Award, Heart, Users } from 'lucide-react'

function FadeUp({ children, delay = 0, className = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

const milestones = [
  { year: '2018', event: 'Founded with a simple goal: make everyday shopping easy and affordable for everyone.' },
  { year: '2019', event: 'Crossed our first 10,000 happy customers across the country.' },
  { year: '2020', event: 'Launched free delivery and easy returns on orders across India.' },
  { year: '2022', event: 'Expanded the catalog into electronics, home, beauty and more.' },
  { year: '2024', event: 'Reached 1,00,000 orders with same-week delivery to most pin codes.' },
  { year: '2025', event: 'Onboarded thousands of trusted sellers and brands onto the platform.' },
]

const team = [
  {
    name: 'Kavitha Rajan', role: 'Co-founder & CEO',
    bio: 'Built Zuno to make quality products accessible to every household in India.',
    avatar: 'https://i.pravatar.cc/200?img=47',
  },
  {
    name: 'Muthu Krishnan', role: 'Co-founder & Head of Operations',
    bio: 'Runs the supply chain so every order reaches you fast, in perfect condition.',
    avatar: 'https://i.pravatar.cc/200?img=11',
  },
  {
    name: 'Divya Sundaram', role: 'Head of Customer Experience',
    bio: 'Makes sure every shopper is looked after, from checkout to doorstep.',
    avatar: 'https://i.pravatar.cc/200?img=44',
  },
]

const values = [
  { icon: Leaf,  title: 'Genuine Products',    desc: 'Every item is sourced from trusted brands and verified sellers — no fakes, ever.' },
  { icon: Award, title: 'Fair Prices',         desc: 'Honest, everyday low prices with regular deals so you always shop smart.' },
  { icon: Heart, title: 'Customer First',      desc: 'Easy returns, responsive support, and a hassle-free experience on every order.' },
  { icon: Users, title: 'Pan-India Delivery',  desc: 'Reliable, fast delivery to homes and businesses across the country.' },
]

export default function About() {
  return (
    <div className="min-h-screen bg-[#F9F8F6] pt-16">

      {/* Hero */}
      <section className="relative bg-white py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: 'radial-gradient(circle, #a8a29e 1px, transparent 1px)', backgroundSize: '32px 32px' }}
        />
        <div className="absolute top-[-60px] left-[-60px] w-[340px] h-[340px] rounded-full bg-stone-100 blur-3xl opacity-60" />
        <div className="absolute bottom-[-60px] right-[-60px] w-[300px] h-[300px] rounded-full bg-stone-200 blur-3xl opacity-60" />
        <div className="max-w-3xl mx-auto text-center relative">
          <motion.span
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="badge bg-olive-50 text-olive-700 border border-olive-200 mb-4"
          >
            Our Story
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="font-display text-5xl sm:text-6xl font-bold text-stone-900 mb-6 leading-tight"
          >
            Built to make<br />
            <span className="text-olive-700 italic">everyday shopping simple</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="text-stone-500 text-lg leading-relaxed"
          >
            Zuno began as a small online store and grew into a one-stop marketplace
            built on one idea: genuine products at honest prices, delivered to your door.
          </motion.p>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none">
            <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" fill="#F9F8F6" />
          </svg>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <FadeUp>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=700&q=80"
                alt="Inside the Zuno fulfilment centre"
                className="rounded-3xl w-full object-cover shadow-xl"
                style={{ aspectRatio: '4/3' }}
              />
              <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl shadow-xl p-5 max-w-[180px]">
                <p className="font-display font-bold text-stone-900 text-3xl">7+</p>
                <p className="text-stone-500 text-sm">years serving shoppers</p>
              </div>
            </div>
          </FadeUp>

          <FadeUp delay={0.2}>
            <p className="text-stone-400 text-sm font-semibold uppercase tracking-widest mb-4">The Beginning</p>
            <h2 className="section-title mb-6">From a small online store to a pan-India marketplace</h2>
            <div className="space-y-4 text-stone-600 leading-relaxed">
              <p>
                It started with a simple question: why is online shopping so often a gamble on
                price and authenticity? Kavitha and Muthu set out to answer it by building a store
                people could actually trust — genuine products, clear prices, reliable delivery.
              </p>
              <p>
                The first orders came from neighbours. Then friends. Then friends of friends.
                Within months, Zuno had thousands of customers across the country.
              </p>
              <p>
                Today, we bring electronics, fashion, home, beauty and more together in one place —
                but the philosophy hasn't changed. Every order still starts with one question:
                how do we make this <em>effortless</em> for you?
              </p>
            </div>
            <Link to="/menu" className="btn-primary inline-flex items-center gap-2 mt-8">
              Start Shopping <ArrowRight size={15} />
            </Link>
          </FadeUp>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp className="text-center mb-14">
            <p className="text-stone-400 text-sm font-semibold uppercase tracking-widest mb-3">What Drives Us</p>
            <h2 className="section-title">Our Values</h2>
          </FadeUp>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <FadeUp key={v.title} delay={i * 0.1}>
                <div className="card p-6">
                  <div className="w-11 h-11 rounded-xl bg-olive-50 flex items-center justify-center mb-4">
                    <v.icon size={20} className="text-olive-700" />
                  </div>
                  <h3 className="font-display font-bold text-stone-900 text-lg mb-2">{v.title}</h3>
                  <p className="text-sm text-stone-500 leading-relaxed">{v.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp className="text-center mb-14">
            <p className="text-stone-400 text-sm font-semibold uppercase tracking-widest mb-3">The Journey</p>
            <h2 className="section-title">Our Milestones</h2>
          </FadeUp>

          <div className="relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-stone-200 hidden md:block" />
            <div className="space-y-8">
              {milestones.map((m, i) => (
                <FadeUp key={m.year} delay={i * 0.1}>
                  <div className={`flex gap-6 md:gap-0 items-start ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                    <div className={`flex-1 ${i % 2 === 0 ? 'md:text-right md:pr-12' : 'md:text-left md:pl-12'}`}>
                      <div className="card p-5 inline-block w-full md:w-auto max-w-xs text-left md:text-inherit">
                        <p className="badge bg-olive-700 text-white mb-2">{m.year}</p>
                        <p className="text-sm text-stone-600 leading-relaxed">{m.event}</p>
                      </div>
                    </div>
                    <div className="hidden md:flex items-center justify-center w-8 shrink-0 relative">
                      <div className="w-4 h-4 rounded-full bg-olive-700 border-4 border-[#F9F8F6] z-10" />
                    </div>
                    <div className="flex-1" />
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-stone-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp className="text-center mb-14">
            <p className="text-stone-400 text-sm font-semibold uppercase tracking-widest mb-3">The People</p>
            <h2 className="section-title">Meet the Team</h2>
          </FadeUp>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, i) => (
              <FadeUp key={member.name} delay={i * 0.1}>
                <div className="card p-6 text-center">
                  <img src={member.avatar} alt={member.name}
                    className="w-24 h-24 rounded-full object-cover mx-auto mb-4 border-4 border-stone-100" />
                  <h3 className="font-display font-bold text-stone-900 text-xl mb-1">{member.name}</h3>
                  <p className="text-stone-400 text-sm font-semibold mb-3">{member.role}</p>
                  <p className="text-sm text-stone-500 leading-relaxed">{member.bio}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white text-center px-4 border-t border-stone-100">
        <FadeUp>
          <p className="text-stone-400 text-sm font-semibold uppercase tracking-widest mb-3">
            Ready to find your new favourites?
          </p>
          <h2 className="font-display text-4xl font-bold text-stone-900 mb-6">
            Explore everything in store
          </h2>
          <Link to="/menu" className="btn-primary inline-flex items-center gap-2 px-10 py-4">
            Start Shopping <ArrowRight size={18} />
          </Link>
        </FadeUp>
      </section>
    </div>
  )
}
