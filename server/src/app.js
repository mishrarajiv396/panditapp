'use strict';

const path = require('path');
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const config = require('./config');
const db = require('./db');
const securityHeaders = require('./middleware/security');

const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1);

/* ------------------------------------------------------- security + gzip */
// Headers first so every response (API, HTML, assets, errors) carries them.
app.use(securityHeaders);
// The site ships ~2 MB of JS/CSS/fonts; gzip cuts the wire size by roughly
// two thirds. Express/compression skips tiny bodies and already-encoded ones.
app.use(compression());

/* ------------------------------------------------------------------- CORS */
const allowAll = config.corsOrigins === '*';
app.use((req, res, next) => {
  cors({
    origin(origin, callback) {
      if (!origin || allowAll || config.corsOrigins.includes(origin)) return callback(null, true);
      // A single-service deploy serves the site and the API from the same host,
      // so allow same-host origins (Railway/Render/custom domain/tunnel) even
      // when CORS_ORIGIN was not updated. Separate frontend domains still need
      // to be added to CORS_ORIGIN explicitly.
      try {
        if (new URL(origin).host === req.headers.host) return callback(null, true);
      } catch (err) { /* malformed Origin header */ }
      return callback(new Error('Origin not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })(req, res, next);
});

app.use(express.json({ limit: '256kb' }));
app.use(express.urlencoded({ extended: false }));

app.use('/api', (req, res, next) => {
  // Booking lookups carry a gate OTP and auth responses carry tokens: no API
  // response may sit in a shared or browser cache.
  res.set('Cache-Control', 'no-store');
  next();
});

/* --------------------------------------------------------------- API routes */
app.get('/api/health', async (req, res) => {
  try {
    await db.ping();
    res.json({ ok: true, service: 'panditapp-api', env: config.env, time: new Date().toISOString() });
  } catch (err) {
    res.status(503).json({ ok: false, error: 'Database unavailable' });
  }
});

app.use('/api', require('./routes/catalog'));
app.use('/api', require('./routes/offer'));
app.use('/api', require('./routes/bookings'));
app.use('/api', require('./routes/forms'));
app.use('/api', require('./routes/reviews'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));

app.use('/api', (req, res) => res.status(404).json({ error: 'API route not found' }));

/* --------------------------------------------- serve the static site itself */
const siteRoot = path.resolve(__dirname, '..', '..');

// The admin dashboard is not linked anywhere publicly. When ADMIN_ACCESS_KEY is
// set, /admin.html only opens with the secret link (?key=...) once; the key is
// then kept in a short-lived httpOnly cookie so in-page navigation keeps working.
const adminAccessKey = (process.env.ADMIN_ACCESS_KEY || '').trim();
const ADMIN_COOKIE = 'pa_admin_gate';

function readCookie(req, name) {
  const raw = req.headers.cookie || '';
  for (const part of raw.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    if (part.slice(0, idx).trim() === name) return decodeURIComponent(part.slice(idx + 1).trim());
  }
  return '';
}

app.use((req, res, next) => {
  // Never expose backend source, SQL or env files through the static server.
  if (/^\/(server|database)(\/|$)/i.test(req.path)) {
    return res.status(404).send('Not found');
  }
  if (!adminAccessKey) return next();
  if (!/^\/admin(\.html)?\/?$/i.test(req.path)) return next();

  const given = String(req.query.key || '');
  if (given && given === adminAccessKey) {
    res.cookie(ADMIN_COOKIE, adminAccessKey, {
      httpOnly: true,
      sameSite: 'lax',
      secure: req.secure,
      maxAge: 1000 * 60 * 60 * 8,
      path: '/'
    });
    return next();
  }
  if (readCookie(req, ADMIN_COOKIE) === adminAccessKey) return next();
  return res.status(404).type('html').send('<!doctype html><meta charset="utf-8"><title>Not found</title><h1>404</h1><p>Not found.</p>');
});

app.use(express.static(siteRoot, {
  dotfiles: 'deny',
  extensions: ['html'],
  setHeaders(res, filePath) {
    const rel = path.relative(siteRoot, filePath).split(path.sep).join('/');
    // The service worker and HTML must be revalidated so a deploy is picked up
    // on the next load. Fingerprinted assets can be cached for an hour and
    // served stale while the browser refreshes them in the background.
    if (rel === 'sw.js' || rel === 'manifest.webmanifest' || rel.endsWith('.html')) {
      res.set('Cache-Control', 'no-cache');
      return;
    }
    if (rel.startsWith('assets/')) {
      res.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
      return;
    }
    res.set('Cache-Control', 'public, max-age=300');
  }
}));

/* ------------------------------------------------------------- branded 404 */
app.use((req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') return next();
  res.status(404);
  res.set('Cache-Control', 'no-cache');
  res.sendFile(path.join(siteRoot, '404.html'), (err) => {
    if (!err || res.headersSent) return;
    res.type('html').send(
      '<!doctype html><meta charset="utf-8"><title>Page not found — Vedic Pooja</title>' +
      '<h1>404 — Page not found</h1><p><a href="/">Return to the homepage</a></p>'
    );
  });
});

/* ------------------------------------------------------------ error handler */
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err && err.message === 'Origin not allowed by CORS') {
    return res.status(403).json({ error: err.message });
  }
  if (err && err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }
  if (err && err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ error: 'That record already exists' });
  }
  console.error('[api]', err);
  return res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
