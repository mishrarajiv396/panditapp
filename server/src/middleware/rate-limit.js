'use strict';

/**
 * Tiny in-memory rate limiter for public write endpoints.
 * Good enough for a single Node process; use Redis behind a load balancer.
 */
function rateLimit({ windowMs = 60_000, max = 20 } = {}) {
  const hits = new Map();

  return function limiter(req, res, next) {
    const key = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    // Keep the in-memory map from growing forever on a long-running process.
    if (hits.size > 5000) {
      for (const [ip, hit] of hits) {
        if (now - hit.start > windowMs) hits.delete(ip);
      }
    }

    const entry = hits.get(key);

    if (!entry || now - entry.start > windowMs) {
      hits.set(key, { start: now, count: 1 });
      return next();
    }

    entry.count += 1;
    if (entry.count > max) {
      res.set('Retry-After', String(Math.ceil((entry.start + windowMs - now) / 1000)));
      return res.status(429).json({ error: 'Too many requests, please try again shortly' });
    }
    return next();
  };
}

module.exports = rateLimit;
