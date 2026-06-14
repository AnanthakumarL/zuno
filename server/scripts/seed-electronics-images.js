// Fetch a real photo for every seeded electronics product and UPLOAD it into the
// store's database (stored as a BLOB, served from /api/v1/products/:id/image).
//
// Goals:
//   • UNIQUE image per product  — never reuse the same stock photo twice.
//   • CLEAN background          — bias the search to isolated / white-background
//                                 product shots (square), with fallbacks.
//
// Photos come from a free stock-photo API — Pexels or Pixabay. Get a free key:
//   • Pexels:  https://www.pexels.com/api/   (header auth)
//   • Pixabay: https://pixabay.com/api/docs/ (key in query)
//
// Usage (PowerShell):
//   $env:PEXELS_KEY="your_key";  node scripts/seed-electronics-images.js https://zuno-stke.onrender.com
//   $env:PIXABAY_KEY="your_key"; node scripts/seed-electronics-images.js https://zuno-stke.onrender.com
//
// Options:
//   FORCE=true              re-assign all images fresh (ignore previous run)
//   ONLY=mobiles,laptops    limit to certain category slugs (product_type)
//
// Resumable: stores the chosen photo id (attributes.img_pexels_id) and a version
// flag (attributes.img_v=2). A normal re-run skips products already done and keeps
// every image globally unique.

import { SEED_TAG } from './electronics-data.js';

const IMG_VERSION = 2;

const rawBase = process.argv[2] || process.env.API_URL || process.env.BASE_URL;
if (!rawBase) {
  console.error('Usage: node scripts/seed-electronics-images.js <site-url>');
  console.error('   e.g. PEXELS_KEY=xxx node scripts/seed-electronics-images.js https://zuno-stke.onrender.com');
  process.exit(1);
}
const API = rawBase.replace(/\/+$/, '').replace(/\/api\/v1$/, '') + '/api/v1';

const PEXELS_KEY = process.env.PEXELS_KEY || '';
const PIXABAY_KEY = process.env.PIXABAY_KEY || '';
const PROVIDER = PEXELS_KEY ? 'pexels' : (PIXABAY_KEY ? 'pixabay' : '');
const FORCE = String(process.env.FORCE || '').toLowerCase() === 'true';
const ONLY = (process.env.ONLY || '').split(',').map((s) => s.trim()).filter(Boolean);

if (!PROVIDER) {
  console.error('No image API key set. Set PEXELS_KEY or PIXABAY_KEY in the environment.');
  console.error('  Pexels (free):  https://www.pexels.com/api/');
  console.error('  Pixabay (free): https://pixabay.com/api/docs/');
  process.exit(1);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const enc = encodeURIComponent;

// ── Fetch the live product list (paged) ───────────────────────────────────────
async function getAllProducts() {
  const all = [];
  let page = 1;
  for (;;) {
    const res = await fetch(`${API}/products?page=${page}&page_size=100`);
    if (!res.ok) throw new Error(`GET /products → ${res.status}`);
    const data = await res.json();
    const rows = data?.data || [];
    all.push(...rows);
    const total = Number(data?.total ?? rows.length);
    if (all.length >= total || rows.length === 0) break;
    page += 1;
    if (page > 100) break;
  }
  return all;
}

// ── Search photos → returns [{ id, url }] (cached per query string) ────────────
const searchCache = new Map();
async function searchPhotos(query, square) {
  const cacheKey = `${square ? 's' : 'a'}:${query}`;
  if (searchCache.has(cacheKey)) return searchCache.get(cacheKey);

  let list = [];
  if (PROVIDER === 'pexels') {
    const url = `https://api.pexels.com/v1/search?query=${enc(query)}&per_page=80${square ? '&orientation=square' : ''}`;
    const res = await fetch(url, { headers: { Authorization: PEXELS_KEY } });
    if (res.status === 429) throw new Error('RATE_LIMIT');
    if (res.ok) {
      const data = await res.json();
      list = (data?.photos || []).map((p) => ({ id: `px${p.id}`, url: p.src?.large || p.src?.medium || p.src?.original }));
    }
  } else {
    const url = `https://pixabay.com/api/?key=${PIXABAY_KEY}&q=${enc(query)}&image_type=photo&per_page=80&safesearch=true`;
    const res = await fetch(url);
    if (res.status === 429) throw new Error('RATE_LIMIT');
    if (res.ok) {
      const data = await res.json();
      list = (data?.hits || []).map((h) => ({ id: `pb${h.id}`, url: h.largeImageURL || h.webformatURL }));
    }
  }
  list = list.filter((x) => x.url);
  searchCache.set(cacheKey, list);
  return list;
}

// ── Pick a unique, clean-background photo for a product ────────────────────────
async function pickPhoto(product, usedIds) {
  const attrs = product.attributes || {};
  const q = attrs.image_query || String(product.product_type || '').replace(/-/g, ' ');
  const pt = String(product.product_type || '').replace(/-/g, ' ');

  // Ordered attempts: prefer clean white-background square shots, widen if needed.
  const attempts = [
    { q: `${q} white background`, square: true },
    { q: `${q} white background`, square: false },
    { q: `${q} isolated`,         square: true },
    { q: `${q}`,                  square: true },
    { q: `${pt} white background`, square: true },
    { q: `${q}`,                  square: false },
  ];

  for (const a of attempts) {
    const list = await searchPhotos(a.q, a.square);
    const found = list.find((c) => !usedIds.has(c.id));
    if (found) return found;
  }
  return null;
}

// ── Download image bytes ──────────────────────────────────────────────────────
async function downloadImage(url) {
  const res = await fetch(url);
  if (!res.ok) return null;
  const type = res.headers.get('content-type') || 'image/jpeg';
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length > 5 * 1024 * 1024) return null; // server cap is 5MB
  return { buf, type };
}

// ── Upload image + record the chosen photo id (for uniqueness on re-runs) ──────
async function uploadImage(productId, buf, type) {
  const ext = type.includes('png') ? 'png' : 'jpg';
  const form = new FormData();
  form.append('image', new Blob([buf], { type }), `product.${ext}`);
  const res = await fetch(`${API}/products/${productId}/image`, { method: 'POST', body: form });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`upload → ${res.status} ${text.slice(0, 120)}`);
  }
}

async function markDone(product, photoId) {
  const attributes = { ...(product.attributes || {}), img_pexels_id: photoId, img_v: IMG_VERSION };
  await fetch(`${API}/products/${product.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ attributes }),
  });
}

async function run() {
  console.log(`Target API : ${API}`);
  console.log(`Provider   : ${PROVIDER}${FORCE ? ' (FORCE — reassign all)' : ''}`);
  if (ONLY.length) console.log(`Only       : ${ONLY.join(', ')}`);

  const products = await getAllProducts();
  let seeded = products.filter((p) => (p.attributes || {}).seed === SEED_TAG);
  if (ONLY.length) seeded = seeded.filter((p) => ONLY.includes(p.product_type));

  // Global set of already-used photo ids so images never repeat (across re-runs too).
  const usedIds = new Set();
  if (!FORCE) {
    for (const p of seeded) {
      const id = (p.attributes || {}).img_pexels_id;
      if (id) usedIds.add(id);
    }
  }

  // What still needs an image this run.
  const todo = FORCE ? seeded : seeded.filter((p) => (p.attributes || {}).img_v !== IMG_VERSION);
  console.log(`\nSeeded products: ${seeded.length} · to process: ${todo.length} · already done: ${seeded.length - todo.length}\n`);

  let done = 0, failed = 0, rateLimited = false;

  for (const p of todo) {
    let photo = null;
    try {
      photo = await pickPhoto(p, usedIds);
    } catch (err) {
      if (err.message === 'RATE_LIMIT') { rateLimited = true; break; }
      throw err;
    }

    if (!photo) {
      console.warn(`  ✗ no unused photo for "${p.name}"`);
      failed += 1;
      continue;
    }

    try {
      const img = await downloadImage(photo.url);
      if (!img) { console.warn(`  ✗ download failed/too big for "${p.name}"`); failed += 1; continue; }
      await uploadImage(p.id, img.buf, img.type);
      await markDone(p, photo.id);
      usedIds.add(photo.id);
      done += 1;
      console.log(`  ✓ ${done}. ${p.name}  [${photo.id}]`);
    } catch (err) {
      console.warn(`  ✗ ${p.name}: ${err.message}`);
      failed += 1;
    }

    await sleep(250);
  }

  if (rateLimited) {
    console.log('\n⏳ Rate limited by the photo API. Wait ~30–60 min and re-run — finished items are skipped and uniqueness is preserved.');
  }
  console.log(`\nDone. Uploaded ${done}, failed ${failed}, remaining ${todo.length - done - failed}.`);
  console.log(`Unique photos used so far: ${usedIds.size}.`);
}

run().catch((err) => { console.error('Failed:', err.message); process.exit(1); });
