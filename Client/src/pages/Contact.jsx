import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, MapPin, Clock, Send, CheckCircle2, Instagram, Facebook } from 'lucide-react'
import toast from 'react-hot-toast'

const topics = ['Order Support','Product Question','Returns & Refunds','Bulk / Wholesale Enquiry','Partnership','Feedback','Other']

export default function Contact() {
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', topic: '', message: '' })

  const handle = (e) => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  const submit = (e) => {
    e.preventDefault()
    setSent(true)
    toast.success("Message sent! We'll reply within 24 hours.", {
      style: { background: '#1c1917', color: '#fff', borderRadius: '12px' },
    })
  }

  const info = [
    { icon: Mail,  label: 'Email',         value: 'contact@zunocom.com',                      href: 'mailto:contact@zunocom.com' },
    { icon: MapPin,label: 'Delivery',      value: 'Pan-India shipping',                       href: '#' },
    { icon: Clock, label: 'Support Hours', value: 'Mon–Sat 9am–9pm · Sun 10am–6pm',           href: null },
  ]

  return (
    <div className="min-h-screen bg-[#F9F8F6] pt-16">
      {/* Header */}
      <div className="bg-white py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: 'radial-gradient(circle, #a8a29e 1px, transparent 1px)', backgroundSize: '32px 32px' }}
        />
        <div className="absolute top-[-60px] left-[-60px] w-[320px] h-[320px] rounded-full bg-stone-100 blur-3xl opacity-60" />
        <div className="absolute bottom-[-40px] right-[-40px] w-[280px] h-[280px] rounded-full bg-stone-200 blur-3xl opacity-60" />
        <div className="max-w-3xl mx-auto text-center relative">
          <motion.span
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="badge bg-olive-50 text-olive-700 border border-olive-200 mb-4"
          >
            Get in Touch
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="font-display text-5xl sm:text-6xl font-bold text-stone-900 mb-4"
          >
            Say Hello 👋
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
            className="text-stone-500 text-lg"
          >
            Questions about a product, an order, or a bulk enquiry — we'd love to hear from you.
          </motion.p>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none">
            <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" fill="#F9F8F6" />
          </svg>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">

          {/* Info */}
          <div className="space-y-6">
            {info.map(item => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="card p-5 flex gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-olive-50 flex items-center justify-center shrink-0">
                  <item.icon size={17} className="text-olive-700" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-0.5">{item.label}</p>
                  {item.href ? (
                    <a href={item.href} className="text-sm text-stone-800 font-medium hover:text-stone-500 transition-colors">
                      {item.value}
                    </a>
                  ) : (
                    <p className="text-sm text-stone-800 font-medium">{item.value}</p>
                  )}
                </div>
              </motion.div>
            ))}

            <div className="card p-5">
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">Follow us</p>
              <div className="flex flex-col gap-3">
                {[
                  { icon: Instagram, label: '@zuno' },
                  { icon: Facebook,  label: 'Zuno' },
                ].map(s => (
                  <a key={s.label} href="#"
                    className="flex items-center gap-2 text-sm text-stone-600 hover:text-stone-900 font-medium transition-colors">
                    <s.icon size={16} className="text-stone-400" /> {s.label}
                  </a>
                ))}
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden border border-stone-200 h-44 bg-stone-100 relative">
              <img
                src="https://images.unsplash.com/photo-1569336415962-a4bd9f69c8f4?w=600&q=60"
                alt="Map"
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white rounded-full p-3 shadow-lg">
                  <MapPin size={20} className="text-olive-700" />
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            {sent ? (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="card p-10 flex flex-col items-center text-center gap-5"
              >
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 size={40} className="text-green-500" />
                </div>
                <h2 className="font-display text-3xl font-bold text-stone-900">Message Sent!</h2>
                <p className="text-stone-500">Our team will get back to you within 24 hours.</p>
                <button
                  onClick={() => { setSent(false); setForm({ name:'', email:'', topic:'', message:'' }) }}
                  className="btn-outline mt-2"
                >
                  Send another message
                </button>
              </motion.div>
            ) : (
              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={submit}
                className="card p-6 sm:p-8 space-y-5"
              >
                <h2 className="font-display font-bold text-2xl text-stone-900">Send us a message</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input name="name" value={form.name} onChange={handle} required
                      placeholder="Kavitha Rajan" className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">
                      Email <span className="text-rose-500">*</span>
                    </label>
                    <input name="email" type="email" value={form.email} onChange={handle} required
                      placeholder="kavitha@example.com" className="input-field" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">
                    Topic <span className="text-rose-500">*</span>
                  </label>
                  <select name="topic" value={form.topic} onChange={handle} required className="input-field">
                    <option value="">Select a topic…</option>
                    {topics.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">
                    Message <span className="text-rose-500">*</span>
                  </label>
                  <textarea name="message" value={form.message} onChange={handle} required
                    rows={5} placeholder="Tell us anything…"
                    className="input-field resize-none" />
                </div>

                <button type="submit" className="btn-primary flex items-center gap-2">
                  <Send size={15} /> Send Message
                </button>
              </motion.form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
