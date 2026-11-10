'use strict';

const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const db = require('../db');
const config = require('../config');
const { signUser, requireUser } = require('../middleware/auth');
const { asyncHandler, json, cleanString, toInt } = require('../middleware/helpers');
const rateLimit = require('../middleware/rate-limit');

const router = express.Router();

const registerLimiter = rateLimit({ windowMs: 60_000, max: 8 });
const loginLimiter = rateLimit({ windowMs: 60_000, max: 12 });
const forgotLimiter = rateLimit({ windowMs: 60_000, max: 6 });
const resetLimiter = rateLimit({ windowMs: 60_000, max: 10 });
const passwordLimiter = rateLimit({ windowMs: 60_000, max: 8 });

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const CODE_TTL_MINUTES = 15;
const MAX_RESET_ATTEMPTS = 5;

// Account responses can contain session tokens and reset codes: never cache.
router.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  res.set('Pragma', 'no-cache');
  next();
});

/* ------------------------------------------------------------- validation */
function normaliseEmail(value) {
  const email = cleanString(value, 190);
  if (!email || !EMAIL_RE.test(email)) return null;
  return email.toLowerCase();
}

function normalisePhone(value) {
  const digits = String(value || '').replace(/\D/g, '');
  let phone = digits;
  if (phone.length === 12 && phone.startsWith('91')) phone = phone.slice(2);
  if (phone.length === 11 && phone.startsWith('0')) phone = phone.slice(1);
  return /^[6-9]\d{9}$/.test(phone) ? phone : null;
}

function passwordProblem(password) {
  if (!password) return 'Please choose a password';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (password.length > 72) return 'Password is too long (max 72 characters)';
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return 'Use at least one letter and one number';
  }
  return null;
}

function publicUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    emailVerified: Boolean(row.email_verified),
    phoneVerified: Boolean(row.phone_verified),
    createdAt: row.created_at,
    lastLoginAt: row.last_login_at
  };
}

function maskEmail(email) {
  const parts = String(email || '').split('@');
  if (parts.length !== 2) return email || null;
  return (parts[0].slice(0, 1) || '') + '***@' + parts[1];
}

function maskPhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  return digits.length >= 4 ? '******' + digits.slice(-4) : null;
}

function maskTarget(channel, target) {
  return channel === 'email' ? maskEmail(target) : maskPhone(target);
}

/** Which unique column caused a duplicate-key error, if we can tell. */
function duplicateField(err) {
  if (!err || err.code !== 'ER_DUP_ENTRY') return null;
  var message = String(err.message || '');
  if (/email/i.test(message)) return 'email';
  if (/phone/i.test(message)) return 'phone';
  return 'account';
}

async function findByIdentifier(identifier) {
  const raw = cleanString(identifier, 190);
  if (!raw) return null;
  if (raw.includes('@')) {
    const email = normaliseEmail(raw);
    if (!email) return null;
    return db.one('SELECT * FROM users WHERE active = 1 AND email = :email', { email });
  }
  const phone = normalisePhone(raw);
  if (!phone) return null;
  return db.one('SELECT * FROM users WHERE active = 1 AND phone = :phone', { phone });
}

/**
 * Attach previous guest bookings and shop orders that were placed with the
 * same phone or email, so a new account instantly shows its history.
 */
async function linkGuestRecords(user) {
  const params = {
    id: user.id,
    phone: user.phone || '',
    email: String(user.email || '').toLowerCase()
  };
  const bookings = await db.query(
    `UPDATE bookings
        SET user_id = :id
      WHERE user_id IS NULL
        AND (
          (:phone <> '' AND customer_phone = :phone)
          OR (:email <> '' AND customer_email IS NOT NULL
              AND LOWER(customer_email) = :email)
        )`,
    params
  );
  const orders = await db.query(
    `UPDATE orders
        SET user_id = :id
      WHERE user_id IS NULL
        AND :phone <> ''
        AND phone = :phone`,
    params
  );
  return {
    bookings: bookings.affectedRows || 0,
    orders: orders.affectedRows || 0
  };
}

function mapBooking(row) {
  return {
    id: row.id,
    type: row.type,
    status: row.status,
    poojaId: row.pooja_id,
    poojaName: row.pooja_name,
    date: row.booking_date,
    dateLabel: row.date_label,
    time: row.muhurat,
    panditName: row.pandit_name,
    place: row.place,
    city: row.city,
    total: row.total_amount,
    payNow: row.pay_now,
    balance: row.balance,
    amountPaid: row.amount_paid,
    payment: row.payment_method,
    paymentStatus: row.payment_status,
    paymentRef: row.payment_ref,
    otp: row.otp,
    createdAt: row.created_at,
    extrasList: json(row.extras_list, []),
    customer: {
      name: row.customer_name,
      phone: row.customer_phone,
      email: row.customer_email,
      address: row.address,
      society: row.society,
      pin: row.pincode,
      gotra: row.gotra,
      language: row.language,
      tradition: row.tradition
    }
  };
}

function mapOrder(row) {
  return {
    id: row.id,
    customerName: row.customer_name,
    phone: row.phone,
    items: json(row.items, []),
    subtotal: row.subtotal,
    shipping: row.shipping,
    total: row.total,
    status: row.status,
    paymentStatus: row.payment_status,
    createdAt: row.created_at
  };
}

/* --------------------------------------------------------------- register */
router.post('/register', registerLimiter, asyncHandler(async (req, res) => {
  const body = req.body || {};
  const name = cleanString(body.name, 120);
  const email = normaliseEmail(body.email);
  const phone = normalisePhone(body.phone);
  const password = String(body.password || '');

  if (!name || name.length < 2) {
    return res.status(400).json({ error: 'Please enter your full name', field: 'name' });
  }
  if (!email) {
    return res.status(400).json({ error: 'Enter a valid email address', field: 'email' });
  }
  if (!phone) {
    return res.status(400).json({ error: 'Enter a valid 10-digit mobile number', field: 'phone' });
  }
  const problem = passwordProblem(password);
  if (problem) return res.status(400).json({ error: problem, field: 'password' });

  const emailTaken = await db.one('SELECT id FROM users WHERE email = :email', { email });
  if (emailTaken) {
    return res.status(409).json({ error: 'An account with this email already exists. Please sign in.', field: 'email' });
  }
  const phoneTaken = await db.one('SELECT id FROM users WHERE phone = :phone', { phone });
  if (phoneTaken) {
    return res.status(409).json({ error: 'This mobile number is already registered. Please sign in.', field: 'phone' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  let result;
  try {
    result = await db.query(
      `INSERT INTO users (name, email, phone, password_hash, last_login_at)
       VALUES (:name, :email, :phone, :hash, NOW())`,
      { name, email, phone, hash: passwordHash }
    );
  } catch (err) {
    // A simultaneous request can slip past the checks above; the UNIQUE keys
    // are the real guard, so translate that error into a friendly 409.
    const field = duplicateField(err);
    if (field) {
      return res.status(409).json({
        error: field === 'email'
          ? 'An account with this email already exists. Please sign in.'
          : 'This mobile number is already registered. Please sign in.',
        field: field === 'account' ? undefined : field
      });
    }
    throw err;
  }

  const user = await db.one('SELECT * FROM users WHERE id = :id', { id: result.insertId });
  const linked = await linkGuestRecords(user);

  res.status(201).json({
    data: {
      token: signUser(user),
      user: publicUser(user),
      linked
    }
  });
}));

/* ------------------------------------------------------------------ login */
router.post('/login', loginLimiter, asyncHandler(async (req, res) => {
  const body = req.body || {};
  const identifier = cleanString(body.identifier || body.email || body.phone, 190);
  const password = String(body.password || '');
  if (!identifier || !password) {
    return res.status(400).json({ error: 'Enter your email or mobile number and password' });
  }

  const user = await findByIdentifier(identifier);
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ error: 'Those details do not match an account' });
  }

  await db.query('UPDATE users SET last_login_at = NOW() WHERE id = :id', { id: user.id });
  const linked = await linkGuestRecords(user);
  const fresh = await db.one('SELECT * FROM users WHERE id = :id', { id: user.id });

  res.json({
    data: {
      token: signUser(fresh),
      user: publicUser(fresh),
      linked
    }
  });
}));

/* --------------------------------------------------------------------- me */
router.get('/me', requireUser, asyncHandler(async (req, res) => {
  const user = await db.one('SELECT * FROM users WHERE id = :id AND active = 1', { id: req.user.sub });
  if (!user) return res.status(401).json({ error: 'Account not found' });

  const stats = await db.one(
    `SELECT
       (SELECT COUNT(*) FROM bookings
         WHERE user_id = :id OR (:phone <> '' AND customer_phone = :phone)) AS bookings,
       (SELECT COUNT(*) FROM orders
         WHERE user_id = :id OR (:phone <> '' AND phone = :phone)) AS orders,
       (SELECT COALESCE(SUM(amount_paid), 0) FROM bookings
         WHERE user_id = :id OR (:phone <> '' AND customer_phone = :phone)) AS spent`,
    { id: user.id, phone: user.phone || '' }
  );

  res.json({
    data: {
      user: publicUser(user),
      stats: {
        bookings: toInt(stats.bookings, 0),
        orders: toInt(stats.orders, 0),
        spent: toInt(stats.spent, 0)
      }
    }
  });
}));

/* ---------------------------------------------------------------- profile */
router.patch('/profile', requireUser, asyncHandler(async (req, res) => {
  const body = req.body || {};
  const fields = [];
  const params = { id: req.user.sub };

  if (body.name !== undefined) {
    const name = cleanString(body.name, 120);
    if (!name || name.length < 2) return res.status(400).json({ error: 'Please enter your full name', field: 'name' });
    fields.push('name = :name');
    params.name = name;
  }

  if (body.email !== undefined) {
    const email = normaliseEmail(body.email);
    if (!email) return res.status(400).json({ error: 'Enter a valid email address', field: 'email' });
    const clash = await db.one('SELECT id FROM users WHERE email = :email AND id <> :id', {
      email,
      id: req.user.sub
    });
    if (clash) return res.status(409).json({ error: 'That email is already used by another account', field: 'email' });
    fields.push('email = :email');
    params.email = email;
  }

  if (body.phone !== undefined) {
    const phone = normalisePhone(body.phone);
    if (!phone) return res.status(400).json({ error: 'Enter a valid 10-digit mobile number', field: 'phone' });
    const clash = await db.one('SELECT id FROM users WHERE phone = :phone AND id <> :id', {
      phone,
      id: req.user.sub
    });
    if (clash) return res.status(409).json({ error: 'That mobile number is already used by another account', field: 'phone' });
    fields.push('phone = :phone');
    params.phone = phone;
  }

  if (!fields.length) return res.status(400).json({ error: 'Nothing to update' });

  await db.query(`UPDATE users SET ${fields.join(', ')} WHERE id = :id`, params);
  const user = await db.one('SELECT * FROM users WHERE id = :id', { id: req.user.sub });
  await linkGuestRecords(user);

  res.json({ data: { user: publicUser(user), token: signUser(user) } });
}));

/* -------------------------------------------------------- change password */
router.post('/change-password', passwordLimiter, requireUser, asyncHandler(async (req, res) => {
  const body = req.body || {};
  const currentPassword = String(body.currentPassword || '');
  const newPassword = String(body.newPassword || '');

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current and new password are required' });
  }
  const problem = passwordProblem(newPassword);
  if (problem) return res.status(400).json({ error: problem });
  if (newPassword === currentPassword) {
    return res.status(400).json({ error: 'New password must be different from the current one' });
  }

  const user = await db.one('SELECT * FROM users WHERE id = :id', { id: req.user.sub });
  if (!user || !(await bcrypt.compare(currentPassword, user.password_hash))) {
    return res.status(400).json({ error: 'Current password is incorrect' });
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await db.query('UPDATE users SET password_hash = :hash WHERE id = :id', {
    hash: passwordHash,
    id: user.id
  });

  res.json({ data: { ok: true } });
}));

/* -------------------------------------------------------- forgot password */
router.post('/forgot-password', forgotLimiter, asyncHandler(async (req, res) => {
  const body = req.body || {};
  const raw = cleanString(body.identifier || body.email || body.phone, 190);
  if (!raw) return res.status(400).json({ error: 'Enter your email or mobile number' });

  const channel = raw.includes('@') ? 'email' : 'phone';
  const target = channel === 'email' ? normaliseEmail(raw) : normalisePhone(raw);
  const user = target ? await findByIdentifier(target) : null;

  let devCode = null;
  if (user) {
    const code = String(crypto.randomInt(0, 1000000)).padStart(6, '0');
    const hash = await bcrypt.hash(code, 10);
    const expires = new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000);

    await db.query(
      `UPDATE users
          SET reset_code_hash = :hash,
              reset_code_expires = :expires,
              reset_code_channel = :channel,
              reset_code_target = :target,
              reset_attempts = 0
        WHERE id = :id`,
      { hash, expires, channel, target, id: user.id }
    );

    console.log(`[auth] password reset code for ${target} (${channel}): ${code}`);
    if (config.env !== 'production') devCode = code;
  } else {
    // Spend the same time as a real request so account existence cannot be
    // guessed from the response time.
    await bcrypt.hash('000000', 10);
  }

  // Always the same shape: no account enumeration.
  res.json({
    data: {
      ok: true,
      channel,
      masked: target ? maskTarget(channel, target) : null,
      expiresInMinutes: CODE_TTL_MINUTES,
      devCode
    }
  });
}));

/* --------------------------------------------------------- reset password */
router.post('/reset-password', resetLimiter, asyncHandler(async (req, res) => {
  const body = req.body || {};
  const identifier = cleanString(body.identifier || body.email || body.phone, 190);
  const code = String(body.code || '').replace(/\D/g, '');
  const newPassword = String(body.newPassword || '');

  if (!identifier) return res.status(400).json({ error: 'Enter your email or mobile number' });
  if (!/^\d{6}$/.test(code)) return res.status(400).json({ error: 'Enter the 6-digit code from your reset request' });
  const problem = passwordProblem(newPassword);
  if (problem) return res.status(400).json({ error: problem, field: 'password' });

  const user = await findByIdentifier(identifier);
  if (!user || !user.reset_code_hash || !user.reset_code_expires) {
    return res.status(400).json({ error: 'This reset code is invalid or has expired' });
  }

  const expiresAt = new Date(String(user.reset_code_expires).replace(' ', 'T'));
  if (Number.isNaN(expiresAt.getTime()) || expiresAt.getTime() < Date.now()) {
    return res.status(400).json({ error: 'This reset code has expired. Request a new one.' });
  }
  if (toInt(user.reset_attempts, 0) >= MAX_RESET_ATTEMPTS) {
    return res.status(429).json({ error: 'Too many incorrect attempts. Request a new code.' });
  }

  const matches = await bcrypt.compare(code, user.reset_code_hash);
  if (!matches) {
    await db.query('UPDATE users SET reset_attempts = reset_attempts + 1 WHERE id = :id', { id: user.id });
    const left = Math.max(MAX_RESET_ATTEMPTS - toInt(user.reset_attempts, 0) - 1, 0);
    return res.status(400).json({
      error: left > 0
        ? `That code is not correct. ${left} attempt${left === 1 ? '' : 's'} left.`
        : 'That code is not correct. Request a new code.'
    });
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await db.query(
    `UPDATE users
        SET password_hash = :hash,
            reset_code_hash = NULL,
            reset_code_expires = NULL,
            reset_code_channel = NULL,
            reset_code_target = NULL,
            reset_attempts = 0,
            last_login_at = NOW()
      WHERE id = :id`,
    { hash: passwordHash, id: user.id }
  );

  const fresh = await db.one('SELECT * FROM users WHERE id = :id', { id: user.id });
  const linked = await linkGuestRecords(fresh);

  res.json({
    data: {
      ok: true,
      token: signUser(fresh),
      user: publicUser(fresh),
      linked
    }
  });
}));

/* --------------------------------------------------------- account history */
router.get('/bookings', requireUser, asyncHandler(async (req, res) => {
  const user = await db.one('SELECT phone FROM users WHERE id = :id', { id: req.user.sub });
  if (!user) return res.status(401).json({ error: 'Account not found' });

  const rows = await db.query(
    `SELECT * FROM bookings
      WHERE user_id = :id OR (:phone <> '' AND customer_phone = :phone)
      ORDER BY created_at DESC
      LIMIT 100`,
    { id: req.user.sub, phone: user.phone || '' }
  );

  res.json({ data: rows.map(mapBooking) });
}));

router.get('/orders', requireUser, asyncHandler(async (req, res) => {
  const user = await db.one('SELECT phone FROM users WHERE id = :id', { id: req.user.sub });
  if (!user) return res.status(401).json({ error: 'Account not found' });

  const rows = await db.query(
    `SELECT * FROM orders
      WHERE user_id = :id OR (:phone <> '' AND phone = :phone)
      ORDER BY created_at DESC
      LIMIT 50`,
    { id: req.user.sub, phone: user.phone || '' }
  );

  res.json({ data: rows.map(mapOrder) });
}));

module.exports = router;
