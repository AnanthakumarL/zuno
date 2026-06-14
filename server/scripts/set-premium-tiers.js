// Update premium prices on the LIVE store to just two tiers (₹99 / ₹199) and
// remove the leftover "Test" product. Works through the HTTP API so it does NOT
// touch product images (re-seeding would wipe the uploaded photos).
//
//   node scripts/set-premium-tiers.js https://zuno-stke.onrender.com
//   PREMIUM_THRESHOLD=2999 node scripts/set-premium-tiers.js https://zuno-stke.onrender.com
//
// Rule: price <= PREMIUM_THRESHOLD → ₹99, otherwise → ₹199  (default threshold 1999)

import { PREMIUM_THRESHOLD as DEFAULT_THRESHOLD } from './electronics-data.js';

const rawBase = process.argv[2] || process.env.API_URL || process.env.BASE_URL;
if (!rawBase) {
  console.error('Usage: node scripts/set-premium-tiers.js <site-url>');
  process.exit(1);
}
const API = rawBase.replace(/\/+$/, '').replace(/\/api\/v1$/, '') + '/api/v1';
const THRESHOLD = Number(process.env.PREMIUM_THRESHOLD || DEFAULT_THRESHOLD);

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

async function run() {
  console.log(`Target API : ${API}`);
  console.log(`Threshold  : ₹${THRESHOLD} (≤ → ₹99, > → ₹199)\n`);

  const products = await getAllProducts();

  // ── Remove the "Test" product(s) ────────────────────────────────────────────
  const tests = products.filter((p) => String(p.name || '').trim().toLowerCase() === 'test');
  for (const t of tests) {
    const res = await fetch(`${API}/products/${t.id}`, { method: 'DELETE' });
    console.log(`${res.ok ? '🗑  Deleted' : '✗ Failed to delete'} product "${t.name}" (${t.id})`);
  }

  // ── Re-tier premium prices ──────────────────────────────────────────────────
  const remaining = products.filter((p) => !tests.includes(p));
  let updated = 0, unchanged = 0;
  const counts = { 99: 0, 199: 0 };

  for (const p of remaining) {
    const price = Number(p.price || 0);
    const newPremium = price <= THRESHOLD ? 99 : 199;
    counts[newPremium] += 1;

    const attrs = p.attributes || {};
    if (Number(attrs.premium_price) === newPremium) { unchanged += 1; continue; }

    const res = await fetch(`${API}/products/${p.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ attributes: { ...attrs, premium_price: newPremium } }),
    });
    if (res.ok) updated += 1;
    else console.warn(`  ✗ ${p.name}: PUT → ${res.status}`);
  }

  console.log(`\nPremium prices → ₹99: ${counts[99]} products · ₹199: ${counts[199]} products`);
  console.log(`Updated ${updated}, unchanged ${unchanged}. Deleted ${tests.length} "Test" product(s).`);
}

run().catch((err) => { console.error('Failed:', err.message); process.exit(1); });
