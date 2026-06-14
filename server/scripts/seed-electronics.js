// Seed the catalog with 110 electronic products across 22 categories — writes
// STRAIGHT TO THE DATABASE via Sequelize.
//
//   cd server && node scripts/seed-electronics.js
//
// • APPEND by default — it does NOT delete your existing non-electronics
//   products. It only removes the electronics it created on a previous run
//   (products tagged attributes.seed = 'electronics' + the categories below),
//   so re-running is safe and never duplicates.
// • Set WIPE_ALL=true to clear the WHOLE catalog first (electronics only):
//     WIPE_ALL=true node scripts/seed-electronics.js
// • No product images — the storefront shows an "Image coming soon" placeholder
//   until a photo is uploaded from Admin → Products.
// • premium_price is auto-assigned from the price band: 99 / 199 / 299 / 499 / 999.
//
// Connects to whatever DB the server is configured for (DATABASE_URL if set,
// otherwise local DB_HOST/DB_NAME). To seed production, run it where
// DATABASE_URL points at the production database (e.g. the Render service shell).
// If you only have the public site URL, use scripts/seed-electronics-api.js.

import { randomUUID } from 'crypto';
import { sequelize } from '../src/db/index.js';
import { Section, Category, Product } from '../src/db/models/index.js';
import { SECTION_NAME, SEED_TAG, buildCategories, buildProducts } from './electronics-data.js';

const SECTION_ID = randomUUID();
const categories = buildCategories(SECTION_ID);
const catIdBySlug = Object.fromEntries(categories.map((c) => [c.slug, c.id]));
const products = buildProducts(catIdBySlug, SECTION_ID);

async function run() {
  await sequelize.authenticate();
  console.log('Connected to DB.\n');

  const wipeAll = String(process.env.WIPE_ALL || '').toLowerCase() === 'true';

  if (wipeAll) {
    await Product.destroy({ where: {} });
    await Category.destroy({ where: {} });
    console.log('WIPE_ALL=true → cleared the entire catalog.');
  } else {
    // Idempotent append: remove only what THIS seed created previously, so a
    // re-run never duplicates and never touches your other products.
    const existing = await Product.findAll({ attributes: ['id', 'attributes'] });
    const prevSeeded = existing.filter((p) => (p.attributes || {}).seed === SEED_TAG).map((p) => p.id);
    if (prevSeeded.length) {
      await Product.destroy({ where: { id: prevSeeded } });
      console.log(`Removed ${prevSeeded.length} products from a previous electronics seed.`);
    }
    await Category.destroy({ where: { slug: categories.map((c) => c.slug) } });
    await Section.destroy({ where: { name: SECTION_NAME } });
  }

  await Section.create({ id: SECTION_ID, name: SECTION_NAME, is_active: true, order: 1 });
  await Category.bulkCreate(categories);
  console.log(`Inserted ${categories.length} electronics categories.`);

  await Product.bulkCreate(products);
  console.log(`Inserted ${products.length} electronics products (no images).\n`);

  const tiers = products.reduce((acc, p) => {
    const t = p.attributes.premium_price;
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {});
  console.log('Premium price tiers:', tiers);
  console.log('\nDone. Upload product photos from Admin → Products when ready.');
  await sequelize.close();
}

run().catch((err) => { console.error(err); process.exit(1); });
