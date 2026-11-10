'use strict';

const express = require('express');
const db = require('../db');
const { asyncHandler, json, cleanString } = require('../middleware/helpers');

const router = express.Router();

/* ------------------------------------------------------------------ poojas */
function mapPooja(row) {
  return {
    id: row.id,
    name: row.name,
    hi: row.name_hi || '',
    cat: row.category,
    icon: row.icon || '',
    price: row.price,
    mrp: row.mrp,
    duration: row.duration || '',
    popular: Boolean(row.popular),
    tags: json(row.tags, []),
    desc: row.description || '',
    includes: json(row.includes, []),
    samagri: json(row.samagri, [])
  };
}

router.get('/poojas', asyncHandler(async (req, res) => {
  const where = ['active = 1'];
  const params = {};
  if (req.query.category) {
    where.push('category = :category');
    params.category = cleanString(req.query.category, 120);
  }
  if (req.query.popular === '1') where.push('popular = 1');
  const rows = await db.query(
    `SELECT * FROM poojas WHERE ${where.join(' AND ')} ORDER BY sort_order ASC, name ASC`,
    params
  );
  res.json({ data: rows.map(mapPooja) });
}));

router.get('/poojas/:id', asyncHandler(async (req, res) => {
  const row = await db.one('SELECT * FROM poojas WHERE id = :id AND active = 1', { id: req.params.id });
  if (!row) return res.status(404).json({ error: 'Pooja not found' });
  res.json({ data: mapPooja(row) });
}));

/* ------------------------------------------------------------------ extras */
router.get('/extras', asyncHandler(async (req, res) => {
  const rows = await db.query('SELECT * FROM extras WHERE active = 1 ORDER BY sort_order ASC, name ASC');
  res.json({
    data: rows.map((row) => ({
      id: row.id,
      name: row.name,
      price: row.price,
      icon: row.icon || '',
      note: row.note || ''
    }))
  });
}));

/* ------------------------------------------------------------------- cities */
router.get('/cities', asyncHandler(async (req, res) => {
  const where = ['active = 1'];
  const params = {};
  if (req.query.q) {
    where.push('(name LIKE :q OR state LIKE :q)');
    params.q = `%${cleanString(req.query.q, 120)}%`;
  }
  if (req.query.state) {
    where.push('state = :state');
    params.state = cleanString(req.query.state, 120);
  }
  if (req.query.hot === '1') where.push('hot = 1');
  if (req.query.district === '1') where.push('district = 1');

  const rows = await db.query(
    `SELECT name, state, lat, lon, tz, hot, district
       FROM cities WHERE ${where.join(' AND ')}
      ORDER BY state ASC, name ASC`,
    params
  );
  res.json({
    data: rows.map((row) => ({
      name: row.name,
      state: row.state,
      lat: row.lat === null ? null : Number(row.lat),
      lon: row.lon === null ? null : Number(row.lon),
      tz: row.tz,
      hot: Boolean(row.hot),
      district: Boolean(row.district)
    }))
  });
}));

/* ------------------------------------------------------------------ pandits */
function mapPandit(row) {
  return {
    id: row.id,
    name: row.name,
    title: row.title || '',
    area: row.area || '',
    exp: row.experience_years,
    rating: Number(row.rating),
    reviews: row.reviews,
    langs: json(row.languages, []),
    tradition: row.tradition || '',
    spec: json(row.specialities, []),
    price: row.base_price,
    verified: Boolean(row.verified),
    color: row.color || '',
    bio: row.bio || ''
  };
}

router.get('/pandits', asyncHandler(async (req, res) => {
  const where = ['active = 1'];
  const params = {};
  if (req.query.tradition) {
    where.push('tradition = :tradition');
    params.tradition = cleanString(req.query.tradition, 120);
  }
  if (req.query.language) {
    where.push('JSON_CONTAINS(languages, JSON_QUOTE(:language))');
    params.language = cleanString(req.query.language, 60);
  }
  if (req.query.speciality) {
    where.push('JSON_CONTAINS(specialities, JSON_QUOTE(:speciality))');
    params.speciality = cleanString(req.query.speciality, 120);
  }
  const rows = await db.query(
    `SELECT * FROM pandits WHERE ${where.join(' AND ')} ORDER BY rating DESC, reviews DESC`,
    params
  );
  res.json({ data: rows.map(mapPandit) });
}));

/* ----------------------------------------------------------------- products */
function mapProduct(row) {
  return {
    id: row.id,
    name: row.name,
    cat: row.category,
    price: row.price,
    mrp: row.mrp,
    icon: row.icon || '',
    desc: row.description || ''
  };
}

router.get('/products', asyncHandler(async (req, res) => {
  const where = ['active = 1'];
  const params = {};
  if (req.query.category) {
    where.push('category = :category');
    params.category = cleanString(req.query.category, 120);
  }
  const rows = await db.query(
    `SELECT * FROM products WHERE ${where.join(' AND ')} ORDER BY sort_order ASC, name ASC`,
    params
  );
  res.json({ data: rows.map(mapProduct) });
}));

/* ----------------------------------------------------------------- settings */
router.get('/settings', asyncHandler(async (req, res) => {
  const rows = await db.query('SELECT setting_key, value FROM site_settings ORDER BY setting_key ASC');
  const data = {};
  rows.forEach((row) => { data[row.setting_key] = json(row.value, null); });
  res.json({ data });
}));

module.exports = router;
