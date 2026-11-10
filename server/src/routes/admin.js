'use strict';

const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { sign, requireAdmin } = require('../middleware/auth');
const { asyncHandler, json, cleanString, toInt, limitOffset } = require('../middleware/helpers');
const rateLimit = require('../middleware/rate-limit');

const router = express.Router();

const loginLimiter = rateLimit({ windowMs: 60_000, max: 12 });
const passwordLimiter = rateLimit({ windowMs: 60_000, max: 8 });

/* ------------------------------------------------------------------ login */
router.post('/login', loginLimiter, asyncHandler(async (req, res) => {
  const body = req.body || {};
  const email = cleanString(body.email, 190);
  const password = String(body.password || '');
  if (!email || !password) return res.status(400).json({ error: 'email and password are required' });

  const admin = await db.one('SELECT * FROM admins WHERE email = :email AND active = 1', { email });
  if (!admin || !(await bcrypt.compare(password, admin.password_hash))) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  res.json({
    data: {
      token: sign(admin),
      admin: { id: admin.id, email: admin.email, name: admin.name, role: admin.role }
    }
  });
}));

router.use(requireAdmin);

router.get('/me', (req, res) => res.json({ data: req.admin }));

/* ---------------------------------------------------------------- profile */
router.patch('/profile', asyncHandler(async (req, res) => {
  const body = req.body || {};
  const fields = [];
  const params = { id: req.admin.sub };

  if (body.name !== undefined) {
    const name = cleanString(body.name, 120);
    if (!name) return res.status(400).json({ error: 'Name cannot be empty' });
    fields.push('name = :name');
    params.name = name;
  }

  if (body.email !== undefined) {
    const email = cleanString(body.email, 190);
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Enter a valid email address' });
    }
    const clash = await db.one(
      'SELECT id FROM admins WHERE email = :email AND id <> :id',
      { email, id: req.admin.sub }
    );
    if (clash) return res.status(409).json({ error: 'That email is already used by another admin' });
    fields.push('email = :email');
    params.email = email;
  }

  if (!fields.length) return res.status(400).json({ error: 'Nothing to update' });

  await db.query(`UPDATE admins SET ${fields.join(', ')} WHERE id = :id`, params);
  const admin = await db.one(
    'SELECT id, email, name, role FROM admins WHERE id = :id',
    { id: req.admin.sub }
  );

  res.json({ data: { admin, token: sign(admin) } });
}));

/* -------------------------------------------------------- change password */
router.post('/change-password', passwordLimiter, asyncHandler(async (req, res) => {
  const body = req.body || {};
  const currentPassword = String(body.currentPassword || '');
  const newPassword = String(body.newPassword || '');

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current and new password are required' });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters' });
  }
  if (newPassword.length > 72) {
    return res.status(400).json({ error: 'New password is too long (max 72 characters)' });
  }
  if (!/[A-Za-z]/.test(newPassword) || !/\d/.test(newPassword)) {
    return res.status(400).json({ error: 'Use at least one letter and one number' });
  }
  if (newPassword === currentPassword) {
    return res.status(400).json({ error: 'New password must be different from the current one' });
  }

  const admin = await db.one('SELECT * FROM admins WHERE id = :id', { id: req.admin.sub });
  if (!admin || !(await bcrypt.compare(currentPassword, admin.password_hash))) {
    return res.status(400).json({ error: 'Current password is incorrect' });
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await db.query('UPDATE admins SET password_hash = :hash WHERE id = :id', {
    hash: passwordHash,
    id: admin.id
  });

  res.json({ data: { ok: true } });
}));


/* ------------------------------------------------------------------ stats */
router.get('/stats', asyncHandler(async (req, res) => {
  const [totals, today, pending, revenue, recent] = await Promise.all([
    db.one('SELECT COUNT(*) AS n FROM bookings'),
    db.one('SELECT COUNT(*) AS n FROM bookings WHERE DATE(created_at) = CURDATE()'),
    db.one("SELECT COUNT(*) AS n FROM bookings WHERE payment_status = 'Awaiting verification'"),
    db.one("SELECT COALESCE(SUM(amount_paid), 0) AS n FROM bookings WHERE payment_status IN ('Paid', 'Verified')"),
    db.query('SELECT id, pooja_name, customer_name, customer_phone, total_amount, payment_status, created_at FROM bookings ORDER BY created_at DESC LIMIT 10')
  ]);

  res.json({
    data: {
      bookings: totals.n,
      bookingsToday: today.n,
      awaitingVerification: pending.n,
      verifiedRevenue: revenue.n,
      applications: (await db.one('SELECT COUNT(*) AS n FROM pandit_applications')).n,
      newOrders: (await db.one("SELECT COUNT(*) AS n FROM orders WHERE status = 'new'")).n,
      newMessages: (await db.one("SELECT COUNT(*) AS n FROM contact_messages WHERE status = 'new'")).n,
      recentBookings: recent
    }
  });
}));

/* --------------------------------------------------------------- bookings */
router.get('/bookings', asyncHandler(async (req, res) => {
  const where = ['1 = 1'];
  const params = {};
  if (req.query.status) {
    where.push('status = :status');
    params.status = cleanString(req.query.status, 40);
  }
  if (req.query.paymentStatus) {
    where.push('payment_status = :paymentStatus');
    params.paymentStatus = cleanString(req.query.paymentStatus, 60);
  }
  if (req.query.phone) {
    where.push('customer_phone LIKE :phone');
    params.phone = `%${cleanString(req.query.phone, 40)}%`;
  }
  if (req.query.q) {
    where.push('(customer_name LIKE :q OR customer_phone LIKE :q OR id LIKE :q OR pooja_name LIKE :q)');
    params.q = `%${cleanString(req.query.q, 190)}%`;
  }
  if (req.query.from) {
    where.push('booking_date >= :from');
    params.from = cleanString(req.query.from, 10);
  }
  if (req.query.to) {
    where.push('booking_date <= :to');
    params.to = cleanString(req.query.to, 10);
  }

  const { limit, offset } = limitOffset(req.query, 50, 200);
  const rows = await db.query(
    `SELECT * FROM bookings WHERE ${where.join(' AND ')}
      ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`,
    params
  );
  const total = await db.one(`SELECT COUNT(*) AS n FROM bookings WHERE ${where.join(' AND ')}`, params);
  res.json({ data: rows, total: total.n, limit, offset });
}));

router.get('/bookings/:id', asyncHandler(async (req, res) => {
  const row = await db.one('SELECT * FROM bookings WHERE id = :id', { id: req.params.id });
  if (!row) return res.status(404).json({ error: 'Booking not found' });
  res.json({ data: row });
}));

router.patch('/bookings/:id', asyncHandler(async (req, res) => {
  const body = req.body || {};
  const fields = [];
  const params = { id: req.params.id };

  if (body.status !== undefined) {
    fields.push('status = :status');
    params.status = cleanString(body.status, 40);
  }
  if (body.paymentStatus !== undefined) {
    fields.push('payment_status = :paymentStatus');
    params.paymentStatus = cleanString(body.paymentStatus, 60);
  }
  if (body.amountPaid !== undefined) {
    fields.push('amount_paid = :amountPaid');
    params.amountPaid = toInt(body.amountPaid, 0);
  }
  if (body.panditName !== undefined) {
    fields.push('pandit_name = :panditName');
    params.panditName = cleanString(body.panditName, 190);
  }
  if (body.notes !== undefined) {
    fields.push('notes = :notes');
    params.notes = cleanString(body.notes, 4000);
  }

  if (!fields.length) return res.status(400).json({ error: 'No supported fields to update' });

  const result = await db.query(
    `UPDATE bookings SET ${fields.join(', ')} WHERE id = :id`,
    params
  );
  if (!result.affectedRows) return res.status(404).json({ error: 'Booking not found' });

  const row = await db.one('SELECT * FROM bookings WHERE id = :id', { id: req.params.id });
  res.json({ data: row });
}));

/* ----------------------------------------------------------- applications */
router.get('/applications', asyncHandler(async (req, res) => {
  const where = ['1 = 1'];
  const params = {};
  if (req.query.status) {
    where.push('status = :status');
    params.status = cleanString(req.query.status, 40);
  }
  const { limit, offset } = limitOffset(req.query, 100, 500);
  const rows = await db.query(
    `SELECT * FROM pandit_applications WHERE ${where.join(' AND ')}
      ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`,
    params
  );
  res.json({ data: rows, limit, offset });
}));

router.patch('/applications/:id', asyncHandler(async (req, res) => {
  const status = cleanString((req.body || {}).status, 40);
  if (!status) return res.status(400).json({ error: 'status is required' });
  const result = await db.query('UPDATE pandit_applications SET status = :status WHERE id = :id', {
    id: req.params.id,
    status
  });
  if (!result.affectedRows) return res.status(404).json({ error: 'Application not found' });
  res.json({ data: { id: req.params.id, status } });
}));

/* ----------------------------------------------------------------- orders */
router.get('/orders', asyncHandler(async (req, res) => {
  const where = ['1 = 1'];
  const params = {};
  if (req.query.status) {
    where.push('status = :status');
    params.status = cleanString(req.query.status, 40);
  }
  const { limit, offset } = limitOffset(req.query, 100, 500);
  const rows = await db.query(
    `SELECT * FROM orders WHERE ${where.join(' AND ')}
      ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`,
    params
  );
  res.json({ data: rows, limit, offset });
}));

router.patch('/orders/:id', asyncHandler(async (req, res) => {
  const body = req.body || {};
  const fields = [];
  const params = { id: req.params.id };
  if (body.status !== undefined) {
    fields.push('status = :status');
    params.status = cleanString(body.status, 40);
  }
  if (body.paymentStatus !== undefined) {
    fields.push('payment_status = :paymentStatus');
    params.paymentStatus = cleanString(body.paymentStatus, 60);
  }
  if (!fields.length) return res.status(400).json({ error: 'No supported fields to update' });
  const result = await db.query(`UPDATE orders SET ${fields.join(', ')} WHERE id = :id`, params);
  if (!result.affectedRows) return res.status(404).json({ error: 'Order not found' });
  res.json({ data: { id: req.params.id } });
}));

/* --------------------------------------------------------------- messages */
router.get('/messages', asyncHandler(async (req, res) => {
  const { limit, offset } = limitOffset(req.query, 100, 500);
  const rows = await db.query(
    `SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`
  );
  res.json({ data: rows, limit, offset });
}));

router.patch('/messages/:id', asyncHandler(async (req, res) => {
  const status = cleanString((req.body || {}).status, 40);
  if (!status) return res.status(400).json({ error: 'status is required' });
  const result = await db.query('UPDATE contact_messages SET status = :status WHERE id = :id', {
    id: req.params.id,
    status
  });
  if (!result.affectedRows) return res.status(404).json({ error: 'Message not found' });
  res.json({ data: { id: Number(req.params.id), status } });
}));

/* --------------------------------------------------------------- settings */
router.get('/settings', asyncHandler(async (req, res) => {
  const rows = await db.query('SELECT setting_key, value FROM site_settings');
  const data = {};
  rows.forEach((row) => { data[row.setting_key] = json(row.value, null); });
  res.json({ data });
}));

router.put('/settings', asyncHandler(async (req, res) => {
  const body = req.body || {};
  const entries = body.key
    ? [[body.key, body.value]]
    : Object.entries(body);

  if (!entries.length) return res.status(400).json({ error: 'No settings supplied' });

  for (const [key, value] of entries) {
    await db.query(
      `INSERT INTO site_settings (setting_key, value) VALUES (:key, :value)
       ON DUPLICATE KEY UPDATE value = VALUES(value)`,
      { key: cleanString(key, 64), value: JSON.stringify(value) }
    );
  }

  res.json({ data: { updated: entries.length } });
}));

/* ------------------------------------------------------- catalogue prices */
router.patch('/poojas/:id', asyncHandler(async (req, res) => {
  const body = req.body || {};
  const fields = [];
  const params = { id: req.params.id };
  if (body.price !== undefined) { fields.push('price = :price'); params.price = toInt(body.price, 0); }
  if (body.mrp !== undefined) { fields.push('mrp = :mrp'); params.mrp = toInt(body.mrp, 0); }
  if (body.active !== undefined) { fields.push('active = :active'); params.active = body.active ? 1 : 0; }
  if (!fields.length) return res.status(400).json({ error: 'No supported fields to update' });
  const result = await db.query(`UPDATE poojas SET ${fields.join(', ')} WHERE id = :id`, params);
  if (!result.affectedRows) return res.status(404).json({ error: 'Pooja not found' });
  res.json({ data: { id: req.params.id } });
}));

router.patch('/products/:id', asyncHandler(async (req, res) => {
  const body = req.body || {};
  const fields = [];
  const params = { id: req.params.id };
  if (body.price !== undefined) { fields.push('price = :price'); params.price = toInt(body.price, 0); }
  if (body.mrp !== undefined) { fields.push('mrp = :mrp'); params.mrp = toInt(body.mrp, 0); }
  if (body.active !== undefined) { fields.push('active = :active'); params.active = body.active ? 1 : 0; }
  if (!fields.length) return res.status(400).json({ error: 'No supported fields to update' });
  const result = await db.query(`UPDATE products SET ${fields.join(', ')} WHERE id = :id`, params);
  if (!result.affectedRows) return res.status(404).json({ error: 'Product not found' });
  res.json({ data: { id: req.params.id } });
}));

module.exports = router;
