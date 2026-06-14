// Shared electronics catalog definition used by both seeders:
//   • seed-electronics.js     — writes straight to the DB (Sequelize)
//   • seed-electronics-api.js — writes through the live HTTP API
//
// Keep product data here so the two seeders never drift apart.

import { randomUUID } from 'crypto';

export const SECTION_NAME = 'Electronics Store';
export const SEED_TAG = 'electronics';
export const DEFAULT_WARRANTY = '1-year manufacturer warranty · 7-day replacement · 30-day returns';
export const APPLIANCE_WARRANTY = '2-year comprehensive warranty (extended on compressor/panel) · easy returns';

// Premium offer price strictly from the price band.
export function premiumFor(price) {
  if (price <= 999)   return 99;
  if (price <= 2999)  return 199;
  if (price <= 7999)  return 299;
  if (price <= 24999) return 499;
  return 999;
}

export const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// Each item: [name, price, tagline, details, extra?]
// extra (optional): { featured, isNew, rating, reviews, warranty, mrp, tags }
export const CATEGORY_DATA = [
  { slug: 'airpods', name: 'AirPods & TWS', items: [
    ['TWS Pro Earbuds (ANC)', 2499, 'Active noise cancellation · 30h playback', 'Bluetooth 5.3, hybrid ANC, IPX5, USB-C, 30h total with case', { featured: true, rating: 4.6, reviews: 1280 }],
    ['TWS Lite Earbuds', 999, 'Half-in-ear · 24h playback', 'Bluetooth 5.3, ENC calls, touch controls, 24h total with case', { rating: 4.3, reviews: 540 }],
    ['TWS Bass Buds', 1499, 'Punchy bass · low-latency game mode', 'Bluetooth 5.3, 13mm drivers, 40ms game mode, IPX4', { isNew: true, rating: 4.4, reviews: 410 }],
    ['TWS Sport Buds', 1799, 'Secure ear-hooks for workouts', 'Bluetooth 5.3, ear-hook fit, IP55 sweatproof, 28h total', { rating: 4.5, reviews: 320 }],
    ['TWS Pro Max (Spatial)', 3499, 'Spatial audio · adaptive ANC', 'Bluetooth 5.3, adaptive ANC, spatial audio, wireless charging case', { featured: true, rating: 4.7, reviews: 760 }],
  ]},
  { slug: 'mobiles', name: 'Mobile Phones', items: [
    ['5G Smartphone 6.7" 128GB', 16999, '120Hz AMOLED · 50MP camera', '6.7" 120Hz AMOLED, 5G, 8GB+128GB, 5000mAh, 50MP OIS camera', { featured: true, rating: 4.5, reviews: 2100 }],
    ['Budget Smartphone 64GB', 8999, 'Big battery · clean software', '6.5" 90Hz LCD, 4GB+64GB, 6000mAh, 50MP dual camera', { rating: 4.2, reviews: 1540 }],
    ['Flagship Smartphone 256GB', 64999, 'Pro-grade cameras · titanium frame', '6.8" LTPO AMOLED, 12GB+256GB, 100x zoom, IP68', { isNew: true, rating: 4.8, reviews: 980 }],
    ['Mid-range 5G 128GB', 21999, 'Curved AMOLED · 67W fast charge', '6.7" curved AMOLED, 8GB+128GB, 67W charging, 5000mAh', { rating: 4.4, reviews: 720 }],
    ['Compact Smartphone 128GB', 12999, 'One-hand friendly · stock Android', '6.1" 90Hz, 6GB+128GB, 4500mAh, 50MP camera', { rating: 4.3, reviews: 610 }],
  ]},
  { slug: 'chargers', name: 'Chargers & Cables', items: [
    ['65W GaN Charger (Dual-C)', 999, 'Charge laptop & phone together', 'GaN, 2× USB-C + 1× USB-A, 65W, foldable pins', { featured: true, rating: 4.7, reviews: 410 }],
    ['33W Fast Charger', 599, 'Quick-charge any phone', 'Single USB-A, 33W, multi-protocol, surge protection', { rating: 4.4, reviews: 880 }],
    ['100W USB-C Cable (1.5m)', 399, 'Braided · 100W PD + data', 'Nylon-braided USB-C to C, 100W PD, 480Mbps, 1.5m', { rating: 4.5, reviews: 1230 }],
    ['Wireless Charging Pad 15W', 899, 'Qi fast wireless charging', '15W Qi, case-friendly, anti-slip, LED indicator', { isNew: true, rating: 4.3, reviews: 360 }],
    ['Car Charger 45W', 699, 'Dual-port fast car charging', '45W PD + QC, dual port, alloy body, 12-24V', { rating: 4.4, reviews: 540 }],
  ]},
  { slug: 'powerbanks', name: 'Power Banks', items: [
    ['20000mAh Power Bank 22.5W', 1599, 'Charge phone 4× · fast output', '20000mAh, 22.5W, dual output + USB-C in/out, LED meter', { featured: true, rating: 4.5, reviews: 1670 }],
    ['10000mAh Slim Power Bank', 999, 'Pocket-size · 18W PD', '10000mAh, 18W PD, USB-C, slim metal body', { rating: 4.4, reviews: 920 }],
    ['10000mAh Magnetic (Wireless)', 1999, 'Snaps on · wireless + USB-C', '10000mAh, 15W magnetic wireless + 20W USB-C', { isNew: true, rating: 4.3, reviews: 410 }],
    ['30000mAh Power Bank 65W', 3299, 'Laptop-capable · 65W PD', '30000mAh, 65W PD, triple output, digital display', { rating: 4.6, reviews: 380 }],
    ['Mini 5000mAh Power Bank', 699, 'Ultra-compact backup', '5000mAh, 12W, built-in cable, keychain size', { rating: 4.2, reviews: 600 }],
  ]},
  { slug: 'earphones', name: 'Earphones & Headphones', items: [
    ['Wired Earphones (USB-C)', 299, 'Crisp sound · in-line mic', 'USB-C DAC, 10mm driver, in-line controls, tangle-free', { rating: 4.2, reviews: 1450 }],
    ['Neckband Bluetooth Earphones', 999, 'Magnetic buds · 30h battery', 'Bluetooth 5.3, magnetic buds, 30h, IPX5, fast charge', { featured: true, rating: 4.4, reviews: 2100 }],
    ['Over-Ear ANC Headphones', 3999, 'Deep bass · 40h ANC', 'Bluetooth 5.3, ANC, 40mm drivers, 40h, foldable', { featured: true, rating: 4.6, reviews: 870 }],
    ['Wired Headphones (3.5mm)', 799, 'Studio-style comfort', '40mm drivers, padded cushions, 1.2m cable, mic', { rating: 4.3, reviews: 520 }],
    ['Gaming Headset (RGB)', 1799, '7.1 surround · boom mic', 'USB 7.1 surround, RGB, detachable boom mic, 50mm', { isNew: true, rating: 4.5, reviews: 640 }],
  ]},
  { slug: 'wireless', name: 'Wireless Devices', items: [
    ['Wi-Fi 6 Router AX1800', 2999, 'Dual-band · whole-home coverage', 'Wi-Fi 6, AX1800, 4 antennas, OFDMA, gigabit ports', { featured: true, rating: 4.5, reviews: 730 }],
    ['Mesh Wi-Fi System (2-pack)', 5999, 'Seamless coverage up to 4000 sq ft', 'AX3000 mesh, 2 nodes, app setup, backhaul', { rating: 4.6, reviews: 410 }],
    ['Bluetooth Audio Receiver', 699, 'Make any speaker wireless', 'Bluetooth 5.3, aux/RCA out, aptX, 10h battery', { rating: 4.2, reviews: 360 }],
    ['Wireless Presenter Remote', 899, 'Laser pointer · USB receiver', '2.4GHz, 30m range, laser pointer, plug-and-play', { rating: 4.3, reviews: 240 }],
    ['4G Wi-Fi Hotspot Device', 2499, 'Portable internet on the go', '4G LTE, 150Mbps, 10 devices, 3000mAh battery', { isNew: true, rating: 4.1, reviews: 290 }],
  ]},
  { slug: 'tv', name: 'Televisions', items: [
    ['43" 4K Smart TV', 24999, '4K HDR · built-in apps', '43" 4K UHD, HDR10, smart OS, 20W, voice remote', { featured: true, rating: 4.4, reviews: 1320, warranty: APPLIANCE_WARRANTY }],
    ['32" HD Smart TV', 12999, 'Compact smart TV for bedrooms', '32" HD Ready, smart OS, dual-band Wi-Fi, 20W', { rating: 4.3, reviews: 980, warranty: APPLIANCE_WARRANTY }],
    ['55" 4K QLED TV', 42999, 'Quantum dot · Dolby Vision', '55" QLED 4K, Dolby Vision + Atmos, 60W, far-field mic', { isNew: true, rating: 4.7, reviews: 540, warranty: APPLIANCE_WARRANTY }],
    ['50" 4K Smart TV', 31999, 'Big-screen 4K entertainment', '50" 4K UHD, HDR10+, smart OS, bezel-less', { rating: 4.5, reviews: 610, warranty: APPLIANCE_WARRANTY }],
    ['65" 4K OLED TV', 119999, 'Infinite contrast · 120Hz', '65" OLED 4K, 120Hz, Dolby Vision IQ, gaming mode', { featured: true, rating: 4.8, reviews: 230, warranty: APPLIANCE_WARRANTY }],
  ]},
  { slug: 'washing-machines', name: 'Washing Machines', items: [
    ['7kg Fully-Automatic Top Load', 16999, 'Gentle wash · 700 RPM spin', '7kg top load, 700 RPM, 8 programs, hard-water wash', { featured: true, rating: 4.4, reviews: 870, warranty: APPLIANCE_WARRANTY }],
    ['6.5kg Semi-Automatic', 10999, 'Budget-friendly twin tub', '6.5kg semi-auto, twin tub, rust-proof body', { rating: 4.2, reviews: 1240, warranty: APPLIANCE_WARRANTY }],
    ['8kg Front Load Inverter', 28999, 'Inverter motor · 1200 RPM', '8kg front load, inverter, 1200 RPM, steam wash', { isNew: true, rating: 4.6, reviews: 520, warranty: APPLIANCE_WARRANTY }],
    ['9kg Fully-Automatic Top Load', 21999, 'Large family capacity', '9kg top load, 740 RPM, auto-restart, 12 programs', { rating: 4.5, reviews: 410, warranty: APPLIANCE_WARRANTY }],
    ['7kg Front Load Washer Dryer', 36999, 'Wash + dry in one', '7kg wash / 5kg dry, inverter, 1400 RPM, steam', { rating: 4.6, reviews: 280, warranty: APPLIANCE_WARRANTY }],
  ]},
  { slug: 'fridges', name: 'Refrigerators', items: [
    ['190L Single Door Fridge', 13999, 'Compact · direct cool', '190L single door, direct cool, 4-star, toughened shelves', { featured: true, rating: 4.4, reviews: 1130, warranty: APPLIANCE_WARRANTY }],
    ['253L Double Door Frost-Free', 22999, 'Frost-free · convertible', '253L double door, frost-free, inverter, convertible', { rating: 4.5, reviews: 760, warranty: APPLIANCE_WARRANTY }],
    ['564L Side-by-Side Fridge', 54999, 'Spacious · water dispenser', '564L side-by-side, inverter, water dispenser, Wi-Fi', { isNew: true, rating: 4.7, reviews: 320, warranty: APPLIANCE_WARRANTY }],
    ['350L Triple Door Fridge', 33999, 'Separate veg zone', '350L triple door, frost-free, convertible, inverter', { rating: 4.6, reviews: 410, warranty: APPLIANCE_WARRANTY }],
    ['90L Mini Bar Fridge', 8999, 'Perfect for rooms & offices', '90L single door, mechanical cooling, reversible door', { rating: 4.2, reviews: 540, warranty: APPLIANCE_WARRANTY }],
  ]},
  { slug: 'mixers', name: 'Mixers & Grinders', items: [
    ['Mixer Grinder 750W (3 Jars)', 2999, 'Powerful 750W copper motor', '750W, 3 stainless jars, overload protection, 5-yr motor', { featured: true, rating: 4.4, reviews: 1620 }],
    ['Hand Blender 400W', 999, 'Blend, whisk & chop', '400W, detachable shaft, whisk + chopper attachments', { rating: 4.3, reviews: 980 }],
    ['Mixer Grinder 500W (2 Jars)', 1999, 'Compact daily grinder', '500W, 2 jars, 3 speeds, vacuum feet', { rating: 4.2, reviews: 760 }],
    ['Wet Grinder 2L', 4499, 'Stone grinding for batter', '2L table-top wet grinder, conical stones, 150W', { isNew: true, rating: 4.5, reviews: 340 }],
    ['Juicer Mixer Grinder 1000W', 3999, 'Juice, grind & blend', '1000W, juicer + 3 jars, anti-drip, steel blades', { rating: 4.5, reviews: 420 }],
  ]},
  { slug: 'ac', name: 'Air Conditioners', items: [
    ['1.5 Ton 3-Star Inverter Split AC', 32999, 'Fast cooling · low noise', '1.5 ton, 3-star inverter, copper coil, anti-bacteria filter', { featured: true, rating: 4.4, reviews: 910, warranty: APPLIANCE_WARRANTY }],
    ['1 Ton 3-Star Split AC', 27999, 'Right-size for small rooms', '1 ton, 3-star inverter, copper, turbo cool', { rating: 4.3, reviews: 640, warranty: APPLIANCE_WARRANTY }],
    ['1.5 Ton 5-Star Inverter Split AC', 41999, 'Energy-saving 5-star', '1.5 ton, 5-star inverter, copper, 4-way swing, Wi-Fi', { isNew: true, rating: 4.7, reviews: 480, warranty: APPLIANCE_WARRANTY }],
    ['2 Ton 3-Star Split AC', 44999, 'For large living rooms', '2 ton, 3-star inverter, copper, dust filter', { rating: 4.5, reviews: 360, warranty: APPLIANCE_WARRANTY }],
    ['1.5 Ton Window AC 3-Star', 28999, 'Simple install · strong cooling', '1.5 ton window AC, 3-star, copper, anti-corrosive', { rating: 4.2, reviews: 410, warranty: APPLIANCE_WARRANTY }],
  ]},
  { slug: 'laptops', name: 'Laptops', items: [
    ['14" Laptop i5 16GB 512GB', 54999, 'Thin & light · all-day battery', '14" FHD, Core i5, 16GB RAM, 512GB SSD, backlit keys', { featured: true, rating: 4.5, reviews: 870 }],
    ['15.6" Laptop i3 8GB 256GB', 32999, 'Everyday productivity', '15.6" FHD, Core i3, 8GB, 256GB SSD, Wi-Fi 6', { rating: 4.2, reviews: 1240 }],
    ['Gaming Laptop RTX 16GB', 89999, '144Hz · RTX graphics', '15.6" 144Hz, Ryzen 7, 16GB, 1TB SSD, RTX GPU', { isNew: true, rating: 4.7, reviews: 520 }],
    ['Thin Ultrabook i7 16GB', 74999, 'Premium metal · OLED', '14" OLED, Core i7, 16GB, 1TB SSD, fingerprint', { rating: 4.6, reviews: 410 }],
    ['2-in-1 Touch Laptop 8GB', 47999, 'Flip & touch · stylus support', '13.3" FHD touch, 360° hinge, 8GB, 512GB SSD', { rating: 4.4, reviews: 360 }],
  ]},
  { slug: 'accessories', name: 'Mobile Accessories', items: [
    ['Tempered Glass Screen Guard', 199, '9H hardness · case-friendly', '9H tempered glass, oleophobic, bubble-free, 2-pack', { rating: 4.3, reviews: 3200 }],
    ['Shockproof Back Cover', 299, 'Military-grade drop protection', 'TPU + PC bumper, raised lips, anti-yellow', { rating: 4.4, reviews: 2100 }],
    ['Phone Ring Holder Stand', 199, 'Grip + kickstand in one', '360° ring, foldable kickstand, strong adhesive', { rating: 4.2, reviews: 980 }],
    ['Universal Phone Tripod', 799, 'Flexible legs · BT remote', 'Flexible tripod, phone clamp, Bluetooth shutter', { isNew: true, rating: 4.4, reviews: 540 }],
    ['Car Phone Mount (Magnetic)', 499, 'Strong magnets · one-hand use', 'Magnetic dashboard/vent mount, 360° rotation', { rating: 4.3, reviews: 760 }],
  ]},
  { slug: 'gaming', name: 'Gaming', items: [
    ['Wireless Gaming Controller', 2499, 'Low-latency · dual vibration', 'Bluetooth + 2.4GHz, dual vibration, turbo, 20h', { featured: true, rating: 4.5, reviews: 1230 }],
    ['Mechanical Gaming Keyboard', 2999, 'Hot-swap · RGB switches', 'Hot-swap blue switches, full RGB, N-key rollover', { rating: 4.6, reviews: 870 }],
    ['Gaming Mouse 16000 DPI', 1499, 'Lightweight · 8 buttons', '16000 DPI optical, 8 programmable buttons, RGB', { rating: 4.5, reviews: 940 }],
    ['Handheld Retro Game Console', 3999, '10000+ games · 5" screen', '5" IPS, 10000+ games, HDMI out, dual controllers', { isNew: true, rating: 4.3, reviews: 410 }],
    ['Gaming Mouse Pad XXL (RGB)', 999, 'Full-desk · RGB edges', 'XXL 800×300mm, RGB edge, anti-slip base, stitched', { rating: 4.4, reviews: 660 }],
  ]},
  { slug: 'printers', name: 'Printers', items: [
    ['Ink Tank Color Printer', 13999, 'Low-cost printing · 3-in-1', 'Print/scan/copy, refillable ink tank, Wi-Fi, ADF', { featured: true, rating: 4.4, reviews: 720 }],
    ['Mono Laser Printer', 9999, 'Fast crisp text · low cost/page', 'Mono laser, 22 ppm, USB + Wi-Fi, toner save', { rating: 4.3, reviews: 540 }],
    ['All-in-One Laser (Color)', 22999, 'Print, scan, copy in color', 'Color laser MFP, 18 ppm, duplex, network', { isNew: true, rating: 4.5, reviews: 280 }],
    ['Portable Photo Printer', 6999, 'Pocket prints from phone', 'Bluetooth, ZINK zero-ink, 2×3" sticky photos', { rating: 4.2, reviews: 360 }],
    ['Inkjet Printer (Wi-Fi)', 5499, 'Home printing essentials', 'Inkjet 3-in-1, Wi-Fi, mobile print, borderless photo', { rating: 4.1, reviews: 480 }],
  ]},
  { slug: 'soundbars', name: 'Sound Bars & Speakers', items: [
    ['2.1 Sound Bar with Subwoofer', 6999, 'Cinematic bass · Bluetooth', '120W 2.1, wireless subwoofer, HDMI ARC, optical', { featured: true, rating: 4.5, reviews: 980 }],
    ['Bluetooth Party Speaker', 4999, 'Loud · RGB lights · mic-in', '60W, RGB lights, TWS pairing, mic + guitar in', { rating: 4.4, reviews: 720 }],
    ['Portable Bluetooth Speaker', 1499, 'IPX7 waterproof · 24h', '20W, IPX7, 24h battery, TWS, USB-C', { rating: 4.5, reviews: 1640 }],
    ['Soundbar 5.1 Dolby', 18999, 'True surround · Dolby Atmos', '5.1ch, Dolby Atmos, wireless rears + sub, HDMI eARC', { isNew: true, rating: 4.7, reviews: 310 }],
    ['Smart Speaker with Assistant', 3499, 'Voice control · room-filling', 'Voice assistant, 360° sound, multi-room, Wi-Fi + BT', { rating: 4.3, reviews: 560 }],
  ]},
  { slug: 'watches', name: 'Smart Watches', items: [
    ['Smart Watch 1.9" AMOLED', 2499, 'BT calling · 100+ sport modes', '1.9" AMOLED, BT calling, SpO2, 100+ sports, 7-day', { featured: true, rating: 4.4, reviews: 2300 }],
    ['Fitness Band (AMOLED)', 1799, 'Heart-rate, SpO2 & sleep', '1.1" AMOLED, HR + SpO2, 14 modes, 5ATM, 10-day', { rating: 4.4, reviews: 1280 }],
    ['Rugged Outdoor Smart Watch', 3999, 'Military-grade · GPS', '1.43" AMOLED, GPS, compass, 100m water, rugged', { isNew: true, rating: 4.5, reviews: 540 }],
    ['Kids Smart Watch (4G GPS)', 2999, 'Calls + live location', '4G video call, GPS tracking, SOS, geo-fence', { rating: 4.2, reviews: 410 }],
    ['Premium AMOLED Smart Watch', 5999, 'Metal body · ECG sensor', '1.43" AMOLED, ECG, stainless body, 60Hz, AOD', { rating: 4.6, reviews: 380 }],
  ]},
  { slug: 'storage', name: 'Storage & Drives', items: [
    ['64GB USB 3.0 Pendrive', 499, 'Fast transfers · metal body', '64GB, USB 3.0, up to 120MB/s read, keyring', { rating: 4.4, reviews: 2600 }],
    ['128GB microSD Card (A2)', 999, 'For phones, cams & consoles', '128GB, A2 U3 V30, up to 170MB/s, 4K ready', { featured: true, rating: 4.5, reviews: 1840 }],
    ['1TB Portable SSD (USB-C)', 6999, 'Pocket SSD · 1050MB/s', '1TB, USB 3.2 Gen2, up to 1050MB/s, shock-resistant', { isNew: true, rating: 4.7, reviews: 620 }],
    ['2TB External Hard Drive', 5499, 'Massive backup storage', '2TB, USB 3.0, plug-and-play, password protection', { rating: 4.4, reviews: 980 }],
    ['256GB Internal NVMe SSD', 2499, 'Speed up your PC/laptop', 'M.2 NVMe Gen3, 256GB, up to 2400MB/s', { rating: 4.5, reviews: 540 }],
  ]},
  { slug: 'trimmers', name: 'Trimmers & Grooming', items: [
    ['Cordless Beard Trimmer', 1499, '40 lengths · 90-min runtime', 'Stainless blades, 40 settings, USB, 90-min, washable', { featured: true, rating: 4.5, reviews: 1540 }],
    ['Body Groomer Kit', 1999, 'Full-body · multi-attachments', 'Waterproof, 4 combs + nose trimmer, 60-min', { rating: 4.3, reviews: 620 }],
    ['Hair Clipper (Pro)', 2499, 'Salon-grade fade clipper', 'Titanium blade, taper lever, 120-min, low-noise', { isNew: true, rating: 4.5, reviews: 410 }],
    ['Nose & Ear Trimmer', 699, 'Painless · washable head', 'Dual-edge, waterproof head, AA powered, LED', { rating: 4.2, reviews: 880 }],
    ['Ladies Epilator & Shaver', 2299, '2-in-1 grooming · cordless', 'Epilator + shaver heads, wet/dry, 60-min, LED', { rating: 4.4, reviews: 360 }],
  ]},
  { slug: 'keyboard-mouse', name: 'Keyboards & Mice', items: [
    ['Wireless Keyboard + Mouse Combo', 1299, 'Silent keys · plug-and-play', '2.4GHz combo, silent keys, 12 media keys, 18-mo battery', { featured: true, rating: 4.4, reviews: 1620 }],
    ['Wireless Mouse (Silent)', 599, 'Ergonomic · 1600 DPI', '2.4GHz, silent click, 1600 DPI, 12-mo battery', { rating: 4.5, reviews: 2400 }],
    ['Mechanical Keyboard (TKL)', 2499, 'Tactile · white backlight', 'TKL, blue switches, white LED, anti-ghosting', { rating: 4.5, reviews: 740 }],
    ['Bluetooth Multi-Device Keyboard', 1799, 'Switch across 3 devices', 'BT + 2.4GHz, 3-device switch, scissor keys, rechargeable', { isNew: true, rating: 4.4, reviews: 420 }],
    ['Vertical Ergonomic Mouse', 1199, 'Reduce wrist strain', 'Vertical design, 2400 DPI, rechargeable, silent', { rating: 4.3, reviews: 380 }],
  ]},
  { slug: 'cameras', name: 'Cameras', items: [
    ['Action Camera 4K (Waterproof)', 6999, '4K60 · stabilized · waterproof', '4K60, EIS stabilization, waterproof case, accessories', { featured: true, rating: 4.4, reviews: 870 }],
    ['1080p Security Wi-Fi Camera', 1799, 'Pan-tilt · night vision', '1080p, pan-tilt 360°, night vision, motion alerts, 2-way', { rating: 4.3, reviews: 1340 }],
    ['Mirrorless Camera (24MP) Kit', 54999, 'Interchangeable lens · 4K', '24MP APS-C, 4K video, 15-45mm kit lens, Wi-Fi', { isNew: true, rating: 4.7, reviews: 320 }],
    ['Vlogging Camera (Flip Screen)', 22999, 'Flip screen · stereo mic', '20MP, flip screen, 4K30, stereo mic, content-creator kit', { rating: 4.5, reviews: 410 }],
    ['Outdoor Solar CCTV Camera', 4999, 'Wire-free · solar powered', '2K, solar panel, PIR alerts, color night vision, SD + cloud', { rating: 4.2, reviews: 560 }],
  ]},
  { slug: 'tablets', name: 'Tablets', items: [
    ['10.1" Tablet 4GB 64GB', 12999, 'Big screen · long battery', '10.1" FHD, 4GB+64GB, 6000mAh, dual speakers, Wi-Fi', { featured: true, rating: 4.3, reviews: 980 }],
    ['8" Compact Tablet 3GB 32GB', 8999, 'Portable · calling support', '8" HD, 3GB+32GB, 4G calling, 5100mAh', { rating: 4.2, reviews: 760 }],
    ['11" Tablet 8GB 128GB (120Hz)', 23999, 'Smooth 120Hz · stylus support', '11" 120Hz 2K, 8GB+128GB, quad speakers, stylus support', { isNew: true, rating: 4.6, reviews: 420 }],
    ['Premium 12.6" AMOLED Tablet', 47999, 'AMOLED · keyboard ready', '12.6" AMOLED, 8GB+256GB, 10000mAh, keyboard + pen ready', { rating: 4.7, reviews: 260 }],
    ['Kids Tablet 7" (with Case)', 6999, 'Parental controls · shockproof', '7" HD, 2GB+32GB, kids mode, shockproof case', { rating: 4.1, reviews: 540 }],
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
          seed: SEED_TAG,
          // no `image` key → storefront shows the "Image coming soon" placeholder
        },
      });
    }
  }
  return products;
}
