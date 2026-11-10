'use strict';

const path = require('path');
const express = require('express');
const cors = require('cors');
const config = require('./config');
const db = require('./db');

const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1);

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
app.use('/api', require('./routes/bookings'));
app.use('/api', require('./routes/forms'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));

app.use('/api', (req, res) => res.status(404).json({ error: 'API route not found' }));

/* --------------------------------------------- serve the static site itself */
const siteRoot = path.resolve(__dirname, '..', '..');
app.use((req, res, next) => {
  // Never expose backend source, SQL or env files through the static server.
  if (/^\/(server|database)(\/|$)/i.test(req.path)) {
    return res.status(404).send('Not found');
  }
  return next();
});
app.use(express.static(siteRoot, { dotfiles: 'deny', extensions: ['html'] }));

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
