// Shared electronics catalog definition used by the seeders:
//   • seed-electronics.js        — writes straight to the DB (Sequelize)
//   • seed-electronics-api.js    — writes through the live HTTP API
//   • seed-electronics-images.js — fetches a real photo per product and uploads it
//
// Keep product data here so the seeders never drift apart.
// Products are REAL, specific models (brand + model) with realistic ₹ prices.
// Each product carries an `image_query` (in attributes) so the image seeder can
// fetch a matching photo from a stock-photo API.

import { randomUUID } from 'crypto';

export const SECTION_NAME = 'Electronics Store';
export const SEED_TAG = 'electronics';
export const DEFAULT_WARRANTY = '1-year manufacturer warranty · 7-day replacement · 30-day returns';
export const APPLIANCE_WARRANTY = '2-year comprehensive warranty (extended on compressor/panel) · easy returns';

// Premium offer price — only two tiers: ₹99 for budget items, ₹199 for pricier.
export const PREMIUM_THRESHOLD = 1999;
export function premiumFor(price) {
  return Number(price) <= PREMIUM_THRESHOLD ? 99 : 199;
}

export const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// Fallback image search query per category (used when an item has no `query`).
const CATEGORY_QUERY = {
  'airpods': 'wireless earbuds',
  'mobiles': 'smartphone',
  'chargers': 'phone charger',
  'powerbanks': 'power bank',
  'earphones': 'headphones',
  'wireless': 'wifi router',
  'tv': 'smart television',
  'washing-machines': 'washing machine',
  'fridges': 'refrigerator',
  'mixers': 'mixer grinder kitchen',
  'ac': 'air conditioner',
  'laptops': 'laptop computer',
  'accessories': 'phone case accessory',
  'gaming': 'gaming gear',
  'printers': 'printer office',
  'soundbars': 'bluetooth speaker',
  'watches': 'smartwatch',
  'storage': 'usb drive ssd',
  'trimmers': 'beard trimmer',
  'keyboard-mouse': 'keyboard mouse',
  'cameras': 'camera',
  'tablets': 'tablet device',
};

// Each item: [name, price, tagline, details, extra?]
// extra (optional): { featured, isNew, rating, reviews, warranty, mrp, tags, query }
//   query → stock-photo search term for this specific product
export const CATEGORY_DATA = [
  { slug: 'airpods', name: 'AirPods & TWS', items: [
    ['Apple AirPods Pro (2nd Gen, USB-C)', 24900, 'Adaptive ANC · USB-C · MagSafe case', 'H2 chip, adaptive active noise cancellation, transparency mode, personalised spatial audio, USB-C MagSafe charging case, up to 30h with case', { featured: true, rating: 4.8, reviews: 5400, mrp: 26900, query: 'apple airpods pro' }],
    ['Apple AirPods (3rd Generation)', 18900, 'Spatial audio · sweat resistant', 'Spatial audio with dynamic head tracking, Adaptive EQ, IPX4, up to 30h with MagSafe case', { rating: 4.6, reviews: 3100, mrp: 20900, query: 'apple airpods' }],
    ['boAt Airdopes 141 TWS', 1299, '42h playback · ENx calls', 'Bluetooth 5.3, 8mm drivers, ENx tech for clear calls, IPX4, 42h total playback, low-latency BEAST mode', { featured: true, rating: 4.2, reviews: 12800, mrp: 4490, query: 'wireless earbuds white' }],
    ['Samsung Galaxy Buds FE', 6999, 'ANC · snug fit · 30h', 'Active noise cancellation, two-mic system, ergonomic wingtips, Bluetooth 5.2, 30h with case', { rating: 4.4, reviews: 2200, mrp: 8999, query: 'samsung galaxy buds' }],
    ['OnePlus Buds 3', 5499, 'Dual drivers · 49dB ANC · 44h', 'Dual dynamic drivers, up to 49dB adaptive noise cancellation, Bluetooth 5.3, 44h playback, IP55', { isNew: true, rating: 4.5, reviews: 1800, mrp: 5999, query: 'wireless earbuds case' }],
  ]},
  { slug: 'mobiles', name: 'Mobile Phones', items: [
    ['Apple iPhone 15 (128GB)', 65999, 'Dynamic Island · 48MP · USB-C', '6.1" Super Retina XDR OLED, A16 Bionic, 48MP main camera, Dynamic Island, USB-C, Ceramic Shield', { featured: true, rating: 4.7, reviews: 8900, mrp: 79900, query: 'iphone 15' }],
    ['Samsung Galaxy S24 Ultra (256GB)', 124999, 'Titanium · 200MP · S Pen · AI', '6.8" QHD+ Dynamic AMOLED 2X, Snapdragon 8 Gen 3, 200MP camera, built-in S Pen, titanium frame, Galaxy AI', { featured: true, rating: 4.8, reviews: 4200, mrp: 129999, query: 'samsung galaxy s24 ultra' }],
    ['Redmi Note 13 Pro 5G (128GB)', 23999, '200MP OIS · 120Hz AMOLED', '6.67" 120Hz AMOLED, Snapdragon 7s Gen 2, 200MP OIS camera, 5100mAh, 67W charging', { rating: 4.4, reviews: 6700, mrp: 27999, query: 'android smartphone' }],
    ['realme Narzo 70 5G (128GB)', 13999, 'Dimensity 6100+ · 120Hz', '6.72" 120Hz, MediaTek Dimensity 6100+, 50MP AI camera, 5000mAh, 45W charge', { rating: 4.2, reviews: 3400, mrp: 16999, query: 'smartphone black' }],
    ['OnePlus 12R (256GB)', 39999, 'Snapdragon 8 Gen 2 · 100W', '6.78" 120Hz LTPO AMOLED, Snapdragon 8 Gen 2, 5500mAh, 100W SUPERVOOC, Aqua Touch display', { isNew: true, rating: 4.6, reviews: 2900, mrp: 45999, query: 'oneplus smartphone' }],
  ]},
  { slug: 'chargers', name: 'Chargers & Cables', items: [
    ['Apple 20W USB-C Power Adapter', 1559, 'Fast charge for iPhone & iPad', '20W USB-C power delivery, compact design, fast-charges iPhone 8 and later', { rating: 4.6, reviews: 9800, mrp: 1900, query: 'usb charger adapter' }],
    ['Anker 65W GaN Charger (3-Port)', 2999, 'Charge laptop + phone together', 'GaNPrime, 2× USB-C + 1× USB-A, 65W total, foldable plug, PPS support', { featured: true, rating: 4.7, reviews: 2100, mrp: 4999, query: 'gan charger' }],
    ['boAt Type-C to Type-C 60W Cable', 399, 'Braided · 60W PD · 480Mbps', 'Nylon-braided USB-C to C, 60W power delivery, 480Mbps data, 1.5m, tangle-free', { rating: 4.3, reviews: 7600, mrp: 999, query: 'usb c cable braided' }],
    ['Spigen ArcStation 30W Wall Charger', 1499, 'Compact PD · GaN', '30W GaN USB-C, PD 3.0 + PPS, foldable pins, travel-friendly', { rating: 4.5, reviews: 1200, mrp: 2499, query: 'usb wall charger' }],
    ['Portronics Adapto 15W Wireless Pad', 899, 'Qi fast wireless charging', '15W Qi wireless charging pad, case-friendly, anti-slip surface, LED indicator', { isNew: true, rating: 4.2, reviews: 860, mrp: 1499, query: 'wireless charging pad' }],
  ]},
  { slug: 'powerbanks', name: 'Power Banks', items: [
    ['Anker PowerCore 20000mAh (22.5W)', 3499, 'Charge phone 4× · USB-C PD', '20000mAh, 22.5W output, USB-C in/out + USB-A, PowerIQ, LED status', { featured: true, rating: 4.6, reviews: 3300, mrp: 4999, query: 'power bank black' }],
    ['Mi Power Bank 3i 20000mAh', 1999, 'Triple port · 18W fast charge', '20000mAh, 18W two-way fast charge, dual input (USB-C + micro), triple output', { rating: 4.4, reviews: 14200, mrp: 2999, query: 'power bank' }],
    ['boAt EnergyShroom PB300 10000mAh', 1299, 'Slim · 20W · digital display', '10000mAh, 20W USB-C PD, digital battery display, metal body', { rating: 4.3, reviews: 5400, mrp: 2499, query: 'power bank portable' }],
    ['Ambrane 27000mAh 65W Power Bank', 2999, 'Laptop-capable · 65W PD', '27000mAh, 65W USB-C PD, charges laptops, triple output, LED display', { isNew: true, rating: 4.4, reviews: 1900, mrp: 4999, query: 'power bank usb' }],
    ['realme 10000mAh Power Bank 2', 999, 'Dual USB · 10W · slim', '10000mAh, 10W charging, dual output, slim polycarbonate body', { rating: 4.2, reviews: 4100, mrp: 1499, query: 'power bank slim' }],
  ]},
  { slug: 'earphones', name: 'Earphones & Headphones', items: [
    ['Sony WH-1000XM5 Wireless', 26990, 'Industry-leading ANC · 30h', 'Wireless over-ear, 8-mic industry-leading noise cancellation, 30h battery, LDAC, multipoint, quick charge', { featured: true, rating: 4.8, reviews: 3600, mrp: 34990, query: 'sony headphones' }],
    ['boAt Rockerz 450 On-Ear', 1499, '15h playback · 40mm drivers', 'Bluetooth on-ear, 40mm drivers, up to 15h playback, lightweight foldable, dual EQ', { rating: 4.2, reviews: 21000, mrp: 3990, query: 'on ear headphones' }],
    ['JBL Tune 510BT Wireless', 3499, 'Pure Bass · 40h · foldable', 'Wireless on-ear, JBL Pure Bass, 40h battery, quick charge, multipoint, foldable', { rating: 4.5, reviews: 8700, mrp: 4999, query: 'jbl headphones' }],
    ['Sony WI-C100 Neckband', 1499, 'Splash-proof · 25h battery', 'Wireless neckband, 25h battery, IPX4, DSEE upscaling, quick charge', { rating: 4.3, reviews: 6200, mrp: 1999, query: 'neckband earphones' }],
    ['boAt Bassheads 100 Wired', 399, 'HD sound · in-line mic', '10mm drivers, HD immersive sound, in-line mic, tangle-free cable, 3.5mm', { isNew: true, rating: 4.1, reviews: 38000, mrp: 999, query: 'wired earphones' }],
  ]},
  { slug: 'wireless', name: 'Wireless Devices', items: [
    ['TP-Link Archer AX10 Wi-Fi 6 Router', 2999, 'AX1500 · dual-band · OFDMA', 'Wi-Fi 6 AX1500, dual-band, 3 external antennas, OFDMA, gigabit ports, easy app setup', { featured: true, rating: 4.4, reviews: 4100, mrp: 3999, query: 'wifi router' }],
    ['TP-Link Deco M4 Mesh (2-Pack)', 5999, 'Whole-home mesh · 2800 sq ft', 'AC1200 whole-home mesh Wi-Fi, 2 units cover up to 2800 sq ft, seamless roaming', { rating: 4.6, reviews: 2300, mrp: 7999, query: 'mesh wifi router' }],
    ['D-Link DWR-921 4G LTE Router', 3999, 'SIM-based 4G Wi-Fi', '4G LTE router, SIM slot, Wi-Fi N300, 4 LAN ports, no wiring needed', { rating: 4.1, reviews: 1600, mrp: 5499, query: '4g router modem' }],
    ['Tenda Nova MW3 Mesh (3-Pack)', 4499, 'Covers up to 3500 sq ft', 'Whole-home mesh Wi-Fi, 3 nodes, up to 3500 sq ft, app managed, parental controls', { isNew: true, rating: 4.3, reviews: 1900, mrp: 6999, query: 'mesh wifi system' }],
    ['TP-Link RE315 AC1200 Wi-Fi Extender', 1499, 'Extend coverage · dual band', 'AC1200 Wi-Fi range extender, dual-band, OneMesh, ethernet port, signal indicator', { rating: 4.2, reviews: 3400, mrp: 2299, query: 'wifi extender' }],
  ]},
  { slug: 'tv', name: 'Televisions', items: [
    ['Samsung Crystal 4K 43" UHD Smart TV', 31999, '4K · HDR · Tizen', '43" Crystal 4K UHD, HDR10+, Tizen OS, PurColor, Q-Symphony, voice remote', { featured: true, rating: 4.5, reviews: 5200, mrp: 49900, warranty: APPLIANCE_WARRANTY, query: 'smart tv 4k' }],
    ['LG 32" HD Ready Smart TV', 13999, 'webOS · HDR10 · slim', '32" HD Ready LED, webOS smart, HDR10, AI ThinQ, 20W speakers', { rating: 4.4, reviews: 8800, mrp: 22990, warranty: APPLIANCE_WARRANTY, query: 'led television' }],
    ['Sony Bravia 55" 4K Google TV', 79999, '4K · Google TV · Dolby', '55" 4K UHD, Google TV, Dolby Vision + Atmos, Triluminos Pro, X1 processor', { isNew: true, rating: 4.7, reviews: 1800, mrp: 99900, warranty: APPLIANCE_WARRANTY, query: 'sony bravia tv' }],
    ['Mi 43" 4K Ultra HD Smart TV', 26999, '4K · Fire TV · Dolby Audio', '43" 4K UHD, built-in Fire TV, Dolby Audio, DTS-HD, bezel-less, HDR10', { rating: 4.3, reviews: 6100, mrp: 39999, warranty: APPLIANCE_WARRANTY, query: 'smart tv wall' }],
    ['OnePlus Y1S Pro 50" 4K Smart TV', 35999, '4K · Gamma Engine · Dolby', '50" 4K LED, Gamma Color Engine, Dolby Audio, Android TV, 24W speakers', { rating: 4.4, reviews: 2700, mrp: 49999, warranty: APPLIANCE_WARRANTY, query: 'television living room' }],
  ]},
  { slug: 'washing-machines', name: 'Washing Machines', items: [
    ['LG 7kg Fully-Automatic Top Load', 16990, 'Smart Inverter · Jet Spray+', '7kg fully-automatic top load, Smart Inverter motor, Jet Spray+, Smart Diagnosis, 700 RPM', { featured: true, rating: 4.5, reviews: 4300, mrp: 21990, warranty: APPLIANCE_WARRANTY, query: 'washing machine' }],
    ['Samsung 6.5kg Semi-Automatic', 10990, 'Twin tub · budget-friendly', '6.5kg semi-automatic twin tub, air turbo drying, rust-proof body, lint filter', { rating: 4.2, reviews: 5600, mrp: 14990, warranty: APPLIANCE_WARRANTY, query: 'washing machine semi' }],
    ['IFB 8kg Front Load Inverter', 33990, '8kg · 1200 RPM · steam wash', '8kg front load, inverter motor, 1200 RPM, steam wash, Aqua Energie, 4 Years comprehensive', { isNew: true, rating: 4.6, reviews: 2100, mrp: 44990, warranty: APPLIANCE_WARRANTY, query: 'front load washing machine' }],
    ['Bosch 7kg Front Load Washer', 31990, 'EcoSilence · 1200 RPM', '7kg front load, EcoSilence Drive, 1200 RPM, AntiVibration, 15 programs', { rating: 4.6, reviews: 1900, mrp: 39990, warranty: APPLIANCE_WARRANTY, query: 'washing machine front load' }],
    ['Whirlpool 9kg Fully-Auto Top Load', 21990, '9kg · ZPF · hard water wash', '9kg fully-automatic top load, Zero Pressure Fill, hard water wash, 6th Sense, 740 RPM', { rating: 4.4, reviews: 3200, mrp: 28990, warranty: APPLIANCE_WARRANTY, query: 'washing machine top load' }],
  ]},
  { slug: 'fridges', name: 'Refrigerators', items: [
    ['LG 190L Single Door Refrigerator', 16990, 'Smart Inverter · 5-star', '190L single door, Smart Inverter Compressor, 5-star, Smart Connect, toughened shelves', { featured: true, rating: 4.5, reviews: 6700, mrp: 21990, warranty: APPLIANCE_WARRANTY, query: 'refrigerator single door' }],
    ['Samsung 253L Double Door Frost-Free', 24990, 'Digital Inverter · convertible', '253L double door, frost-free, Digital Inverter, 5-in-1 convertible, all-around cooling', { rating: 4.5, reviews: 4200, mrp: 32990, warranty: APPLIANCE_WARRANTY, query: 'refrigerator double door' }],
    ['Whirlpool 192L Single Door', 14990, 'IntelliSense Inverter · 3-star', '192L single door, IntelliSense Inverter, MicroBlock, 9-in-1 convertible cooling', { rating: 4.3, reviews: 5100, mrp: 19990, warranty: APPLIANCE_WARRANTY, query: 'fridge kitchen' }],
    ['Haier 565L Side-by-Side Refrigerator', 56990, 'Inverter · water dispenser', '565L side-by-side, twin inverter, magic cooling, water dispenser, convertible', { isNew: true, rating: 4.6, reviews: 1400, mrp: 74990, warranty: APPLIANCE_WARRANTY, query: 'side by side refrigerator' }],
    ['Godrej 350L Triple Door Fridge', 33990, '3-door · veg zone · inverter', '350L triple door, frost-free, dedicated vegetable zone, inverter compressor', { rating: 4.4, reviews: 1700, mrp: 42990, warranty: APPLIANCE_WARRANTY, query: 'refrigerator modern' }],
  ]},
  { slug: 'mixers', name: 'Mixers & Grinders', items: [
    ['Preethi Zodiac MG-218 750W', 6499, '750W · 5 jars · Vega motor', '750W Vega W5 motor, 5 jars incl. master chef + juicer, 5-year motor warranty', { featured: true, rating: 4.6, reviews: 9800, mrp: 8500, query: 'mixer grinder' }],
    ['Bajaj Rex 500W Mixer Grinder', 1999, '500W · 3 jars · budget', '500W, 3 stainless steel jars, multifunction blade system, 3-speed', { rating: 4.3, reviews: 24000, mrp: 3299, query: 'mixer grinder kitchen' }],
    ['Philips HL7756 750W Mixer Grinder', 4999, '750W · Turbo · 3 jars', '750W powerful motor, advanced air ventilation, 3 jars, Turbo for tough grinding', { rating: 4.5, reviews: 11000, mrp: 6995, query: 'kitchen mixer grinder' }],
    ['Sujata Powermatic Plus 900W', 5499, '900W · 100% copper motor', '900W double ball-bearing motor, 100% copper, 3 jars, 90 mins continuous run', { isNew: true, rating: 4.6, reviews: 7400, mrp: 7000, query: 'blender grinder' }],
    ['Butterfly Smart 750W (4 Jars)', 2999, '750W · 4 jars · value', '750W, 4 jars incl. juicer jar, sturdy blades, overload protector', { rating: 4.2, reviews: 8900, mrp: 4995, query: 'mixer grinder steel' }],
  ]},
  { slug: 'ac', name: 'Air Conditioners', items: [
    ['LG 1.5 Ton 3-Star Inverter Split AC', 38990, 'Dual Inverter · copper · 4-way', '1.5 ton, 3-star dual inverter, 100% copper, 4-way swing, anti-virus filter, low noise', { featured: true, rating: 4.5, reviews: 5300, mrp: 52990, warranty: APPLIANCE_WARRANTY, query: 'split air conditioner' }],
    ['Voltas 1 Ton 3-Star Inverter Split AC', 28990, '1 ton · copper · turbo cool', '1 ton, 3-star inverter, 100% copper condenser, high ambient cooling, turbo mode', { rating: 4.3, reviews: 6800, mrp: 39990, warranty: APPLIANCE_WARRANTY, query: 'air conditioner wall' }],
    ['Daikin 1.5 Ton 5-Star Inverter Split AC', 46990, '5-star · Coanda · PM 2.5', '1.5 ton, 5-star inverter, Coanda airflow, PM 2.5 filter, 100% copper, triple display', { isNew: true, rating: 4.7, reviews: 3100, mrp: 58990, warranty: APPLIANCE_WARRANTY, query: 'air conditioner indoor' }],
    ['Blue Star 2 Ton 3-Star Inverter Split AC', 49990, '2 ton · large rooms · copper', '2 ton, 3-star inverter, 100% copper, precision cooling, self-diagnosis, dust filter', { rating: 4.4, reviews: 2200, mrp: 64990, warranty: APPLIANCE_WARRANTY, query: 'air conditioner room' }],
    ['LG 1.5 Ton 3-Star Window AC', 32990, 'Window AC · copper · easy install', '1.5 ton window AC, 3-star, 100% copper, monsoon comfort, anti-corrosion', { rating: 4.2, reviews: 1800, mrp: 42990, warranty: APPLIANCE_WARRANTY, query: 'window air conditioner' }],
  ]},
  { slug: 'laptops', name: 'Laptops', items: [
    ['Apple MacBook Air M2 13" (256GB)', 99900, 'M2 chip · 18h battery · Retina', '13.6" Liquid Retina, Apple M2, 8GB unified memory, 256GB SSD, up to 18h battery, MagSafe', { featured: true, rating: 4.8, reviews: 4600, mrp: 114900, query: 'macbook air laptop' }],
    ['HP Pavilion 14 Core i5 (16GB/512GB)', 54999, 'i5 13th Gen · FHD · backlit', '14" FHD IPS, Intel Core i5 13th Gen, 16GB RAM, 512GB SSD, backlit keyboard, Win 11', { rating: 4.4, reviews: 3200, mrp: 72999, query: 'laptop computer' }],
    ['Lenovo IdeaPad Slim 3 Core i3 (8GB)', 32999, 'i3 · 256GB SSD · thin', '15.6" FHD, Intel Core i3 12th Gen, 8GB RAM, 256GB SSD, rapid charge, Win 11', { rating: 4.2, reviews: 5400, mrp: 45990, query: 'laptop thin' }],
    ['ASUS ROG Strix G16 RTX Gaming Laptop', 129990, 'i7 · RTX 4060 · 165Hz', '16" 165Hz FHD+, Intel Core i7, 16GB RAM, 1TB SSD, RTX 4060, RGB keyboard', { isNew: true, rating: 4.7, reviews: 2100, mrp: 159990, query: 'gaming laptop' }],
    ['Dell Inspiron 15 Core i5 (16GB/512GB)', 52999, 'i5 · FHD · all-round', '15.6" FHD, Intel Core i5 13th Gen, 16GB RAM, 512GB SSD, ComfortView, Win 11', { rating: 4.3, reviews: 2800, mrp: 68490, query: 'laptop work' }],
  ]},
  { slug: 'accessories', name: 'Mobile Accessories', items: [
    ['Spigen Tempered Glass (iPhone 15)', 499, '9H · case-friendly · 2-pack', '9H tempered glass, oleophobic coating, edge-to-edge, easy-install kit, 2-pack', { rating: 4.5, reviews: 8700, mrp: 999, query: 'phone screen protector' }],
    ['Spigen Rugged Armor Case', 999, 'Military-grade drop protection', 'TPU shock-absorbent case, Air Cushion corners, carbon-fibre texture, raised bezels', { featured: true, rating: 4.6, reviews: 12000, mrp: 1799, query: 'phone case' }],
    ['ESR HaloLock MagSafe Phone Grip', 799, 'Magnetic grip + kickstand', 'MagSafe-compatible magnetic ring grip, foldable kickstand, strong N52 magnets', { rating: 4.4, reviews: 3100, mrp: 1499, query: 'phone grip stand' }],
    ['Portronics Mport 10 Flexible Tripod', 999, 'Flexible legs · BT remote', 'Octopus flexible tripod, phone + camera clamp, Bluetooth shutter remote', { isNew: true, rating: 4.3, reviews: 2400, mrp: 1999, query: 'phone tripod' }],
    ['boAt Magnetic Car Phone Mount', 599, 'Strong magnets · 360° rotate', 'Magnetic dashboard/vent car mount, 360° rotation, one-hand use, universal fit', { rating: 4.2, reviews: 4600, mrp: 1299, query: 'car phone mount' }],
  ]},
  { slug: 'gaming', name: 'Gaming', items: [
    ['Sony DualSense Wireless Controller (PS5)', 5990, 'Haptic feedback · adaptive triggers', 'PS5 DualSense, haptic feedback, adaptive triggers, built-in mic, USB-C, motion sensor', { featured: true, rating: 4.7, reviews: 6800, mrp: 6990, query: 'game controller' }],
    ['Redgear Shadow Blade Mechanical Keyboard', 2499, 'Hot-swap · RGB · blue switches', 'Mechanical keyboard, blue switches, full RGB, braided cable, anti-ghosting', { rating: 4.4, reviews: 5200, mrp: 3999, query: 'mechanical keyboard rgb' }],
    ['Logitech G102 Lightsync Gaming Mouse', 1495, '8000 DPI · RGB · 6 buttons', '8000 DPI optical, Lightsync RGB, 6 programmable buttons, lightweight', { rating: 4.6, reviews: 18000, mrp: 2495, query: 'gaming mouse rgb' }],
    ['Ant Esports H520W Gaming Headset', 1299, '7.1 surround · RGB · boom mic', 'Over-ear gaming headset, 50mm drivers, 7.1 virtual surround, RGB, noise-cancel boom mic', { isNew: true, rating: 4.3, reviews: 4100, mrp: 2999, query: 'gaming headset' }],
    ['Cosmic Byte Equinox XXL RGB Mousepad', 999, 'Full-desk · RGB edges', 'XXL 800×300mm mousepad, RGB edge lighting, anti-slip base, stitched edges', { rating: 4.5, reviews: 3600, mrp: 1799, query: 'rgb mousepad desk' }],
  ]},
  { slug: 'printers', name: 'Printers', items: [
    ['HP Smart Tank 580 All-in-One', 13999, 'Ink tank · Wi-Fi · 3-in-1', 'Print/scan/copy, refillable ink tank, dual-band Wi-Fi, up to 6000 black pages/bottle', { featured: true, rating: 4.4, reviews: 4200, mrp: 17999, query: 'printer office' }],
    ['Canon PIXMA G2770 Ink Tank Printer', 12999, 'High-yield ink tank · 3-in-1', 'Print/scan/copy, integrated ink tank, borderless photo, high page yield', { rating: 4.3, reviews: 3100, mrp: 15995, query: 'inkjet printer' }],
    ['Brother HL-B2000D Mono Laser Printer', 11999, 'Auto duplex · 34ppm', 'Mono laser, automatic 2-sided printing, 34 ppm, high-yield toner box', { rating: 4.5, reviews: 2400, mrp: 14999, query: 'laser printer' }],
    ['Epson EcoTank L3250 Wi-Fi Printer', 14999, 'EcoTank · Wi-Fi Direct · 3-in-1', 'Print/scan/copy, EcoTank refillable, Wi-Fi Direct, Smart Panel app, low cost/page', { isNew: true, rating: 4.6, reviews: 5600, mrp: 18499, query: 'home printer' }],
    ['HP LaserJet M141w Mono Laser', 14499, 'Compact laser · Wi-Fi · 3-in-1', 'Mono laser MFP, Wi-Fi, 20 ppm, HP Smart app, compact footprint', { rating: 4.3, reviews: 1900, mrp: 18999, query: 'office laser printer' }],
  ]},
  { slug: 'soundbars', name: 'Sound Bars & Speakers', items: [
    ['JBL Cinema SB271 2.1 Soundbar', 13999, '220W · wireless subwoofer', '2.1ch, 220W, wireless subwoofer, Dolby Digital, HDMI ARC + optical + Bluetooth', { featured: true, rating: 4.5, reviews: 3800, mrp: 24990, query: 'soundbar tv' }],
    ['boAt Aavante Bar 1500 Soundbar', 5999, '120W · 2.1 · wired sub', '120W 2.1 channel, wired subwoofer, multiple connectivity, EQ modes, bluetooth', { rating: 4.3, reviews: 6700, mrp: 14990, query: 'soundbar speaker' }],
    ['JBL Go 3 Portable Bluetooth Speaker', 2499, 'IP67 · bold sound · 5h', 'Portable Bluetooth speaker, IP67 dust/waterproof, JBL Pro Sound, 5h playtime', { rating: 4.6, reviews: 22000, mrp: 3499, query: 'bluetooth speaker portable' }],
    ['Sony SRS-XB13 Extra Bass Speaker', 3490, 'Extra Bass · IP67 · 16h', 'Compact wireless speaker, Extra Bass, IP67, 16h battery, strap, USB-C', { rating: 4.5, reviews: 9100, mrp: 4990, query: 'wireless speaker' }],
    ['Marshall Emberton II Portable Speaker', 14999, 'True Stereophonic · 30h+ · IP67', 'Portable Bluetooth speaker, True Stereophonic 360°, 30h+ battery, IP67, iconic design', { isNew: true, rating: 4.7, reviews: 2100, mrp: 17999, query: 'marshall speaker' }],
  ]},
  { slug: 'watches', name: 'Smart Watches', items: [
    ['Apple Watch SE (2nd Gen, GPS 40mm)', 29900, 'Crash detection · fitness · ECG-less', '40mm GPS, S8 chip, crash & fall detection, sleep + heart tracking, watchOS, retina display', { featured: true, rating: 4.7, reviews: 5200, mrp: 32900, query: 'apple watch' }],
    ['Samsung Galaxy Watch6 (40mm)', 27999, 'AMOLED · BioActive · Wear OS', '40mm Super AMOLED, BioActive sensor, advanced sleep coaching, Wear OS, sapphire glass', { rating: 4.5, reviews: 2400, mrp: 32999, query: 'samsung smartwatch' }],
    ['Noise ColorFit Pro 5 Smart Watch', 4999, '1.85" AMOLED · BT calling', '1.85" AMOLED, Bluetooth calling, 100+ sports modes, SpO2, 7-day battery, IP68', { rating: 4.3, reviews: 18000, mrp: 7999, query: 'smartwatch fitness' }],
    ['boAt Wave Call 2 Smart Watch', 1799, '1.83" · BT calling · DIY faces', '1.83" HD display, Bluetooth calling, 100+ sports modes, HR & SpO2, multiple watch faces', { rating: 4.1, reviews: 24000, mrp: 5999, query: 'smartwatch black' }],
    ['Fire-Boltt Phoenix Pro Smart Watch', 2199, '1.39" · BT calling · 120 sports', '1.39" round display, Bluetooth calling, 120 sports modes, HR monitor, IP67', { isNew: true, rating: 4.0, reviews: 31000, mrp: 8999, query: 'smartwatch round' }],
  ]},
  { slug: 'storage', name: 'Storage & Drives', items: [
    ['SanDisk Ultra 64GB USB 3.0 Pendrive', 499, '128MB/s · USB 3.0', '64GB USB 3.0 flash drive, up to 128MB/s read, retractable, SecureAccess software', { rating: 4.5, reviews: 28000, mrp: 850, query: 'usb flash drive' }],
    ['Samsung EVO Plus 128GB microSD', 1299, 'A2 U3 · 130MB/s · 4K', '128GB microSDXC, A2 U3 V30, up to 130MB/s, 4K-ready, with SD adapter', { featured: true, rating: 4.6, reviews: 16000, mrp: 1899, query: 'memory card microsd' }],
    ['SanDisk Extreme 1TB Portable SSD', 9999, '1050MB/s · IP65 · USB-C', '1TB portable SSD, up to 1050MB/s, IP65 water/dust resistance, USB-C, shock-resistant', { isNew: true, rating: 4.7, reviews: 4200, mrp: 14999, query: 'portable ssd drive' }],
    ['WD My Passport 2TB Hard Drive', 5499, '2TB · USB 3.0 · backup', '2TB portable HDD, USB 3.0, automatic backup software, password protection', { rating: 4.5, reviews: 9800, mrp: 7500, query: 'external hard drive' }],
    ['Crucial P3 500GB NVMe SSD', 3499, 'Gen3 NVMe · 3500MB/s', 'M.2 2280 NVMe Gen3 SSD, up to 3500MB/s read, Micron 3D NAND', { rating: 4.6, reviews: 5400, mrp: 4999, query: 'nvme ssd' }],
  ]},
  { slug: 'trimmers', name: 'Trimmers & Grooming', items: [
    ['Philips BT3211 Beard Trimmer', 1499, 'Skin-friendly · 60-min · 20 lengths', 'DuraPower beard trimmer, skin-friendly blades, 20 length settings, 60-min cordless, washable', { featured: true, rating: 4.4, reviews: 21000, mrp: 2295, query: 'beard trimmer' }],
    ['Mi Beard Trimmer 1C', 999, '40 lengths · IPX7 · USB-C', '40 length settings, self-sharpening blades, IPX7 washable, 90-min runtime, USB-C', { rating: 4.3, reviews: 38000, mrp: 1499, query: 'trimmer grooming' }],
    ['Braun Series 3 ProSkin Electric Shaver', 4999, '3 blades · wet & dry', 'Series 3 electric foil shaver, 3 cutting elements, wet & dry, 45-min runtime', { rating: 4.5, reviews: 6700, mrp: 7250, query: 'electric shaver' }],
    ['Philips Multigroom MG3730 (9-in-1)', 2499, '9-in-1 · self-sharpening', '9-in-1 face & hair grooming kit, self-sharpening steel blades, 60-min cordless', { isNew: true, rating: 4.4, reviews: 8900, mrp: 3995, query: 'grooming kit trimmer' }],
    ['Nova NHT 1092 Nose & Ear Trimmer', 699, 'Painless · washable head', 'Cordless nose, ear & eyebrow trimmer, washable head, AA powered, stainless blades', { rating: 4.1, reviews: 5400, mrp: 1299, query: 'nose trimmer' }],
  ]},
  { slug: 'keyboard-mouse', name: 'Keyboards & Mice', items: [
    ['Logitech MK295 Silent Wireless Combo', 2295, 'SilentTouch · 24-mo battery', 'Wireless keyboard + mouse combo, SilentTouch (90% less noise), 24-mo / 18-mo battery, plug-and-play', { featured: true, rating: 4.6, reviews: 11000, mrp: 2995, query: 'wireless keyboard mouse' }],
    ['Logitech M331 Silent Plus Mouse', 795, 'Silent click · 1000 DPI · 24-mo', 'Wireless mouse, silent clicks, contoured shape, 1000 DPI, 24-month battery', { rating: 4.6, reviews: 24000, mrp: 1195, query: 'wireless mouse' }],
    ['HP 230 Wireless Keyboard & Mouse', 1199, 'Slim · spill-resistant', 'Wireless slim keyboard + mouse, spill-resistant, 12 shortcut keys, 1600 DPI', { rating: 4.4, reviews: 6800, mrp: 1999, query: 'keyboard mouse combo' }],
    ['Zebronics MAX Plus Mechanical Keyboard', 1999, 'Blue switches · RGB · braided', 'Mechanical keyboard, outemu blue switches, multicolour LED, braided cable, metal top', { rating: 4.4, reviews: 9200, mrp: 3499, query: 'mechanical keyboard' }],
    ['Logitech MX Anywhere 3S Mouse', 7995, 'Quiet · 8K DPI · multi-device', 'Compact performance mouse, 8000 DPI, quiet clicks, MagSpeed scroll, Flow multi-device, USB-C', { isNew: true, rating: 4.7, reviews: 3100, mrp: 9495, query: 'premium wireless mouse' }],
  ]},
  { slug: 'cameras', name: 'Cameras', items: [
    ['GoPro HERO12 Black Action Camera', 41999, '5.3K60 · HyperSmooth 6.0 · waterproof', '5.3K60 video, HyperSmooth 6.0 stabilization, waterproof to 10m, HDR, long battery', { featured: true, rating: 4.6, reviews: 3400, mrp: 49500, query: 'action camera gopro' }],
    ['Canon EOS R50 Mirrorless Kit (18-45mm)', 54999, '24.2MP · 4K · APS-C', '24.2MP APS-C, 4K UHD video, Dual Pixel AF, with RF-S 18-45mm kit lens, Wi-Fi', { isNew: true, rating: 4.7, reviews: 1800, mrp: 67995, query: 'mirrorless camera' }],
    ['Sony ZV-1F Vlogging Camera', 49990, '20.1MP · 4K · flip screen', '20.1MP 1" sensor, 4K, vari-angle flip screen, directional mic, Product Showcase, content-creator', { rating: 4.5, reviews: 1400, mrp: 56990, query: 'vlogging camera' }],
    ['Mi 360° Home Security Camera 2K', 2799, '2K · pan-tilt · night vision', '2K resolution, 360° pan-tilt, infrared night vision, AI motion detection, two-way audio', { rating: 4.3, reviews: 14000, mrp: 3999, query: 'security camera home' }],
    ['TP-Link Tapo C200 Wi-Fi Camera', 1999, '1080p · pan-tilt · night vision', '1080p pan/tilt Wi-Fi camera, night vision, motion detection, two-way audio, microSD', { rating: 4.4, reviews: 26000, mrp: 3499, query: 'wifi security camera' }],
  ]},
  { slug: 'tablets', name: 'Tablets', items: [
    ['Apple iPad 10th Gen (64GB Wi-Fi)', 34900, '10.9" Liquid Retina · A14 · USB-C', '10.9" Liquid Retina, A14 Bionic, 64GB, USB-C, Touch ID, 12MP landscape camera', { featured: true, rating: 4.7, reviews: 4200, mrp: 39900, query: 'ipad tablet' }],
    ['Samsung Galaxy Tab A9+ (8GB/128GB)', 19999, '11" 90Hz · quad speakers', '11" 90Hz display, Snapdragon 695, 8GB/128GB, quad Dolby Atmos speakers, 7040mAh', { rating: 4.4, reviews: 3100, mrp: 24999, query: 'android tablet' }],
    ['Lenovo Tab M11 (8GB/128GB)', 16999, '11" 90Hz · stylus included', '11" 90Hz 2K-ready, MediaTek Helio G88, 8GB/128GB, quad speakers, Tab Pen included', { rating: 4.3, reviews: 1900, mrp: 22999, query: 'tablet stylus' }],
    ['Xiaomi Pad 6 (8GB/128GB)', 26999, '11" 144Hz · Snapdragon 870', '11" 2.8K 144Hz, Snapdragon 870, 8GB/128GB, quad speakers, 8840mAh, 33W', { isNew: true, rating: 4.6, reviews: 5400, mrp: 28999, query: 'tablet device' }],
    ['realme Pad 2 (8GB/128GB)', 14999, '11.5" 120Hz · 8360mAh', '11.5" 2K 120Hz, Helio G99, 8GB/128GB, quad speakers, 8360mAh, 33W charge', { rating: 4.2, reviews: 2700, mrp: 19999, query: 'tablet screen' }],
  ]},
];

// Category rows (order matches CATEGORY_DATA). Pass a sectionId to attach them.
export function buildCategories(sectionId) {
  return CATEGORY_DATA.map((c, i) => ({
    id: randomUUID(),
    name: c.name,
    slug: c.slug,
    section_id: sectionId,
    is_active: true,
    order: i,
  }));
}

// Product rows. catIdBySlug maps category slug -> category id.
export function buildProducts(catIdBySlug, sectionId = null) {
  const products = [];
  for (const cat of CATEGORY_DATA) {
    for (const [name, price, tagline, details, extra = {}] of cat.items) {
      products.push({
        id: randomUUID(),
        name,
        description: `${tagline}. ${details}.`,
        price,
        compare_at_price: extra.mrp ?? Math.round((price * 1.2) / 10) * 10,
        category_id: catIdBySlug[cat.slug],
        section_id: sectionId,
        sku: slugify(name).toUpperCase().replace(/-/g, '_'),
        inventory_quantity: 50,
        min_order_quantity: 1,
        order_multiple: 1,
        is_active: true,
        featured: Boolean(extra.featured),
        slug: slugify(name),
        product_type: cat.slug,
        attributes: {
          tagline,
          rating: extra.rating ?? 4.4,
          reviews: extra.reviews ?? 250,
          weight: 'Standard',
          ingredients: details,                          // shown under "Details"
          allergens: extra.warranty || DEFAULT_WARRANTY,  // shown under "Warranty & returns"
          tags: extra.tags || [cat.name],
          is_new: Boolean(extra.isNew),
          premium_price: premiumFor(price),
          image_query: extra.query || CATEGORY_QUERY[cat.slug] || cat.name,
          seed: SEED_TAG,
          // image is uploaded separately by seed-electronics-images.js
        },
      });
    }
  }
  return products;
}
