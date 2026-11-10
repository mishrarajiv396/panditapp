'use strict';

const jwt = require('jsonwebtoken');
const config = require('../config');

const KIND_ADMIN = 'admin';
const KIND_USER = 'user';

function bearerToken(req) {
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7).trim() : '';
}

/* --------------------------------------------------------------- admin JWT */
function sign(admin) {
  return jwt.sign(
    { kind: KIND_ADMIN, sub: admin.id, email: admin.email, role: admin.role, name: admin.name },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
}

function requireAdmin(req, res, next) {
  const token = bearerToken(req);
  if (!token) return res.status(401).json({ error: 'Missing bearer token' });
  try {
    const payload = jwt.verify(token, config.jwtSecret);
    // Customer tokens share the same secret, so the kind claim keeps the two
    // worlds apart. Tokens issued before this check have no kind and are
    // treated as admin tokens only when they carry an admin role.
    const kind = payload.kind || (payload.role ? KIND_ADMIN : '');
    if (kind !== KIND_ADMIN) {
      return res.status(403).json({ error: 'This token cannot access admin routes' });
    }
    req.admin = payload;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/* ---------------------------------------------------------------- user JWT */
function signUser(user) {
  return jwt.sign(
    {
      kind: KIND_USER,
      sub: user.id,
      email: user.email || null,
      phone: user.phone || null,
      name: user.name
    },
    config.jwtSecret,
    { expiresIn: config.userJwtExpiresIn }
  );
}

function requireUser(req, res, next) {
  const token = bearerToken(req);
  if (!token) return res.status(401).json({ error: 'Please sign in to continue' });
  try {
    const payload = jwt.verify(token, config.jwtSecret);
    if (payload.kind !== KIND_USER) {
      return res.status(403).json({ error: 'This token is not a customer session' });
    }
    req.user = payload;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Your session expired, please sign in again' });
  }
}

/** Attach req.user when a valid customer token is present, never reject. */
function optionalUser(req, res, next) {
  const token = bearerToken(req);
  if (!token) return next();
  try {
    const payload = jwt.verify(token, config.jwtSecret);
    if (payload.kind === KIND_USER) req.user = payload;
  } catch (err) {
    /* anonymous request — ignore a stale token */
  }
  return next();
}

module.exports = {
  KIND_ADMIN,
  KIND_USER,
  sign,
  requireAdmin,
  signUser,
  requireUser,
  optionalUser
};
