'use strict';

const path = require('path');
const bcrypt = require('bcryptjs');
const db = require('../src/db');
const config = require('../src/config');

// The site data file is a plain browser script; in Node it attaches to globalThis.
require(path.join(__dirname, '..', '..', 'assets', 'js', 'data.js'));
const DATA = globalThis.PanditData;

if (!DATA) {
  console.error('[seed] could not read assets/js/data.js');
  process.exit(1);
}

function chunks(list, size) {
  const out = [];
  for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size));
  return out;
}

async function seedCities() {
  const rows = (DATA.CITIES || []).map((city) => [
    city.name,
    city.state,
    city.lat ?? null,
    city.lon ?? null,
    city.tz || 'Asia/Kolkata',
    city.hot ? 1 : 0,
    city.district ? 1 : 0
  ]);

  for (const batch of chunks(rows, 400)) {
    await db.query(
      `INSERT INTO cities (name, state, lat, lon, tz, hot, district) VALUES ?
       ON DUPLICATE KEY UPDATE
         state = VALUES(state), lat = VALUES(lat), lon = VALUES(lon),
         tz = VALUES(tz), hot = VALUES(hot), district = VALUES(district)`,
      [batch]
    );
  }
  console.log(`[seed] cities: ${rows.length}`);
}

async function seedPoojas() {
  const rows = (DATA.POOJAS || []).map((pooja, index) => [
    pooja.id,
    pooja.name,
    pooja.hi || null,
    pooja.cat,
    pooja.icon || null,
    pooja.price || 0,
    pooja.mrp || 0,
    pooja.duration || null,
    pooja.popular ? 1 : 0,
    JSON.stringify(pooja.tags || []),
    pooja.desc || null,
    JSON.stringify(pooja.includes || []),
    JSON.stringify(pooja.samagri || []),
    index
  ]);

  for (const batch of chunks(rows, 200)) {
    await db.query(
      `INSERT INTO poojas
        (id, name, name_hi, category, icon, price, mrp, duration, popular, tags,
         description, includes, samagri, sort_order)
       VALUES ?
       ON DUPLICATE KEY UPDATE
         name = VALUES(name), name_hi = VALUES(name_hi), category = VALUES(category),
         icon = VALUES(icon), price = VALUES(price), mrp = VALUES(mrp),
         duration = VALUES(duration), popular = VALUES(popular), tags = VALUES(tags),
         description = VALUES(description), includes = VALUES(includes),
         samagri = VALUES(samagri), sort_order = VALUES(sort_order)`,
      [batch]
    );
  }
  console.log(`[seed] poojas: ${rows.length}`);
}

async function seedExtras() {
  const rows = (DATA.EXTRAS || []).map((extra, index) => [
    extra.id,
    extra.name,
    extra.price || 0,
    extra.icon || null,
    extra.note || null,
    index
  ]);

  for (const batch of chunks(rows, 200)) {
    await db.query(
      `INSERT INTO extras (id, name, price, icon, note, sort_order) VALUES ?
       ON DUPLICATE KEY UPDATE
         name = VALUES(name), price = VALUES(price), icon = VALUES(icon),
         note = VALUES(note), sort_order = VALUES(sort_order)`,
      [batch]
    );
  }
  console.log(`[seed] extras: ${rows.length}`);
}

async function seedPandits() {
  const rows = (DATA.PANDITS || []).map((pandit) => [
    pandit.id,
    pandit.name,
    pandit.title || null,
    pandit.area || null,
    pandit.exp || 0,
    pandit.rating || 0,
    pandit.reviews || 0,
    JSON.stringify(pandit.langs || []),
    pandit.tradition || null,
    JSON.stringify(pandit.spec || []),
    pandit.price || 0,
    pandit.verified ? 1 : 0,
    pandit.color || null,
    pandit.bio || null
  ]);

  for (const batch of chunks(rows, 200)) {
    await db.query(
      `INSERT INTO pandits
        (id, name, title, area, experience_years, rating, reviews, languages,
         tradition, specialities, base_price, verified, color, bio)
       VALUES ?
       ON DUPLICATE KEY UPDATE
         name = VALUES(name), title = VALUES(title), area = VALUES(area),
         experience_years = VALUES(experience_years), rating = VALUES(rating),
         reviews = VALUES(reviews), languages = VALUES(languages),
         tradition = VALUES(tradition), specialities = VALUES(specialities),
         base_price = VALUES(base_price), verified = VALUES(verified),
         color = VALUES(color), bio = VALUES(bio)`,
      [batch]
    );
  }
  console.log(`[seed] pandits: ${rows.length}`);
}

async function seedProducts() {
  const rows = (DATA.PRODUCTS || []).map((product, index) => [
    product.id,
    product.name,
    product.cat,
    product.price || 0,
    product.mrp || 0,
    product.icon || null,
    product.desc || null,
    index
  ]);

  for (const batch of chunks(rows, 200)) {
    await db.query(
      `INSERT INTO products
        (id, name, category, price, mrp, icon, description, sort_order)
       VALUES ?
       ON DUPLICATE KEY UPDATE
         name = VALUES(name), category = VALUES(category), price = VALUES(price),
         mrp = VALUES(mrp), icon = VALUES(icon), description = VALUES(description),
         sort_order = VALUES(sort_order)`,
      [batch]
    );
  }
  console.log(`[seed] products: ${rows.length}`);
}

async function seedAdmin() {
  // One dashboard admin is enough. If the owner already changed the email or
  // password from Account settings, don't create a second account on re-seed.
  const existing = await db.one('SELECT id FROM admins ORDER BY id LIMIT 1');
  if (existing) {
    console.log('[seed] admin already exists, keeping current credentials');
    return;
  }

  const passwordHash = await bcrypt.hash(config.admin.password, 10);
  await db.query(
    `INSERT INTO admins (email, password_hash, name, role)
     VALUES (:email, :passwordHash, :name, 'admin')`,
    { email: config.admin.email, passwordHash, name: config.admin.name }
  );
  console.log(`[seed] admin created: ${config.admin.email} (change the password!)`);
}

async function seedSettings() {
  const settings = {
    owner: {
      name: 'Rajiv Lochan Mishra',
      phone: '918889685370',
      phoneDisplay: '+91 88896 85370',
      email: 'rajivlochanmishra952@gmail.com',
      upi: 'rajivlochanmishra952-1@okhdfcbank',
      upiName: 'Rajiv Lochan Mishra',
      city: 'Gurugram',
      region: 'Haryana'
    },
    site: {
      name: 'Satyanarayan Puja',
      tagline: 'A complete household puja guide',
      guidePath: 'puja-guide.html'
    },
    seva: {
      heading: 'Seva & dakshina',
      note: 'The puja guide is free. If you wish to offer seva or dakshina, use only the details below.',
      disclaimer: 'Never pay anyone who claims to represent this site but uses a different name, UPI ID or number.'
    }
  };

  for (const [key, value] of Object.entries(settings)) {
    await db.query(
      `INSERT IGNORE INTO site_settings (setting_key, value) VALUES (:key, :value)`,
      { key, value: JSON.stringify(value) }
    );
  }
  console.log(`[seed] settings: ${Object.keys(settings).join(', ')}`);
}

async function main() {
  await db.ping();
  await seedCities();
  await seedPoojas();
  await seedExtras();
  await seedPandits();
  await seedProducts();
  await seedAdmin();
  await seedSettings();
  console.log('[seed] done');
}

main()
  .catch((err) => {
    console.error('[seed] failed:', err.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.pool.end().catch(() => {});
  });
