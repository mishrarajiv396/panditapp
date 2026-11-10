'use strict';

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const config = require('../src/config');

const baseConnection = {
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  ssl: config.db.ssl ? { rejectUnauthorized: false } : undefined,
  multipleStatements: true,
  charset: 'utf8mb4'
};

async function connectToDatabase() {
  try {
    return await mysql.createConnection({ ...baseConnection, database: config.db.database });
  } catch (err) {
    if (err.code !== 'ER_BAD_DB_ERROR') throw err;
    const admin = await mysql.createConnection(baseConnection);
    try {
      await admin.query(
        `CREATE DATABASE IF NOT EXISTS \`${config.db.database}\`
         CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
      );
      console.log(`[migrate] created database "${config.db.database}"`);
    } finally {
      await admin.end();
    }
    return mysql.createConnection({ ...baseConnection, database: config.db.database });
  }
}

async function ensureColumn(conn, table, column, definition) {
  const [rows] = await conn.query(
    `SELECT COUNT(*) AS found
       FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
        AND COLUMN_NAME = ?`,
    [table, column]
  );
  if (Number(rows[0].found) > 0) return;
  await conn.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
  console.log(`[migrate] added ${table}.${column}`);
}

async function main() {
  const schemaPath = path.join(__dirname, '..', 'sql', 'schema.sql');
  let sql = fs.readFileSync(schemaPath, 'utf8');

  // The connection already targets the database, so drop CREATE DATABASE/USE.
  sql = sql
    .replace(/CREATE DATABASE[\s\S]*?;\s*/i, '')
    .replace(/^\s*USE\s+[^;]+;\s*/im, '');

  const conn = await connectToDatabase();
  try {
    await conn.query(sql);

    // CREATE TABLE IF NOT EXISTS does not add columns to tables that already
    // exist, so patch the customer-account links in for older databases.
    await ensureColumn(conn, 'bookings', 'user_id', 'INT UNSIGNED DEFAULT NULL AFTER id');
    await ensureColumn(conn, 'orders', 'user_id', 'INT UNSIGNED DEFAULT NULL AFTER id');

    const [bookingIndex] = await conn.query(
      `SELECT COUNT(*) AS found
         FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'bookings'
          AND INDEX_NAME = 'idx_bookings_user'`
    );
    if (Number(bookingIndex[0].found) === 0) {
      await conn.query('ALTER TABLE bookings ADD INDEX idx_bookings_user (user_id)');
    }

    const [orderIndex] = await conn.query(
      `SELECT COUNT(*) AS found
         FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'orders'
          AND INDEX_NAME = 'idx_orders_user'`
    );
    if (Number(orderIndex[0].found) === 0) {
      await conn.query('ALTER TABLE orders ADD INDEX idx_orders_user (user_id)');
    }

    console.log(`[migrate] schema applied to database "${config.db.database}"`);
    const [tables] = await conn.query('SHOW TABLES');
    console.log('[migrate] tables:', tables.map((row) => Object.values(row)[0]).join(', '));
  } finally {
    await conn.end();
  }
}

main().catch((err) => {
  console.error('[migrate] failed:', err.message);
  process.exitCode = 1;
});
