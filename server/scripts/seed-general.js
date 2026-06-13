// Seed the catalog with general ecommerce data for Zuno.
// Wipes existing sections/categories/products and inserts a general store
// (electronics, fashion, home, beauty, sports, toys).
//
//   cd server && node scripts/seed-general.js
//
// Product images use external URLs stored in attributes.image — the storefront
// falls back to a placeholder when a product has no uploaded image BLOB, so no
// binary upload is needed. (Swap these for uploaded photos via Admin later.)

import { randomUUID } from 'crypto';
import { sequelize } from '../src/db/index.js';
import { Section, Category, Product } from '../src/db/models/index.js';

const SECTION_ID = randomUUID();

// ── Categories ────────────────────────────────────────────────────────────────
const categoryDefs = [
  { slug: 'electronics', name: 'Electronics' },
  { slug: 'fashion',     name: 'Fashion' },
  { slug: 'home',        name: 'Home & Kitchen' },
  { slug: 'beauty',      name: 'Beauty & Personal Care' },
  { slug: 'sports',      name: 'Sports & Fitness' },
  { slug: 'toys',        name: 'Toys & Games' },
];

const categories = categoryDefs.map((c, i) => ({
  id: randomUUID(),
  name: c.name,
  slug: c.slug,
  section_id: SECTION_ID,
  is_active: true,
  order: i,
}));

const catId = (slug) => categories.find(c => c.slug === slug).id;

// ── Products ──────────────────────────────────────────────────────────────────
// price in INR; featured -> "Bestseller"; attrs.is_new -> "New" badge.
const img = (id) => `https://images.unsplash.com/photo-${id}?w=800&q=80`;

const productDefs = [
  // Electronics
  { name: 'Wireless Earbuds Pro', cat: 'electronics', price: 2499, featured: true,
    tagline: 'Active noise cancellation · 30h battery',
    description: 'True wireless earbuds with hybrid active noise cancellation, deep bass, and up to 30 hours of total playback with the charging case. Bluetooth 5.3 and a low-latency game mode.',
    details: 'Bluetooth 5.3, ANC, IPX5 water resistance, USB-C charging, 30h total battery',
    warranty: '1-year manufacturer warranty · 30-day easy returns',
    tags: ['Audio', 'Wireless', 'ANC'], rating: 4.6, reviews: 1280, image: img('1606220588913-b3aacb4d2f37') },
  { name: 'Smart Fitness Band', cat: 'electronics', price: 1799, isNew: true,
    tagline: 'Heart-rate, SpO2 & sleep tracking',
    description: 'A lightweight fitness band with 24/7 heart-rate and SpO2 monitoring, sleep tracking, 14 sport modes, and a bright AMOLED display. Up to 10 days of battery.',
    details: '1.1" AMOLED, heart-rate + SpO2, 5ATM water resistant, 10-day battery',
    warranty: '1-year manufacturer warranty · 30-day easy returns',
    tags: ['Wearable', 'Fitness'], rating: 4.4, reviews: 642, image: img('1576243345690-4e4b79b63288') },
  { name: '65W GaN Fast Charger', cat: 'electronics', price: 999,
    tagline: 'Charge laptop & phone together',
    description: 'A compact 65W GaN charger with dual USB-C and one USB-A port — fast-charge a laptop and phone at the same time. Foldable pins and universal compatibility.',
    details: 'GaN tech, 2× USB-C + 1× USB-A, 65W max, foldable pins',
    warranty: '1-year manufacturer warranty · 30-day easy returns',
    tags: ['Charger', 'USB-C'], rating: 4.7, reviews: 410, image: img('1583863788434-e58a36330cf0') },

  // Fashion
  { name: 'Classic Cotton T-Shirt', cat: 'fashion', price: 599, featured: true,
    tagline: 'Soft combed cotton, regular fit',
    description: 'An everyday crew-neck tee in 100% combed cotton with a clean ribbed collar and a comfortable regular fit. Pre-shrunk and available in multiple colours.',
    details: '100% combed cotton, 180gsm, regular fit, sizes S–XXL',
    warranty: 'Easy 30-day returns & replacement',
    tags: ['Cotton', 'Unisex', 'Essential'], rating: 4.5, reviews: 980, image: img('1521572163474-6864f9cf17ab') },
  { name: 'Lightweight Running Sneakers', cat: 'fashion', price: 2299,
    tagline: 'Breathable mesh, cushioned sole',
    description: 'Everyday running sneakers with a breathable knit-mesh upper, cushioned EVA midsole, and a grippy rubber outsole. Lightweight and comfortable all day.',
    details: 'Knit-mesh upper, EVA midsole, rubber outsole, sizes 6–11',
    warranty: 'Easy 30-day returns & replacement',
    tags: ['Footwear', 'Running'], rating: 4.4, reviews: 530, image: img('1542291026-7eec264c27ff') },
  { name: 'Leather Strap Analog Watch', cat: 'fashion', price: 1899, isNew: true,
    tagline: 'Minimal dial, genuine leather strap',
    description: 'A minimalist analog watch with a slim case, clean dial, and a genuine leather strap. Water-resistant and dressy enough for any occasion.',
    details: 'Quartz movement, 40mm case, genuine leather strap, 3ATM water resistant',
    warranty: '1-year manufacturer warranty · 30-day easy returns',
    tags: ['Watch', 'Accessory'], rating: 4.6, reviews: 295, image: img('1524805444758-089113d48a6d') },

  // Home & Kitchen
  { name: 'Stainless Steel Cookware Set', cat: 'home', price: 3499, compareAt: 4299, featured: true,
    tagline: '5-piece, induction friendly',
    description: 'A 5-piece tri-ply stainless steel cookware set with even heat distribution and stay-cool handles. Induction and gas compatible, dishwasher safe.',
    details: 'Tri-ply stainless steel, 5 pieces, induction + gas, dishwasher safe',
    warranty: '2-year manufacturer warranty · 30-day easy returns',
    tags: ['Cookware', 'Kitchen'], rating: 4.5, reviews: 372, image: img('1556910103-1c02745aae4d') },
  { name: 'Digital Air Fryer 4L', cat: 'home', price: 4999,
    tagline: 'Crispy food with up to 90% less oil',
    description: 'A 4-litre digital air fryer with 8 preset cooking modes and a non-stick basket. Enjoy crispy fries, snacks and roasts with little to no oil.',
    details: '4L capacity, 1400W, 8 presets, non-stick dishwasher-safe basket',
    warranty: '1-year manufacturer warranty · 30-day easy returns',
    tags: ['Appliance', 'Healthy'], rating: 4.6, reviews: 815, image: img('1626074353765-517a681e40be') },
  { name: 'Cotton Bedsheet Set (King)', cat: 'home', price: 1299,
    tagline: 'Soft 100% cotton, 2 pillow covers',
    description: 'A king-size bedsheet in soft, breathable 100% cotton with a 144 thread count and two matching pillow covers. Fade-resistant prints, machine washable.',
    details: '100% cotton, king size 90×100", 2 pillow covers, machine washable',
    warranty: 'Easy 30-day returns & replacement',
    tags: ['Bedding', 'Cotton'], rating: 4.3, reviews: 1120, image: img('1631049307264-da0ec9d70304') },

  // Beauty & Personal Care
  { name: 'Vitamin C Face Serum', cat: 'beauty', price: 699, isNew: true,
    tagline: 'Brightens & evens skin tone',
    description: 'A lightweight Vitamin C serum with hyaluronic acid that brightens, hydrates, and helps fade dark spots. Suitable for all skin types, paraben-free.',
    details: '20ml, Vitamin C + hyaluronic acid, paraben-free, all skin types',
    warranty: '30-day easy returns on unopened items',
    tags: ['Skincare', 'Serum'], rating: 4.4, reviews: 660, image: img('1620916566398-39f1143ab7be') },
  { name: 'Cordless Beard Trimmer', cat: 'beauty', price: 1499,
    tagline: '40 length settings, 90-min runtime',
    description: 'A cordless beard and hair trimmer with stainless-steel blades, 40 length settings, and a 90-minute cordless runtime on a quick USB charge.',
    details: 'Stainless-steel blades, 40 settings, USB charging, 90-min runtime, washable',
    warranty: '1-year manufacturer warranty · 30-day easy returns',
    tags: ['Grooming', 'Trimmer'], rating: 4.5, reviews: 540, image: img('1621607512214-68297480165e') },
  { name: 'Aloe Vera Body Lotion', cat: 'beauty', price: 399,
    tagline: '24-hour deep moisture',
    description: 'A non-greasy body lotion enriched with aloe vera and Vitamin E for 24-hour hydration. Absorbs quickly and leaves skin soft and smooth.',
    details: '400ml, aloe vera + Vitamin E, non-greasy, dermatologically tested',
    warranty: '30-day easy returns on unopened items',
    tags: ['Skincare', 'Moisturiser'], rating: 4.3, reviews: 430, image: img('1556228720-195a672e8a03') },

  // Sports & Fitness
  { name: 'Anti-Slip Yoga Mat 6mm', cat: 'sports', price: 899, featured: true,
    tagline: 'Extra cushioning, carry strap',
    description: 'A 6mm thick yoga mat with a textured anti-slip surface and extra cushioning for joints. Lightweight, easy to clean, and comes with a carry strap.',
    details: '6mm thick, anti-slip TPE, 183×61cm, includes carry strap',
    warranty: 'Easy 30-day returns & replacement',
    tags: ['Yoga', 'Fitness'], rating: 4.5, reviews: 720, image: img('1592432678016-e910b452f9a2') },
  { name: 'Adjustable Dumbbell 10kg', cat: 'sports', price: 1999,
    tagline: 'Quick-change weight plates',
    description: 'An adjustable dumbbell set with quick-change plates from 2.5kg to 10kg. Anti-roll handle with a secure locking nut — a compact home-gym essential.',
    details: 'Adjustable 2.5–10kg, anti-roll handle, secure locking, single dumbbell',
    warranty: '6-month manufacturer warranty · 30-day easy returns',
    tags: ['Strength', 'Home Gym'], rating: 4.4, reviews: 388, image: img('1638536532686-d610adfc8e5c') },
  { name: 'Insulated Steel Water Bottle 1L', cat: 'sports', price: 749, isNew: true,
    tagline: 'Hot 12h · Cold 24h',
    description: 'A double-walled vacuum-insulated stainless steel bottle that keeps drinks hot for 12 hours and cold for 24. Leak-proof lid and a powder-coated grip finish.',
    details: '1L, 304 stainless steel, double-wall vacuum, leak-proof, BPA-free',
    warranty: 'Easy 30-day returns & replacement',
    tags: ['Hydration', 'Outdoor'], rating: 4.6, reviews: 905, image: img('1602143407151-7111542de6e8') },

  // Toys & Games
  { name: 'Building Blocks Set (500 pcs)', cat: 'toys', price: 1299, featured: true,
    tagline: 'Creative STEM play for ages 4+',
    description: 'A 500-piece building blocks set in bright colours that encourages creativity and problem-solving. Compatible with major brands. Stored in a reusable box.',
    details: '500 pieces, non-toxic ABS, ages 4+, reusable storage box',
    warranty: 'Easy 30-day returns & replacement',
    tags: ['STEM', 'Kids'], rating: 4.7, reviews: 510, image: img('1558060370-d644479cb6f7') },
  { name: 'Rechargeable RC Car', cat: 'toys', price: 1799,
    tagline: '2.4GHz remote, all-terrain grip',
    description: 'A fast remote-control car with 2.4GHz control, all-terrain tyres, and a rechargeable battery pack. Responsive steering for indoor and outdoor play.',
    details: '2.4GHz remote, rechargeable battery, all-terrain tyres, ages 6+',
    warranty: '6-month manufacturer warranty · 30-day easy returns',
    tags: ['RC', 'Kids'], rating: 4.3, reviews: 274, image: img('1594787318286-3d835c1d207f') },
  { name: 'Wooden Chess Board Set', cat: 'toys', price: 999,
    tagline: 'Folding board with carved pieces',
    description: 'A classic folding wooden chess set with hand-finished pieces and felt-lined storage inside the board. A timeless game for all ages.',
    details: 'Folding wooden board 35×35cm, carved pieces, felt-lined storage',
    warranty: 'Easy 30-day returns & replacement',
    tags: ['Board Game', 'Classic'], rating: 4.6, reviews: 332, image: img('1529699211952-734e80c4d42b') },
];

const products = productDefs.map((p) => ({
  id: randomUUID(),
  name: p.name,
  description: p.description,
  price: p.price,
  compare_at_price: p.compareAt ?? null,
  category_id: catId(p.cat),
  section_id: SECTION_ID,
  sku: p.name.toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, ''),
  inventory_quantity: 100,
  min_order_quantity: 1,
  order_multiple: 1,
  is_active: true,
  featured: Boolean(p.featured),
  slug: p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
  product_type: p.cat,
  attributes: {
    tagline: p.tagline,
    rating: p.rating,
    reviews: p.reviews,
    weight: 'Standard',       // storefront no longer surfaces a size for general goods
    ingredients: p.details,   // storefront shows this under "Details"
    allergens: p.warranty,    // storefront shows this under "Warranty & returns"
    tags: p.tags,
    is_new: Boolean(p.isNew),
    image: p.image,
  },
}));

async function run() {
  await sequelize.authenticate();
  console.log('Connected to DB.\n');

  // Clean slate (no FK constraints are enforced between these tables).
  await Product.destroy({ where: {} });
  await Category.destroy({ where: {} });
  await Section.destroy({ where: {} });
  console.log('Cleared existing sections, categories, and products.');

  await Section.create({ id: SECTION_ID, name: 'Zuno Store', is_active: true, order: 0 });
  await Category.bulkCreate(categories);
  console.log(`Inserted ${categories.length} categories.`);

  await Product.bulkCreate(products);
  console.log(`Inserted ${products.length} products.\n`);

  console.log('Done. Catalog is now a general ecommerce store (Zuno).');
  await sequelize.close();
}

run().catch(err => { console.error(err); process.exit(1); });
