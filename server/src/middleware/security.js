'use strict';

const config = require('../config');

/**
 * Production security headers for the static site and the API.
 *
 * The site ships only same-origin scripts, styles, fonts and images, so the
 * Content-Security-Policy can stay tight. Two inline <script> blocks (the
 * theme bootstrap and the puja-guide data) and inline style attributes mean
 * 'unsafe-inline' is still required for scripts and styles; everything else
 * (third-party scripts, objects, framing by other origins, base hijacking)
 * is blocked. The one image exception is OpenStreetMap raster tiles for the
 * coverage and location-confirmation maps. HSTS and upgrade-insecure-requests
 * are production-only so http://localhost keeps working during development.
 */
function securityHeaders(req, res, next) {
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('X-Frame-Options', 'SAMEORIGIN');
  res.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self), payment=(self)');
  // WhatsApp handoff opens a new tab from a click; keep the opener behaviour
  // that popup blockers and window.open() expect.
  res.set('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');

  const csp = [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'self'",
    "form-action 'self'",
    "img-src 'self' data: blob: https://tile.openstreetmap.org https://*.tile.openstreetmap.org",
    "font-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    "script-src 'self' 'unsafe-inline'",
    "connect-src 'self'",
    "media-src 'self' blob:",
    "worker-src 'self'",
    "manifest-src 'self'"
  ];
  if (config.env === 'production') {
    csp.push('upgrade-insecure-requests');
    res.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  res.set('Content-Security-Policy', csp.join('; '));
  next();
}

module.exports = securityHeaders;
