'use strict';

/* Public reviews: read approved ones, submit a new one for moderation. */

const express = require('express');
const db = require('../db');
const { asyncHandler, cleanString, toInt, limitOffset } = require('../middleware/helpers');
const { optionalUser } = require('../middleware/auth');
const rateLimit = require('../middleware/rate-limit');

const router = express.Router();
const MAX_MESSAGE = 2000;

// Five reviews per ten minutes per IP: plenty for a family, useless for a
// spammer who wants to fill the moderation queue.
const createLimit = rateLimit({ windowMs: 10 * 60_000, max: 5 });

function mapReview(row) {
  return {
    id: row.id,
    name: row.name,
    city: row.city || '',
    poojaId: row.pooja_id || '',
    poojaName: row.pooja_name || '',
    panditId: row.pandit_id || '',
    panditName: row.pandit_name || '',
    rating: Number(row.rating) || 0,
    title: row.title || '',
    message: row.message,
    createdAt: row.created_at
  };
}

/** Overall numbers for the summary card. Always counts approved reviews only. */
async function publishedSummary() {
  const [totals, byRating] = await Promise.all([
    db.one("SELECT COUNT(*) AS total, COALESCE(AVG(rating), 0) AS average FROM reviews WHERE status = 'approved'"),
    db.query("SELECT rating, COUNT(*) AS n FROM reviews WHERE status = 'approved' GROUP BY rating")
  ]);

  const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  byRating.forEach((row) => {
    const key = Number(row.rating);
    if (counts[key] !== undefined) counts[key] = Number(row.n) || 0;
  });

  return {
    total: Number(totals.total) || 0,
    average: Math.round((Number(totals.average) || 0) * 10) / 10,
    counts
  };
}

/* ------------------------------------------------------------------- list */
router.get('/reviews', asyncHandler(async (req, res) => {
  const where = ["status = 'approved'"];
  const params = {};

  const rating = toInt(req.query.rating, 0);
  if (rating >= 1 && rating <= 5) {
    where.push('rating = :rating');
    params.rating = rating;
  }
  const poojaId = cleanString(req.query.poojaId, 64);
  if (poojaId) {
    where.push('pooja_id = :poojaId');
    params.poojaId = poojaId;
  }
  const panditId = cleanString(req.query.panditId, 64);
  if (panditId) {
    where.push('pandit_id = :panditId');
    params.panditId = panditId;
  }

  const { limit, offset } = limitOffset(req.query, 9, 60);
  const clause = where.join(' AND ');

  const [rows, total, summary] = await Promise.all([
    db.query(
      `SELECT * FROM reviews WHERE ${clause}
        ORDER BY created_at DESC, id DESC
        LIMIT ${limit} OFFSET ${offset}`,
      params
    ),
    db.one(`SELECT COUNT(*) AS n FROM reviews WHERE ${clause}`, params),
    publishedSummary()
  ]);

  res.json({
    data: {
      reviews: rows.map(mapReview),
      total: Number(total.n) || 0,
      limit,
      offset,
      summary
    }
  });
}));

/* ----------------------------------------------------------------- create */
router.post('/reviews', createLimit, optionalUser, asyncHandler(async (req, res) => {
  const body = req.body || {};

  // Honeypot field, hidden from real visitors. Answer like a success so bots
  // do not learn that they were filtered.
  if (cleanString(body.website, 200)) {
    return res.status(201).json({ data: { status: 'pending' } });
  }

  const name = cleanString(body.name, 120);
  const message = cleanString(body.message, MAX_MESSAGE);
  const rating = toInt(body.rating, 0);

  if (!name || name.length < 2) {
    return res.status(400).json({ error: 'Please share your name (at least 2 characters)' });
  }
  if (!message || message.length < 10) {
    return res.status(400).json({ error: 'Please write at least 10 characters about your experience' });
  }
  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5' });
  }

  // A review is not a link farm. One link is tolerated, more is spam.
  const links = (message.match(/https?:\/\/|www\./gi) || []).length;
  if (links > 1) {
    return res.status(400).json({ error: 'Please remove the links from your review' });
  }

  // Never trust the names the browser sends: look the pooja and pandit up.
  let poojaId = cleanString(body.poojaId, 64);
  let poojaName = null;
  if (poojaId) {
    const pooja = await db.one('SELECT id, name FROM poojas WHERE id = :id AND active = 1', { id: poojaId });
    if (pooja) poojaName = pooja.name;
    else poojaId = null;
  }

  let panditId = cleanString(body.panditId, 64);
  let panditName = null;
  if (panditId) {
    const pandit = await db.one('SELECT id, name FROM pandits WHERE id = :id AND active = 1', { id: panditId });
    if (pandit) panditName = pandit.name;
    else panditId = null;
  }

  const result = await db.query(
    `INSERT INTO reviews
       (user_id, name, city, pooja_id, pooja_name, pandit_id, pandit_name, rating, title, message, status)
     VALUES
       (:userId, :name, :city, :poojaId, :poojaName, :panditId, :panditName, :rating, :title, :message, 'pending')`,
    {
      userId: req.user ? req.user.sub : null,
      name,
      city: cleanString(body.city, 120),
      poojaId,
      poojaName,
      panditId,
      panditName,
      rating,
      title: cleanString(body.title, 190),
      message
    }
  );

  res.status(201).json({ data: { id: result.insertId, status: 'pending' } });
}));

module.exports = router;
