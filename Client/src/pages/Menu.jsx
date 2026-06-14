import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ChevronDown, Search, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { fetchRealtimeCatalog } from '../services/realtimeCatalog'
import ProductCard from '../components/ProductCard'

const VISIBLE_CATS = 5 // "All" + 4 category tabs; rest go into "More" dropdown

const sortOptions = [
  { value: 'popular',    label: 'Most Popular' },
  { value: 'price-asc',  label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating',     label: 'Highest Rated' },
  { value: 'newest',     label: 'Newest First' },
]


export default function Menu() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery]   = useState('')
  const [sort, setSort]     = useState('popular')
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([{ id: 'all', label: 'All' }])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [moreOpen, setMoreOpen] = useState(false)
  const moreRef = useRef(null)

  const activeCategory = searchParams.get('category') || 'all'

  useEffect(() => {
    let mounted = true

    const loadCatalog = async () => {
      try {
        const data = await fetchRealtimeCatalog({
          search: query,
          categoryId: activeCategory,
        })
        if (!mounted) return
        setProducts(data.products)
        setCategories(data.categories)
        setError('')
      } catch (_err) {
        if (!mounted) return
        setError('Unable to load products right now.')
        setProducts([])
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadCatalog()
    const interval = setInterval(loadCatalog, 30000)
    return () => { mounted = false; clearInterval(interval) }
  }, [query, activeCategory])

  const setCategory = (cat) => {
    if (cat === 'all') setSearchParams({})
    else setSearchParams({ category: cat })
    setMoreOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Close "More" dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => { if (moreRef.current && !moreRef.current.contains(e.target)) setMoreOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = useMemo(() => {
    let list = [...products]
    switch (sort) {
      case 'price-asc':  list.sort((a, b) => a.price - b.price);                            break
      case 'price-desc': list.sort((a, b) => b.price - a.price);                            break
      case 'rating':     list.sort((a, b) => b.rating - a.rating);                          break
      case 'newest':     list.sort((a, b) => (b.new ? 1 : 0) - (a.new ? 1 : 0));           break
      default:           list.sort((a, b) => (b.bestseller ? 1 : 0) - (a.bestseller ? 1 : 0))
    }
    return list
  }, [products, sort])

  return (
    <div className="min-h-screen bg-[#F9F8F6]">

      {/* ══ CONTENT ══ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-10">

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 items-start md:items-center justify-between">
          <div className="relative w-full md:w-72">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search products…"
              className="input-field pl-10 pr-10"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="input-field w-auto text-sm py-2"
          >
            {sortOptions.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Category tabs — show first VISIBLE_CATS, rest in "More" dropdown */}
        {(() => {
          const visible = categories.slice(0, VISIBLE_CATS)
          const hidden  = categories.slice(VISIBLE_CATS)
          const activeInHidden = hidden.some(c => c.id === activeCategory)
          return (
            <div className="flex gap-2 flex-wrap mb-8 items-center">
              {visible.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium font-body transition-all duration-200 ${
                    activeCategory === cat.id
                      ? 'bg-olive-700 text-white shadow-md'
                      : 'bg-white text-stone-600 border border-stone-200 hover:border-stone-400'
                  }`}
                >
                  {cat.label}
                </button>
              ))}

              {hidden.length > 0 && (
                <div className="relative" ref={moreRef}>
                  <button
                    onClick={() => setMoreOpen(o => !o)}
                    className={`inline-flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium font-body transition-all duration-200 ${
                      activeInHidden
                        ? 'bg-olive-700 text-white shadow-md'
                        : 'bg-white text-stone-600 border border-stone-200 hover:border-stone-400'
                    }`}
                  >
                    {activeInHidden
                      ? categories.find(c => c.id === activeCategory)?.label
                      : 'More'}
                    <ChevronDown size={14} className={`transition-transform ${moreOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {moreOpen && (
                    <div className="absolute left-0 top-full mt-2 bg-white border border-stone-200 rounded-xl shadow-lg z-20 min-w-[160px] py-1">
                      {hidden.map(cat => (
                        <button
                          key={cat.id}
                          onClick={() => setCategory(cat.id)}
                          className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors ${
                            activeCategory === cat.id
                              ? 'text-olive-700 bg-olive-50'
                              : 'text-stone-600 hover:bg-stone-50'
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })()}

        {error && <p className="text-sm text-rose-600 mb-4">{error}</p>}

        <p className="text-sm text-stone-400 mb-6">
          Showing <span className="font-semibold text-stone-800">{filtered.length}</span> product{filtered.length !== 1 ? 's' : ''}
          {activeCategory !== 'all' && categories.find(c => c.id === activeCategory) && (
            <> in <span className="font-semibold text-stone-800">{categories.find(c => c.id === activeCategory).label}</span></>
          )}
        </p>

        {/* Grid */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-center py-24"
            >
              <p className="font-display text-2xl text-stone-800 mt-4 mb-2">Loading products...</p>
              <p className="text-stone-400 text-sm">Fetching the latest deals.</p>
            </motion.div>
          ) : filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-center py-24"
            >
              <span className="text-6xl">🔍</span>
              <p className="font-display text-2xl text-stone-800 mt-4 mb-2">No products found</p>
              <p className="text-stone-400 text-sm mb-6">Try a different search or category.</p>
              <button onClick={() => { setQuery(''); setCategory('all') }} className="btn-outline">
                Clear filters
              </button>
            </motion.div>
          ) : (
            <motion.div
              key={`${activeCategory}-${sort}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {filtered.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.4 }}
                >
                  <ProductCard product={p} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
