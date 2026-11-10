'use strict';
const db = require('../src/db');
(async () => {
  const users = await db.query(
    "SELECT id, name, email FROM users WHERE email LIKE 'e2e%@example.com' OR email LIKE 'qa%@example.com' OR email LIKE 'smoke%@example.com' OR email LIKE 'link%@example.com' OR name IN ('E2E Bhakt','E2E Bhakt Updated','QA Tester','Smoke Test','Link Test Bhakt')"
  );
  console.log('removing:', JSON.stringify(users));
  if (users.length) {
    const ids = users.map((u) => u.id);
    const ph = ids.map(() => '?').join(',');
    await db.query(`DELETE FROM bookings WHERE user_id IN (${ph})`, ids);
    await db.query(`DELETE FROM orders WHERE user_id IN (${ph})`, ids);
    await db.query(`DELETE FROM users WHERE id IN (${ph})`, ids);
  }
  const left = await db.query('SELECT COUNT(*) AS n FROM users');
  console.log('users remaining:', left[0].n);
  await db.pool.end();
})().catch((e) => { console.error(e); process.exitCode = 1; });
