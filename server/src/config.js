'use strict';

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

function int(value, fallback) {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : fallback;
}

function list(value, fallback) {
  if (!value || value.trim() === '*') return value && value.trim() === '*' ? '*' : fallback;
  return value.split(',').map((v) => v.trim()).filter(Boolean);
}

function bool(value) {
  return ['1', 'true', 'yes', 'on'].includes(String(value || '').trim().toLowerCase());
}

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: int(process.env.PORT, 4000),
  db: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: int(process.env.DB_PORT, 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'panditapp',
    // Managed MySQL providers (Aiven, PlanetScale, etc.) require TLS.
    // Render's render.yaml sets DB_SSL=true for this reason.
    ssl: bool(process.env.DB_SSL)
  },
  corsOrigins: list(process.env.CORS_ORIGIN, [
    'http://127.0.0.1:8123',
    'http://localhost:8123',
    'http://localhost:4000',
    'http://127.0.0.1:4000'
  ]),
  jwtSecret: process.env.JWT_SECRET || 'dev-only-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '12h',
  userJwtExpiresIn: process.env.USER_JWT_EXPIRES_IN || '30d',
  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@panditapp.local',
    password: process.env.ADMIN_PASSWORD || 'ChangeMe123!',
    name: process.env.ADMIN_NAME || 'Site Admin'
  }
};
