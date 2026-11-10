'use strict';

const crypto = require('crypto');
const express = require('express');
const db = require('../db');
const { asyncHandler, cleanString, toInt, safeDate } = require('../middleware/helpers');
const { optionalUser } = require('../middleware/auth');
const rateLimit = require('../middleware/rate-limit');

const router = express.Router();
const writeLimit = rateLimit({ windowMs: 60_000, max: 20 });
const ID_RE = /^[A-Za-z0-9_-]{3,32}$/;

function makeId(prefix) {
  return prefix + '-' + crypto.randomBytes(4).toString('hex').toUpperCase();
}

function clientId(value) {
  const id = cleanString(value, 32);
  return id && ID_RE.test(id) ? id : null;
}

/* -------------------------------------------------- pandit join application */
router.post('/applications', writeLimit, asyncHandler(async (req, res) => {
  const body = req.body || {};
  const name = cleanString(body.name, 190);
  const phone = cleanString(body.phone, 40);
  const city = cleanString(body.city, 120);
  if (!name || !phone || !city) {
    return res.status(400).json({ error: 'name, phone and city are required' });
  }

  const id = clientId(body.id);
  if (body.id && !id) return res.status(400).json({ error: 'Invalid application id' });
  const applicationId = id || makeId('PA');
  await db.query(
    `INSERT INTO pandit_applications (id, name, phone, city, experience, tradition, note, created_at)
     VALUES (:id, :name, :phone, :city, :experience, :tradition, :note, :createdAt)`,
    {
      id: applicationId,
      name,
      phone,
      city,
      experience: cleanString(body.experience, 60),
      tradition: cleanString(body.tradition, 120),
      note: cleanString(body.note, 4000),
      createdAt: safeDate(body.date)
    }
  );

  res.status(201).json({ data: { id: applicationId, status: 'new' } });
}));

/* ------------------------------------------------------------ shop order */
router.post('/orders', writeLimit, optionalUser, asyncHandler(async (req, res) => {
  const body = req.body || {};
  const name = cleanString(body.name || body.customerName, 190);
  const phone = cleanString(body.phone, 40);
  if (!name || !phone) return res.status(400).json({ error: 'name and phone are required' });

  const requested = Array.isArray(body.items) ? body.items : [];
  if (!requested.length) return res.status(400).json({ error: 'At least one item is required' });

  const ids = requested.map((item) => cleanString(item.id, 64)).filter(Boolean);
  if (!ids.length) return res.status(400).json({ error: 'Invalid items' });

  const placeholders = ids.map((_, i) => `:id${i}`).join(', ');
  const params = {};
  ids.forEach((id, i) => { params[`id${i}`] = id; });
  const products = await db.query(
    `SELECT id, name, price FROM products WHERE active = 1 AND id IN (${placeholders})`,
    params
  );
  const priceById = new Map(products.map((p) => [p.id, p]));

  const items = [];
  let subtotal = 0;
  requested.forEach((item) => {
    const product = priceById.get(cleanString(item.id, 64));
    if (!product) return;
    const qty = Math.min(Math.max(toInt(item.qty, 1), 1), 99);
    const lineTotal = product.price * qty;
    subtotal += lineTotal;
    items.push({ id: product.id, name: product.name, price: product.price, qty, lineTotal });
  });

  if (!items.length) return res.status(400).json({ error: 'None of the items are available' });

  // Delivery is decided here, not by the browser: ₹79 below ₹999, free above.
  // Trusting body.shipping let a caller set their own delivery price.
  const shipping = subtotal >= 999 ? 0 : 79;
  const total = subtotal + shipping;
  const suppliedId = clientId(body.id);
  if (body.id && !suppliedId) return res.status(400).json({ error: 'Invalid order id' });
  const id = suppliedId || makeId('SO');

  await db.query(
    `INSERT INTO orders
       (id, user_id, customer_name, phone, email, address, city, pincode, items, subtotal,
        shipping, total, status, payment_status, notes, created_at)
     VALUES
       (:id, :userId, :name, :phone, :email, :address, :city, :pincode, :items, :subtotal,
        :shipping, :total, 'new', :paymentStatus, :notes, :createdAt)`,
    {
      id,
      userId: req.user ? req.user.sub : null,
      name,
      phone,
      email: cleanString(body.email, 190),
      address: cleanString(body.address, 255),
      city: cleanString(body.city, 120),
      pincode: cleanString(body.pincode, 12),
      items: JSON.stringify(items),
      subtotal,
      shipping,
      total,
      paymentStatus: 'Pending',
      notes: cleanString(body.notes, 4000),
      createdAt: new Date()
    }
  );

  res.status(201).json({ data: { id, subtotal, shipping, total, items, status: 'new' } });
}));

/* -------------------------------------------------------------- contact */
router.post('/contact', writeLimit, asyncHandler(async (req, res) => {
  const body = req.body || {};
  const name = cleanString(body.name, 190);
  const message = cleanString(body.message, 8000);
  if (!name || !message) return res.status(400).json({ error: 'name and message are required' });

  const result = await db.query(
    `INSERT INTO contact_messages (name, email, phone, subject, message)
     VALUES (:name, :email, :phone, :subject, :message)`,
    {
      name,
      email: cleanString(body.email, 190),
      phone: cleanString(body.phone, 40),
      subject: cleanString(body.subject, 190),
      message
    }
  );

  res.status(201).json({ data: { id: result.insertId, status: 'new' } });
}));

module.exports = router;
