'use strict';

const express = require('express');
const { asyncHandler } = require('../middleware/helpers');
const offer = require('../offer');

const router = express.Router();

/**
 * Public: live launch-offer status.
 * The counter is never cached — the teaser and booking summary both poll this
 * so "slots left" always reflects confirmed bookings.
 */
router.get('/offer', asyncHandler(async (req, res) => {
  const data = await offer.status();
  res.set('Cache-Control', 'no-store, max-age=0');
  res.json({ data });
}));

module.exports = router;
