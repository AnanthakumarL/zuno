import 'dotenv/config';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import { Sequelize, DataTypes } from 'sequelize';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IMAGES_DIR = path.join(__dirname, '..', '..', 'images');

// DB connection (mirrors src/config.js)
const sequelize = new Sequelize(
  process.env.DB_NAME || 'amudhu',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  { host: process.env.DB_HOST || 'localhost', port: parseInt(process.env.DB_PORT || '3306'), dialect: 'mariadb', logging: false }
);

const Product = sequelize.define('Product', {
  id: { type: DataTypes.UUID, primaryKey: true },
  image_data: { type: DataTypes.BLOB('long') },
  image_mime: { type: DataTypes.STRING(100) },
}, { tableName: 'products', timestamps: false });

// image filename → product IDs to assign it to
// Identified visually from each image's label and color
const mapping = [
  // Strawberry (pink) → 4L + Cup 100ml + Cup 50ml
  { img: 'Gemini_Generated_Image_.png', ids: [
    'c3903d1e-ab05-4732-857a-ccd85efa3c62', // Strawberry (4 Litre)
    '46af1d5c-f858-404a-89b3-1e697b364f1e', // Strawberry Cup (100ml)
    'c5fcc248-286d-49df-bfc4-ea91f1fe89ba', // Strawberry Cup (50ml)
  ]},
  // Butter Scotch (golden) → 4L + Cup 100ml + Cup 50ml
  { img: 'Gemini_Generated_Image_ (1).png', ids: [
    '91ee7a6f-e3a2-4add-a1fc-bc1c735d0f63', // Butter Scotch (4 Litre)
    '1984375e-eb37-46be-9754-b965cdeee9d1', // Butter Scotch Cup (100ml)
    '38c57aca-9a0a-41c7-b1d7-96a412ff1540', // Butter Scotch Cup (50ml)
  ]},
  // Pista (green) → 4L + Cup 100ml + Cup 50ml
  { img: 'Gemini_Generated_Image_ (2).png', ids: [
    '39f19614-aa0c-488f-aeff-ccd2977230ff', // Pista (4 Litre)
    '83c50867-6eaf-4628-867b-bf794da4c8ae', // Pista Cup (100ml)
    'e2fa5355-12c3-4fdd-8e11-57dde095a993', // Pista Cup (50ml)
  ]},
  // Vanilla (white/cream) → 4L + Cup 100ml + Cup 50ml
  { img: 'Gemini_Generated_Image_ (3).png', ids: [
    'b8f3586d-f449-4831-a67f-d6093f131047', // Vanilla (4 Litre)
    '498bd5aa-997c-4b5f-8bd5-8149ebf5fa68', // Vanilla Cup (100ml)
    '8b7ec324-3a06-42c7-bdf4-e761516d56b8', // Vanilla Cup (50ml)
  ]},
  // Chocolate (brown) → 4L + Cup 100ml + Cup 50ml
  { img: 'Gemini_Generated_Image_ (4).png', ids: [
    'cea44415-30f2-4a46-9270-ce172d62f392', // Chocolate (4 Litre)
    'd146d495-31b1-41c6-8c01-0bb9719a04a0', // Chocolate Cup (100ml)
    'c9a6d81b-25e0-4473-bd48-11707c048054', // Chocolate Cup (50ml)
  ]},
  // Mango (orange) → 4L + Cup 100ml + Cup 50ml
  { img: 'Gemini_Generated_Image_ (5).png', ids: [
    '7ab0d799-5a28-49fe-a683-96301466cd8f', // Mango (4 Litre)
    '7769e8c2-9bb2-4bf8-b0da-250bd0068d97', // Mango Cup (100ml)
    '4ffa80e0-4f04-4d06-af03-ca474380504b', // Mango Cup (50ml)
  ]},
  // Fruit Mix (colourful with fruit bits)
  { img: 'Gemini_Generated_Image_ (6).png', ids: [
    'e40a748f-9550-4d4b-9ea2-5dce3818c880', // Fruit Mix (4 Litre)
  ]},
  // Black Currant (dark maroon)
  { img: 'Gemini_Generated_Image_ (7).png', ids: [
    '76fb4058-117b-4225-a2d8-56d6b029daae', // Black Currant (4 Litre)
  ]},
  // Tutty Fruity (colourful dots) → 4L + Cup 100ml + Cup 50ml
  { img: 'Gemini_Generated_Image_ (9).png', ids: [
    '433dce48-46c0-4a3b-8545-ce67804f99e9', // Tutty Fruity (4 Litre)
    '847ef5bc-affe-4579-af33-5a37a530ad86', // Tutty Fruity Cup (100ml)
    'a0ba9286-32b1-4ed5-9f2c-3e1cb17841ec', // Tutty Fruity Cup (50ml)
  ]},
  // Spanish Delight (swirled cream)
  { img: 'Gemini_Generated_Image_ (10).png', ids: [
    '7bcab83d-0707-4101-a4e3-195a3b4fbff6', // Spanish Delight (4 Litre)
  ]},
  // Kesar Pista (yellow-green)
  { img: 'Gemini_Generated_Image_ (11).png', ids: [
    '3a27bfd4-b30d-4d32-8d30-50a53a1b2bb5', // Kesar Pista (4 Litre)
  ]},
  // Kaju Kismis (dark purple)
  { img: 'Gemini_Generated_Image_ (15).png', ids: [
    'f09cbb51-762c-4003-bab2-cb6ac7ca6be3', // Kaju Kismis (4 Litre)
  ]},
  // Kulfi (white with cardamom) → 4L + Pot Kulfi 100ml
  { img: 'Gemini_Generated_Image_ (21).png', ids: [
    '481864b3-7794-4147-a3e7-293866bcde68', // Kulfi (4 Litre)
    '7e479530-c0a7-467f-8839-868201db075d', // Pot Kulfi (100ml)
  ]},
  // Abucatta (avocado green)
  { img: 'Gemini_Generated_Image_ (22).png', ids: [
    '34e1a43e-23d9-4e58-a4db-baeab1429664', // Abucatta (4 Litre)
  ]},
  // Cassatta Ball (layered dome)
  { img: 'Gemini_Generated_Image_ (23).png', ids: [
    'd7c81f26-b2bb-4046-8423-4e885f460fe2', // Cassatta Ball (4 Litre)
  ]},
  // Custard Apple — use (8) purple-black currant style (closest available)
  { img: 'Gemini_Generated_Image_ (8).png', ids: [
    '15e64af0-6882-433e-a11d-8a40afd0931f', // Custard Apple (4 Litre)
  ]},
  // Natural Sapota — use (19) Spanish Delight creamy variant
  { img: 'Gemini_Generated_Image_ (19).png', ids: [
    '36b8b451-eca9-42af-9d8e-5c5b2f7630d1', // Natural Sapota (4 Litre)
  ]},
  // Fig Honey — use (17) warm dark-pink/maroon variant
  { img: 'Gemini_Generated_Image_ (17).png', ids: [
    'd8e6e929-7e23-4993-a35b-432942357085', // Fig Honey (4 Litre)
  ]},
  // Cups (generic) — use (24) cassatta dome cut view
  { img: 'Gemini_Generated_Image_ (24).png', ids: [
    'ec26d91f-7237-4c30-ae29-806991045ec3', // Cups
  ]},
];

async function run() {
  await sequelize.authenticate();
  console.log('Connected to DB.\n');

  let updated = 0;
  for (const { img, ids } of mapping) {
    const imgPath = path.join(IMAGES_DIR, img);
    let buffer;
    try {
      buffer = readFileSync(imgPath);
    } catch {
      console.warn(`  ⚠ Image not found: ${img}`);
      continue;
    }

    for (const id of ids) {
      await Product.update(
        { image_data: buffer, image_mime: 'image/png' },
        { where: { id } }
      );
      updated++;
    }
    console.log(`✓ ${img} → ${ids.length} product(s)`);
  }

  console.log(`\nDone. ${updated} products updated.`);
  await sequelize.close();
}

run().catch(err => { console.error(err); process.exit(1); });
