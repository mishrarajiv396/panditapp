'use strict';

const express = require('express');
const db = require('../db');
const {
  asyncHandler, json, cleanString, toInt, safeDate, isoDateOrNull
} = require('../middleware/helpers');
const { optionalUser } = require('../middleware/auth');
const rateLimit = require('../middleware/rate-limit');

const router = express.Router();

const ID_RE = /^[A-Za-z0-9_-]{3,32}$/;

// Public write and lookup endpoints. The gate OTP proves ownership of a
// booking, so a tight limit on lookup/cancel/payment keeps a short code from
// being brute-forced.
const createLimit = rateLimit({ windowMs: 60_000, max: 10 });
const lookupLimit = rateLimit({ windowMs: 60_000, max: 30 });
const claimLimit = rateLimit({ windowMs: 60_000, max: 10 });
const cancelLimit = rateLimit({ windowMs: 60_000, max: 10 });

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
    panditId: row.pandit_id,
    panditName: row.pandit_name,
    place: row.place,
    city: row.city,
    base: row.base_amount,
    extras: row.extras_amount,
    gst: row.gst_amount,
    total: row.total_amount,
    payment: row.payment_method,
    paymentStatus: row.payment_status,
    paymentRef: row.payment_ref,
    payNow: row.pay_now,
    balance: row.balance,
    amountPaid: row.amount_paid,
    upi: row.upi_id,
    otp: row.otp,
    createdAt: row.created_at,
    paymentClaimedAt: row.payment_claimed_at,
    customer: {
      name: row.customer_name,
      phone: row.customer_phone,
      email: row.customer_email,
      address: row.address,
      society: row.society,
      pin: row.pincode,
      gate: row.gate,
      gotra: row.gotra,
      language: row.language,
      tradition: row.tradition,
      notes: row.notes,
      gstin: row.gstin,
      company: row.company,
      gatePass: Boolean(row.gate_pass)
    },
    extrasList: json(row.extras_list, [])
  };
}

/* --------------------------------------------------------------- pricing
   The browser shows a live estimate, but money is decided here. Prices are
   read from the catalogue so a modified payload cannot book a ₹51,000 ritual
   for ₹1, and GST / pay-now / balance are always derived from the same rule
   the booking page displays. */
const GST_RATE = 0.18;

function extraIdsFrom(body) {
  let ids = [];
  if (Array.isArray(body.extrasIds)) ids = body.extrasIds;
  else if (body.extras && typeof body.extras === 'object') ids = Object.keys(body.extras);
  return Array.from(new Set(ids.map((v) => cleanString(v, 64)).filter(Boolean))).slice(0, 20);
}

async function priceBooking(body) {
  const poojaId = cleanString(body.poojaId, 64);
  const pooja = poojaId
    ? await db.one('SELECT id, name, price FROM poojas WHERE id = :id AND active = 1', { id: poojaId })
    : null;
  // The catalogue is the only source of truth. A booking that names an
  // unknown or retired ritual is rejected rather than trusted at the price the
  // browser claims.
  if (!pooja) return { error: 'Unknown or inactive pooja' };

  const extraIds = extraIdsFrom(body);
  let extrasRows = [];
  if (extraIds.length) {
    const params = {};
    const names = extraIds.map((id, i) => {
      params['e' + i] = id;
      return ':e' + i;
    });
    extrasRows = await db.query(
      `SELECT id, name, price FROM extras WHERE active = 1 AND id IN (${names.join(',')})`,
      params
    );
    // Keep the order the customer selected (IN() does not guarantee one).
    const byId = new Map(extrasRows.map((row) => [row.id, row]));
    extrasRows = extraIds.map((id) => byId.get(id)).filter(Boolean);
  }

  const base = Number(pooja.price) || 0;
  const extras = extrasRows.reduce((sum, row) => sum + (Number(row.price) || 0), 0);
  const extrasList = extrasRows.map((row) => row.name);

  const gst = Math.round((base + extras) * GST_RATE);
  const total = base + extras + gst;
  const paymentMethod = cleanString(body.payment, 40) || 'UPI';
  const payNow = paymentMethod === '25% now'
    ? Math.max(1, Math.round(total * 0.25))
    : total;

  return {
    poojaName: pooja.name,
    base,
    extras,
    gst,
    total,
    paymentMethod,
    payNow,
    balance: total - payNow,
    extrasList,
    extrasIds: extrasRows.map((row) => row.id)
  };
}

/** Public: create a booking (called once from booking.html). */
router.post('/bookings', createLimit, optionalUser, asyncHandler(async (req, res) => {
  const body = req.body || {};
  const id = cleanString(body.id, 32);
  const customer = body.customer || {};
  const name = cleanString(customer.name, 190);
  const phone = cleanString(customer.phone, 40);
  const poojaName = cleanString(body.poojaName, 190);
  const poojaId = cleanString(body.poojaId, 64);
  const otp = cleanString(body.otp, 8);

  if (!id || !ID_RE.test(id)) return res.status(400).json({ error: 'A valid booking id is required' });
  if (!name) return res.status(400).json({ error: 'Customer name is required' });
  if (!phone) return res.status(400).json({ error: 'Customer phone is required' });
  if (!poojaName) return res.status(400).json({ error: 'Pooja name is required' });
  if (!poojaId || !ID_RE.test(poojaId)) {
    return res.status(400).json({ error: 'A valid poojaId is required' });
  }
  if (!otp || !/^\d{4,8}$/.test(otp)) {
    return res.status(400).json({ error: 'A 4–8 digit gate OTP is required' });
  }

  const exists = await db.one('SELECT id FROM bookings WHERE id = :id', { id });
  if (exists) return res.status(409).json({ error: 'Booking already exists', id });

  const price = await priceBooking(body);
  if (price.error) return res.status(400).json({ error: price.error });
  const extrasJson = {};
  price.extrasIds.forEach((extraId) => { extrasJson[extraId] = true; });

  const bookingDate = cleanString(body.date, 10);
  const payload = {
    id,
    user_id: req.user ? req.user.sub : null,
    type: cleanString(body.type, 32) || 'pooja',
    // A customer can only create a fresh booking. Admin status changes go
    // through the protected admin route.
    status: 'Confirmed',
    pooja_id: poojaId,
    pooja_name: price.poojaName,
    booking_date: isoDateOrNull(bookingDate),
    date_label: cleanString(body.dateLabel, 60),
    muhurat: cleanString(body.time, 190),
    pandit_id: cleanString(body.panditId, 64),
    pandit_name: cleanString(body.panditName, 190),
    city: cleanString(body.city, 120),
    place: cleanString(body.place, 255),
    base_amount: price.base,
    extras_amount: price.extras,
    gst_amount: price.gst,
    total_amount: price.total,
    payment_method: price.paymentMethod,
    payment_status: 'Pending',
    pay_now: price.payNow,
    balance: price.balance,
    amount_paid: 0,
    upi_id: cleanString(body.upi, 190),
    otp,
    customer_name: name,
    customer_phone: phone,
    customer_email: cleanString(customer.email, 190),
    address: cleanString(customer.address, 255),
    society: cleanString(customer.society, 190),
    pincode: cleanString(customer.pin, 12),
    gate: cleanString(customer.gate, 120),
    gotra: cleanString(customer.gotra, 120),
    language: cleanString(customer.language, 60),
    tradition: cleanString(customer.tradition, 120),
    notes: cleanString(customer.notes, 4000),
    gstin: cleanString(customer.gstin, 40),
    company: cleanString(customer.company, 190),
    gate_pass: customer.gatePass ? 1 : 0,
    extras: JSON.stringify(extrasJson),
    extras_list: JSON.stringify(price.extrasList),
    created_at: safeDate(body.createdAt)
  };

  await db.query(
    `INSERT INTO bookings (
       id, user_id, type, status, pooja_id, pooja_name, booking_date, date_label, muhurat,
       pandit_id, pandit_name, city, place, base_amount, extras_amount, gst_amount,
       total_amount, payment_method, payment_status, pay_now, balance, amount_paid,
       upi_id, otp, customer_name, customer_phone, customer_email, address, society,
       pincode, gate, gotra, language, tradition, notes, gstin, company, gate_pass,
       extras, extras_list, created_at
     ) VALUES (
       :id, :user_id, :type, :status, :pooja_id, :pooja_name, :booking_date, :date_label, :muhurat,
       :pandit_id, :pandit_name, :city, :place, :base_amount, :extras_amount, :gst_amount,
       :total_amount, :payment_method, :payment_status, :pay_now, :balance, :amount_paid,
       :upi_id, :otp, :customer_name, :customer_phone, :customer_email, :address, :society,
       :pincode, :gate, :gotra, :language, :tradition, :notes, :gstin, :company, :gate_pass,
       :extras, :extras_list, :created_at
     )`,
    payload
  );

  const row = await db.one('SELECT * FROM bookings WHERE id = :id', { id });
  res.status(201).json({ data: mapBooking(row) });
}));

/** Public: look up a booking with its OTP (shown on the confirmation screen). */
router.get('/bookings/:id', lookupLimit, asyncHandler(async (req, res) => {
  const otp = cleanString(req.query.otp, 8);
  if (!otp) return res.status(401).json({ error: 'OTP is required' });
  const row = await db.one('SELECT * FROM bookings WHERE id = :id AND otp = :otp', {
    id: req.params.id,
    otp
  });
  if (!row) return res.status(404).json({ error: 'Booking not found' });
  res.json({ data: mapBooking(row) });
}));

/** Public: customer claims a UPI payment (OTP proves ownership of the booking). */
router.patch('/bookings/:id/payment', claimLimit, asyncHandler(async (req, res) => {
  const body = req.body || {};
  const otp = cleanString(body.otp, 8);
  const paymentRef = cleanString(body.paymentRef, 190);
  if (!otp) return res.status(401).json({ error: 'OTP is required' });
  if (!paymentRef) return res.status(400).json({ error: 'UPI / UTR reference is required' });

  const row = await db.one('SELECT id FROM bookings WHERE id = :id AND otp = :otp', {
    id: req.params.id,
    otp
  });
  if (!row) return res.status(404).json({ error: 'Booking not found' });

  await db.query(
    `UPDATE bookings
        SET payment_status = 'Awaiting verification',
            payment_ref = :paymentRef,
            amount_paid = :amountPaid,
            payment_claimed_at = NOW()
      WHERE id = :id AND otp = :otp`,
    {
      id: req.params.id,
      otp,
      paymentRef,
      amountPaid: toInt(body.amountPaid, 0)
    }
  );

  const updated = await db.one('SELECT * FROM bookings WHERE id = :id', { id: req.params.id });
  res.json({ data: mapBooking(updated) });
}));

/** Public: cancel a booking (the gate OTP proves ownership). */
router.patch('/bookings/:id/cancel', cancelLimit, asyncHandler(async (req, res) => {
  const otp = cleanString((req.body || {}).otp, 8);
  if (!otp) return res.status(401).json({ error: 'OTP is required' });

  const row = await db.one(
    'SELECT id, status, payment_status FROM bookings WHERE id = :id AND otp = :otp',
    { id: req.params.id, otp }
  );
  if (!row) return res.status(404).json({ error: 'Booking not found' });
  if (row.status === 'Cancelled') {
    return res.json({ data: { id: row.id, status: 'Cancelled' } });
  }
  if (row.status === 'Completed') {
    return res.status(409).json({ error: 'A completed pooja cannot be cancelled. Please call us.' });
  }

  await db.query(
    "UPDATE bookings SET status = 'Cancelled' WHERE id = :id AND otp = :otp",
    { id: req.params.id, otp }
  );

  res.json({
    data: {
      id: req.params.id,
      status: 'Cancelled',
      paymentStatus: row.payment_status,
      note: row.payment_status === 'Pending'
        ? 'No payment was recorded.'
        : 'Our team will check the payment and confirm any refund on WhatsApp.'
    }
  });
}));

module.exports = router;
