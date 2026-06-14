import React from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, Star, Heart, Eye } from 'lucide-react'
import { motion } from 'framer-motion'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { fallbackImage } from '../services/realtimeCatalog'

function ProductCard({ product }) {
  const { addItem } = useCart()
  const { isWishlisted, toggleWishlist } = useWishlist()

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="card group overflow-hidden"
    >
      {/* Image — entire area links to product detail */}
      <Link to={`/product/${product.id}`} className="relative block overflow-hidden aspect-square bg-stone-100">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          onError={e => { e.target.onerror = null; e.target.src = fallbackImage }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.bestseller && (
            <span className="badge bg-olive-700 text-white">Bestseller</span>
          )}
          {product.new && (
            <span className="badge bg-stone-900 text-white">New</span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={e => { e.preventDefault(); toggleWishlist(product) }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm
                     flex items-center justify-center shadow-sm hover:scale-110 transition-transform z-10"
        >
          <Heart
            size={15}
            className={isWishlisted(product.id) ? 'fill-rose-500 text-rose-500' : 'text-stone-400'}
          />
        </button>

        {/* Hover overlay — two actions */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0
                        transition-transform duration-300 p-3 flex gap-2">
          <button
            onClick={e => { e.preventDefault(); addItem(product, product.minOrderQty ?? 1) }}
            className="flex-1 btn-primary flex items-center justify-center gap-1.5 py-2.5 text-sm"
          >
            <ShoppingCart size={14} />
            Add to Cart
          </button>
          <span
            className="w-10 h-10 rounded-xl bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm shrink-0"
            title="View details"
          >
            <Eye size={16} className="text-stone-700" />
          </span>
        </div>
      </Link>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <Link
            to={`/product/${product.id}`}
            className="font-display font-semibold text-stone-900 text-base leading-tight
                       hover:text-olive-700 transition-colors line-clamp-1"
          >
            {product.name}
          </Link>
          <span className="badge bg-stone-100 text-stone-600 capitalize shrink-0">
            {product.category}
          </span>
        </div>

        <p className="text-xs text-stone-400 font-body leading-snug mb-3 line-clamp-1">
          {product.tagline}
        </p>

        <div className="flex items-center justify-between">
          {/* Rating */}
          <div className="flex items-center gap-1">
            <Star size={12} className="fill-amber-400 text-amber-400" />
            <span className="text-xs font-semibold text-stone-700">{product.rating}</span>
            <span className="text-xs text-stone-400">({product.reviews})</span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2">
            {product.premiumPrice ? (
              <>
                <span className="text-xs text-stone-500 line-through font-medium">₹{product.price}</span>
                <span className="font-display font-bold text-lg text-amber-500">₹{product.premiumPrice}</span>
              </>
            ) : (
              <>
                {product.originalPrice && (
                  <span className="text-xs text-stone-400 line-through">₹{product.originalPrice}</span>
                )}
                <span className="font-display font-bold text-stone-800 text-lg">₹{product.price}</span>
              </>
            )}
          </div>
        </div>

        {/* View details link */}
        <Link
          to={`/product/${product.id}`}
          className="mt-3 flex items-center gap-1 text-xs font-medium text-olive-700 hover:text-olive-900 transition-colors"
        >
          <Eye size={12} />
          View details
        </Link>
      </div>
    </motion.div>
  )
}

// Memoized: the Home page polls the catalog every 30s, so without this every
// card in every grid would re-render on each poll even when nothing changed.
export default React.memo(ProductCard)
