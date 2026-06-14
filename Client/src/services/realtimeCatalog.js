import axios from 'axios'
import { categories as localCategories } from '../data/products'

const API_BASE_URL = (() => {
  const configured = import.meta.env.VITE_API_BASE_URL
  if (configured) return configured

  if (typeof window === 'undefined') return 'http://localhost:7999/api/v1'

  const protocol = window.location.protocol || 'http:'
  const hostname = window.location.hostname || 'localhost'
  return `${protocol}//${hostname}:7999/api/v1`
})()

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Inline SVG placeholder — shown only when a product has no uploaded image_url.
// No external/random images: upload the real product photo from the Admin → Products page.
export const fallbackImage =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
  <rect width="400" height="400" fill="#f5f5f4"/>
  <g transform="translate(200 196)" fill="none" stroke="#0a0a0a" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">
    <path d="M-80 -40 L0 -80 L80 -40 L80 60 L0 100 L-80 60 Z" fill="#e7e5e4"/>
    <path d="M-80 -40 L0 0 L80 -40" />
    <path d="M0 0 L0 100" />
  </g>
  <text x="200" y="350" text-anchor="middle" font-family="system-ui, sans-serif" font-size="18" fill="#0a0a0a" font-weight="600">Image coming soon</text>
</svg>
  `.trim())

function normalizeCategory(c) {
  const id = c.id || c._id || c.slug
  const label = c.name || c.label || 'Uncategorized'
  return { id, label }
}

const SERVER_BASE = API_BASE_URL.replace(/\/api\/v1$/, '')

function normalizeProduct(product, categoryById) {
  const attrs = product.attributes || {}
  const categoryLabel = categoryById[product.category_id] || 'Uncategorized'
  const tags = Array.isArray(attrs.tags) ? attrs.tags : [categoryLabel]
  const image = product.image_url
    ? `${SERVER_BASE}${product.image_url}`
    : (attrs.image || fallbackImage)

  return {
    id: product.id,
    name: product.name,
    tagline: attrs.tagline || product.description || 'Quality products at honest prices',
    description: product.description || 'Quality products at honest prices',
    price: Number(product.price || 0),
    originalPrice: product.compare_at_price ?? null,
    category: categoryLabel.toLowerCase(),
    categoryId: product.category_id || null,
    rating: Number(attrs.rating ?? 4.8),
    reviews: Number(attrs.reviews ?? 0),
    weight: attrs.weight || 'Standard',
    bestseller: Boolean(product.featured),
    new: Boolean(attrs.is_new),
    tags,
    image,
    gallery: [image],
    ingredients: attrs.ingredients || 'Product details will be updated soon.',
    allergens: attrs.allergens || 'Standard manufacturer warranty & 30-day returns apply.',
    premiumPrice: attrs.premium_price ? Number(attrs.premium_price) : 99,
    minOrderQty: Math.max(1, Number(product.min_order_quantity) || 1),
    orderMultiple: Math.max(1, Number(product.order_multiple) || 1),
  }
}

export async function fetchRealtimeCatalog({
  search = '',
  categoryId = 'all',
  pageSize = 300,
} = {}) {
  const [categoriesResult, productsResult] = await Promise.allSettled([
    api.get('/categories', { params: { page: 1, page_size: pageSize } }),
    api.get('/products', {
      params: {
        page: 1,
        page_size: pageSize,
        is_active: true,
        ...(categoryId && categoryId !== 'all' ? { category_id: categoryId } : {}),
      },
    }),
  ])

  const categoriesData = categoriesResult.status === 'fulfilled'
    ? (categoriesResult.value.data?.data || [])
    : []

  if (productsResult.status !== 'fulfilled') {
    throw productsResult.reason
  }

  const productsData = productsResult.value.data?.data || []

  const categories = categoriesData
    .map(normalizeCategory)
    .filter(c => c.id)

  const visibleCategories = categories.filter(c => String(c.label || '').trim().toLowerCase() !== 'all')

  const categoryById = categories.reduce((acc, c) => {
    acc[c.id] = c.label
    return acc
  }, {})

  let products = productsData.map(p => normalizeProduct(p, categoryById))

  if (search.trim()) {
    const q = search.trim().toLowerCase()
    products = products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.tagline.toLowerCase().includes(q) ||
      p.tags.some(tag => tag.toLowerCase().includes(q))
    )
  }

  // Drive the storefront category tabs from the live backend categories so the
  // tab ids match each product's category_id (and filtering works). Fall back to
  // the static list only if the backend returned no categories.
  const tabCategories = visibleCategories.length
    ? [{ id: 'all', label: 'All' }, ...visibleCategories]
    : localCategories

  return {
    categories: tabCategories,
    products,
  }
}
