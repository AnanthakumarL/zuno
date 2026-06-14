// Seed the catalog through the LIVE HTTP API instead of a direct DB connection.
// Use this when you only have the public site URL (no DB credentials / no shell
// on the host) — e.g. a Render free-tier service.
//
//   node scripts/seed-electronics-api.js https://your-site.onrender.com
//   node scripts/seed-electronics-api.js https://zuno.site
//   WIPE_ALL=true node scripts/seed-electronics-api.js https://your-site.onrender.com
//
// The URL may be the site root or include /api/v1 — both work. It creates 22
// categories and 110 products (no images). APPEND + idempotent by default:
// re-running first removes the electronics it previously created.

import { buildCategories, buildProducts, SECTION_NAME, SEED_TAG } from './electronics-data.js';

const rawBase = process.argv[2] || process.env.API_URL || process.env.BASE_URL;
if (!rawBase) {
  console.error('Usage: node scripts/seed-electronics-api.js <site-url>');
  console.error('   e.g. node scripts/seed-electronics-api.js https://your-site.onrender.com');
  process.exit(1);
}
const API = rawBase.replace(/\/+$/, '').replace(/\/api\/v1$/, '') + '/api/v1';
const WIPE_ALL = String(process.env.WIPE_ALL || '').toLowerCase() === 'true';

async function req(method, path, body) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${method} ${path} → ${res.status} ${text.slice(0, 200)}`);
  }
  return res.status === 204 ? null : res.json().catch(() => null);
}

// Page through a list endpoint (handles small server page-size caps).
async function getAll(path) {
  const all = [];
  let page = 1;
  for (;;) {
    const data = await req('GET', `${path}?page=${page}&page_size=100`);
    const rows = data?.data || [];
    all.push(...rows);
    const total = Number(data?.total ?? rows.length);
    if (all.length >= total || rows.length === 0) break;
    page += 1;
    if (page > 100) break; // safety
  }
  return all;
}

async function run() {
  console.log(`Target API: ${API}`);
  const health = await req('GET', '/health').catch(() => null);
  console.log('Health:', health?.status || 'unknown', '\n');

  const categories = buildCategories(null);
  const ourSlugs = new Set(categories.map((c) => c.slug));

  // ── Cleanup ────────────────────────────────────────────────────────────────
  if (WIPE_ALL) {
    const [allProducts, allCats] = [await getAll('/products'), await getAll('/categories')];
    for (const p of allProducts) await req('DELETE', `/products/${p.id}`);
    for (const c of allCats) await req('DELETE', `/categories/${c.id}`);
    console.log(`WIPE_ALL=true → deleted ${allProducts.length} products and ${allCats.length} categories.`);
  } else {
    const existingProducts = await getAll('/products');
    const prevSeeded = existingProducts.filter((p) => (p.attributes || {}).seed === SEED_TAG);
    for (const p of prevSeeded) await req('DELETE', `/products/${p.id}`);
    const existingCats = await getAll('/categories');
    const prevCats = existingCats.filter((c) => ourSlugs.has(c.slug));
    for (const c of prevCats) await req('DELETE', `/categories/${c.id}`);
    if (prevSeeded.length || prevCats.length)
      console.log(`Removed ${prevSeeded.length} products and ${prevCats.length} categories from a previous run.`);
  }

  // ── Section (best-effort) ────────────────────────────────────────────────────
  let sectionId = null;
  try {
    const section = await req('POST', '/sections', { name: SECTION_NAME, is_active: true, order: 1 });
    sectionId = section?.id || null;
  } catch { /* sections optional — storefront doesn't require them */ }

  // ── Categories ───────────────────────────────────────────────────────────────
  const catIdBySlug = {};
  for (const c of categories) {
    const created = await req('POST', '/categories', {
      name: c.name, slug: c.slug, section_id: sectionId, is_active: true, order: c.order,
    });
    catIdBySlug[c.slug] = created?.id;
  }
  console.log(`Created ${categories.length} categories.`);

  // ── Products ─────────────────────────────────────────────────────────────────
  const products = buildProducts(catIdBySlug, sectionId);
  let ok = 0;
  for (const p of products) {
    const { id, ...body } = p; // let the server assign the id
    await req('POST', '/products', body);
    ok += 1;
    if (ok % 20 === 0) console.log(`  …${ok}/${products.length} products`);
  }
  console.log(`Created ${ok} products (no images).`);

  const tiers = products.reduce((acc, p) => {
    const t = p.attributes.premium_price;
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {});
  console.log('Premium price tiers:', tiers);
  console.log('\nDone. Upload product photos from Admin → Products when ready.');
}

run().catch((err) => { console.error('Failed:', err.message); process.exit(1); });
