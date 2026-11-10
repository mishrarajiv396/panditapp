'use strict';

/** Wrap async route handlers so rejected promises reach the error middleware. */
function asyncHandler(fn) {
  return function wrapped(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/** Parse a JSON column that mysql2 may return as string or object. */
function json(value, fallback) {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch (err) {
      return fallback;
    }
  }
  return value;
}

function cleanString(value, max) {
  if (value === null || value === undefined) return null;
  const s = String(value).trim();
  if (!s) return null;
  return max ? s.slice(0, max) : s;
}

function toInt(value, fallback) {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : fallback;
}

/** Money is never negative, even if a client sends a negative number. */
function toAmount(value) {
  return Math.max(0, toInt(value, 0));
}

/**
 * Accept only a real calendar date in YYYY-MM-DD form. MySQL rejects values
 * such as 2026-02-30 or 2026-13-01 with an error, which used to surface as a
 * 500 for a malformed public booking request.
 */
function isoDateOrNull(value) {
  const s = cleanString(value, 10);
  if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const date = new Date(s + 'T00:00:00.000Z');
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10) === s ? s : null;
}

function limitOffset(query, defaultLimit, maxLimit) {
  const limit = Math.min(Math.max(toInt(query.limit, defaultLimit), 1), maxLimit);
  const offset = Math.max(toInt(query.offset, 0), 0);
  return { limit, offset };
}

/**
 * Turn a client-supplied timestamp into a real Date. A malformed value used to
 * crash the insert with a MySQL "invalid date" error, and a future date could
 * reorder the admin queue. Anything unparseable falls back to "now"; anything
 * more than five minutes ahead is clamped to now.
 */
function safeDate(value) {
  if (!value) return new Date();
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return new Date();
  const now = Date.now();
  if (date.getTime() > now + 5 * 60 * 1000) return new Date();
  return date;
}

module.exports = {
  asyncHandler, json, cleanString, toInt, toAmount, limitOffset, safeDate, isoDateOrNull
};
