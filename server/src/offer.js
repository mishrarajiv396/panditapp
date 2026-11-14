'use strict';

/* ---------------------------------------------------------------------------
   Launch offer: 20% off every pooja for the first 100 bookings.

   The counter is the real number of bookings stored in MySQL. Cancelled and
   refunded bookings release their slot, so the remaining count always matches
   what the dashboard shows. This module is imported by both the public
   /api/offer route and the booking pricer, which keeps the teaser, the booking
   summary and the amount charged in agreement.
   --------------------------------------------------------------------------- */

const db = require('./db');

const OFFER = {
  code: 'TOP100',
  percent: 20,
  limit: 100
};

// Cancelled and refunded bookings do not consume a launch slot.
const LIVE_BOOKING_SQL =
  "SELECT COUNT(*) AS n FROM bookings WHERE status NOT IN ('Cancelled', 'Refunded')";

async function claimed() {
  const row = await db.one(LIVE_BOOKING_SQL);
  return Number(row && row.n) || 0;
}

async function status() {
  const used = await claimed();
  const remaining = Math.max(0, OFFER.limit - used);
  return {
    code: OFFER.code,
    percent: OFFER.percent,
    limit: OFFER.limit,
    claimed: used,
    remaining,
    active: remaining > 0
  };
}

/**
 * Apply the launch discount to a catalogue list price.
 * `active` is passed in so a booking is priced against one snapshot of the
 * counter instead of reading it twice.
 */
function quote(listPrice, active) {
  const list = Math.max(0, Number(listPrice) || 0);
  if (!active) return { list, price: list, discount: 0, percent: 0 };
  const price = Math.round(list * (100 - OFFER.percent) / 100);
  return {
    list,
    price,
    discount: list - price,
    percent: OFFER.percent
  };
}

module.exports = { OFFER, claimed, status, quote };
