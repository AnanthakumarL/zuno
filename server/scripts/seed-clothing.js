// Seed the catalog with clothing data for Zenora.
// Wipes existing sections/categories/products and inserts a clothing store.
//
//   cd server && node scripts/seed-clothing.js
//
// Product images use external URLs stored in attributes.image — the storefront
// falls back to attributes.image when a product has no uploaded image BLOB, so
// no binary upload is needed. (Swap these for uploaded photos via Admin later.)

import { randomUUID } from 'crypto';
import { sequelize } from '../src/db/index.js';
import { Section, Category, Product } from '../src/db/models/index.js';

const SECTION_ID = randomUUID();

// ── Categories ────────────────────────────────────────────────────────────────
const categoryDefs = [
  { slug: 'tops',        name: 'Tops' },
  { slug: 'bottoms',     name: 'Bottoms' },
  { slug: 'dresses',     name: 'Dresses' },
  { slug: 'outerwear',   name: 'Outerwear' },
  { slug: 'knitwear',    name: 'Knitwear' },
  { slug: 'accessories', name: 'Accessories' },
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
  // Tops
  { name: 'Oversized Cotton Tee', cat: 'tops', price: 1290, featured: true,
    tagline: 'Heavyweight organic cotton, boxy fit',
    description: 'A relaxed, boxy tee cut from 240gsm organic cotton with a clean ribbed neckline. The everyday foundation of a considered wardrobe.',
    sizes: 'XS – XXL', material: '100% organic cotton, 240gsm', care: 'Machine wash cold, hang dry',
    tags: ['Cotton', 'Unisex', 'Essential'], rating: 4.7, reviews: 320, image: img('1521572163474-6864f9cf17ab') },
  { name: 'Relaxed Poplin Shirt', cat: 'tops', price: 2490,
    tagline: 'Crisp cotton poplin, easy drape',
    description: 'A relaxed button-up in crisp cotton poplin with a soft collar and mother-of-pearl buttons — equally at home tucked in or worn open.',
    sizes: 'S – XL', material: '100% cotton poplin', care: 'Machine wash cold, warm iron',
    tags: ['Cotton', 'Shirt', 'Workwear'], rating: 4.6, reviews: 142, image: img('1596755094514-f87e34085b2c') },
  { name: 'Ribbed Cotton Tank', cat: 'tops', price: 990, isNew: true,
    tagline: 'Fine rib, second-skin fit',
    description: 'A fitted ribbed tank in stretch cotton — the perfect layering piece under knitwear or worn on its own.',
    sizes: 'XS – L', material: '95% cotton, 5% elastane', care: 'Machine wash cold',
    tags: ['Cotton', 'Layering'], rating: 4.5, reviews: 88, image: img('1503342217505-b0a15ec3261c') },

  // Bottoms
  { name: 'Tailored Wool Trousers', cat: 'bottoms', price: 3490, featured: true,
    tagline: 'Pleated, mid-rise, fluid drape',
    description: 'Mid-rise tailored trousers in a soft wool blend with a single front pleat and a gently tapered leg for an elegant, easy line.',
    sizes: '26 – 36', material: '70% wool, 30% polyester', care: 'Dry clean only',
    tags: ['Wool blend', 'Tailored'], rating: 4.8, reviews: 142, image: img('1473966968600-fa801b869a1a') },
  { name: 'Relaxed Selvedge Denim', cat: 'bottoms', price: 4290,
    tagline: 'Rigid Japanese selvedge, straight leg',
    description: 'A straight-leg jean in rigid 13.5oz Japanese selvedge denim that breaks in beautifully over time. Cut for an easy, relaxed fit.',
    sizes: '26 – 38', material: '100% cotton, 13.5oz selvedge', care: 'Machine wash cold, inside out',
    tags: ['Selvedge', 'Denim', 'Everyday'], rating: 4.7, reviews: 203, image: img('1542272604-787c3835535d') },
  { name: 'Pleated Linen Shorts', cat: 'bottoms', price: 1990, isNew: true,
    tagline: 'Breathable linen, tailored ease',
    description: 'Tailored shorts in washed European linen with a single pleat and a clean, mid-length cut for warm-weather days.',
    sizes: '28 – 38', material: '100% washed linen', care: 'Machine wash cold, warm iron',
    tags: ['Linen', 'Summer'], rating: 4.4, reviews: 56, image: img('1591195853828-11db59a44f6b') },

  // Dresses
  { name: 'Linen Shirt Dress', cat: 'dresses', price: 3990, compareAt: 4990, featured: true, isNew: true,
    tagline: 'Breathable European linen, belted waist',
    description: 'A midi shirt dress in washed European linen with a self-tie waist and mother-of-pearl buttons. Effortless from desk to dinner.',
    sizes: 'XS – XL', material: '100% washed linen', care: 'Machine wash cold, warm iron',
    tags: ['Linen', 'Midi', 'Summer'], rating: 4.9, reviews: 98, image: img('1595777457583-95e059d581b8') },
  { name: 'Bias-Cut Silk Slip Dress', cat: 'dresses', price: 5490,
    tagline: 'Sandwashed mulberry silk',
    description: 'A bias-cut slip dress in sandwashed mulberry silk with adjustable straps and a fluid, body-skimming drape.',
    sizes: 'XS – L', material: '100% mulberry silk', care: 'Dry clean or gentle hand wash',
    tags: ['Silk', 'Evening', 'Slip'], rating: 4.8, reviews: 64, image: img('1583292650898-7d22cd27ca6f') },

  // Outerwear
  { name: 'Double-Faced Wool Overcoat', cat: 'outerwear', price: 8990, featured: true,
    tagline: 'Italian wool, unstructured shoulder',
    description: 'A longline overcoat in double-faced Italian wool with a relaxed, unstructured shoulder and deep welt pockets. A true cold-weather staple.',
    sizes: 'S – XL', material: '90% wool, 10% cashmere', care: 'Dry clean only',
    tags: ['Wool', 'Coat', 'Investment'], rating: 4.9, reviews: 76, image: img('1539533018447-63fcce2678e3') },
  { name: 'Cotton Gabardine Trench', cat: 'outerwear', price: 6490,
    tagline: 'Classic trench, modern cut',
    description: 'A refined trench in water-resistant cotton gabardine with a storm flap, belted waist, and a cleaner, contemporary silhouette.',
    sizes: 'S – XL', material: '100% cotton gabardine', care: 'Dry clean only',
    tags: ['Trench', 'Classic'], rating: 4.7, reviews: 51, image: img('1591047139829-d91aecb6caea') },

  // Knitwear
  { name: 'Merino Crew Knit', cat: 'knitwear', price: 2790, isNew: true,
    tagline: 'Fine-gauge merino, true to size',
    description: 'A fine-gauge crewneck knit in extra-fine merino wool — lightweight, breathable, and soft enough to wear against the skin.',
    sizes: 'XS – XXL', material: '100% extra-fine merino wool', care: 'Hand wash, dry flat',
    tags: ['Merino', 'Knit', 'Layering'], rating: 4.8, reviews: 134, image: img('1576566588028-4147f3842f27') },
  { name: 'Lambswool Cardigan', cat: 'knitwear', price: 3290,
    tagline: 'Soft lambswool, relaxed fit',
    description: 'A relaxed cardigan in pure lambswool with horn buttons and ribbed trims — a warm, easy layer for cooler days.',
    sizes: 'S – XL', material: '100% lambswool', care: 'Hand wash, dry flat',
    tags: ['Wool', 'Cardigan'], rating: 4.7, reviews: 72, image: img('1620799140408-edc6dcb6d633') },

  // Accessories
  { name: 'Full-Grain Leather Belt', cat: 'accessories', price: 1990,
    tagline: 'Vegetable-tanned full-grain leather',
    description: 'A minimal full-grain leather belt with a brushed matte buckle. Vegetable-tanned and made to develop a rich patina with wear.',
    sizes: '80 – 100 cm', material: 'Full-grain vegetable-tanned leather', care: 'Wipe clean, condition periodically',
    tags: ['Leather', 'Made to last'], rating: 4.6, reviews: 55, image: img('1624222247344-550fb60583dc') },
  { name: 'Cashmere Scarf', cat: 'accessories', price: 2990, featured: true,
    tagline: 'Pure cashmere, feather-light',
    description: 'A generously sized scarf woven from pure cashmere — exceptionally soft, warm, and light. A quiet winter luxury.',
    sizes: 'One size', material: '100% cashmere', care: 'Dry clean only',
    tags: ['Cashmere', 'Winter'], rating: 4.9, reviews: 61, image: img('1601924994987-69e26d50dc26') },
  { name: 'Organic Canvas Tote', cat: 'accessories', price: 1290, isNew: true,
    tagline: 'Heavyweight 16oz organic canvas',
    description: 'A roomy everyday tote in heavyweight organic cotton canvas with reinforced handles and an internal pocket.',
    sizes: 'One size', material: '16oz organic cotton canvas', care: 'Spot clean',
    tags: ['Canvas', 'Bag', 'Everyday'], rating: 4.6, reviews: 47, image: img('1544816155-12df9643f363') },
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
    weight: p.sizes,          // storefront shows this as "Sizes"
    ingredients: p.material,  // storefront shows this under "Material"
    allergens: p.care,        // storefront shows this under "Care"
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

  await Section.create({ id: SECTION_ID, name: 'Zenora Collection', is_active: true, order: 0 });
  await Category.bulkCreate(categories);
  console.log(`Inserted ${categories.length} categories.`);

  await Product.bulkCreate(products);
  console.log(`Inserted ${products.length} products.\n`);

  console.log('Done. Catalog is now a clothing store.');
  await sequelize.close();
}

run().catch(err => { console.error(err); process.exit(1); });
