// Fetch a real photo for every seeded electronics product and UPLOAD it into the
// store's database (stored as a BLOB, served from /api/v1/products/:id/image).
//
// Photos come from a free stock-photo API — Pexels or Pixabay. Get a free key:
//   • Pexels:  https://www.pexels.com/api/   (header auth)
//   • Pixabay: https://pixabay.com/api/docs/ (key in query)
//
// Usage (PowerShell):
//   $env:PEXELS_KEY="your_key";  node scripts/seed-electronics-images.js https://zuno-stke.onrender.com
//   $env:PIXABAY_KEY="your_key"; node scripts/seed-electronics-images.js https://zuno-stke.onrender.com
//
// Usage (bash):
//   PEXELS_KEY=your_key  node scripts/seed-electronics-images.js https://zuno-stke.onrender.com
//
// Options:
//   FORCE=true   re-upload even for products that already have an image
//   ONLY=mobiles,laptops   limit to certain category slugs (product_type)
//
// Idempotent: by default skips products that already have an image_url.

import { SEED_TAG } from './electronics-data.js';

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

// ── Find a photo URL for a search query ───────────────────────────────────────
async function findPhotoUrl(query) {
  if (PROVIDER === 'pexels') {
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=3&orientation=square`;
    const res = await fetch(url, { headers: { Authorization: PEXELS_KEY } });
    if (res.status === 429) throw new Error('RATE_LIMIT');
    if (!res.ok) return null;
    const data = await res.json();
    const photo = data?.photos?.[0];
    return photo?.src?.large || photo?.src?.medium || photo?.src?.original || null;
  }
  // pixabay
  const url = `https://pixabay.com/api/?key=${PIXABAY_KEY}&q=${encodeURIComponent(query)}&image_type=photo&per_page=3&safesearch=true`;
  const res = await fetch(url);
  if (res.status === 429) throw new Error('RATE_LIMIT');
  if (!res.ok) return null;
  const data = await res.json();
  const hit = data?.hits?.[0];
  return hit?.largeImageURL || hit?.webformatURL || null;
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

// ── Upload one image to a product ─────────────────────────────────────────────
async function uploadImage(productId, buf, type) {
  const ext = type.includes('png') ? 'png' : 'jpg';
  const form = new FormData();
  form.append('image', new Blob([buf], { type }), `product.${ext}`);
  const res = await fetch(`${API}/products/${productId}/image`, { method: 'POST', body: form });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`upload → ${res.status} ${text.slice(0, 120)}`);
  }
  return true;
}

async function run() {
  console.log(`Target API : ${API}`);
  console.log(`Provider   : ${PROVIDER}${FORCE ? ' (FORCE re-upload)' : ''}`);
  if (ONLY.length) console.log(`Only       : ${ONLY.join(', ')}`);

  const products = await getAllProducts();
  let seeded = products.filter((p) => (p.attributes || {}).seed === SEED_TAG);
  if (ONLY.length) seeded = seeded.filter((p) => ONLY.includes(p.product_type));
  console.log(`\nSeeded electronics products: ${seeded.length}\n`);

  let done = 0, skipped = 0, failed = 0;

  for (const p of seeded) {
    if (!FORCE && p.image_url) { skipped += 1; continue; }

    const attrs = p.attributes || {};
    const queries = [
      attrs.image_query,
      String(p.product_type || '').replace(/-/g, ' '),
      'electronics device',
    ].filter(Boolean);

    let photoUrl = null;
    try {
      for (const q of queries) {
        photoUrl = await findPhotoUrl(q);
        if (photoUrl) break;
        await sleep(150);
      }
    } catch (err) {
      if (err.message === 'RATE_LIMIT') {
        console.error('  Rate limited by the photo API — wait a bit and re-run (already-done items are skipped).');
        break;
      }
      throw err;
    }

    if (!photoUrl) {
      console.warn(`  ✗ no photo found for "${p.name}" (${queries[0]})`);
      failed += 1;
      continue;
    }

    try {
      const img = await downloadImage(photoUrl);
      if (!img) { console.warn(`  ✗ download failed/too big for "${p.name}"`); failed += 1; continue; }
      await uploadImage(p.id, img.buf, img.type);
      done += 1;
      console.log(`  ✓ ${done}. ${p.name}`);
    } catch (err) {
      console.warn(`  ✗ ${p.name}: ${err.message}`);
      failed += 1;
    }

    await sleep(250); // be gentle on both APIs
  }

  console.log(`\nDone. Uploaded ${done}, skipped ${skipped} (already had image), failed ${failed}.`);
  if (failed) console.log('Re-run to retry failures (set FORCE=true to also replace existing images).');
}

run().catch((err) => { console.error('Failed:', err.message); process.exit(1); });
