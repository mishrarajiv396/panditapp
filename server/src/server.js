'use strict';

const app = require('./app');
const config = require('./config');
const db = require('./db');

async function start() {
  try {
    await db.ping();
    console.log(`[db] connected to ${config.db.host}:${config.db.port}/${config.db.database}`);
  } catch (err) {
    console.error('[db] connection failed:', err.message);
    console.error('[db] check server/.env (DB_USER / DB_PASSWORD) and run `npm run setup` first.');
    process.exitCode = 1;
    return;
  }

  app.listen(config.port, () => {
    console.log(`[api] PanditApp listening on http://localhost:${config.port}`);
    console.log(`[api] site        http://localhost:${config.port}/index.html`);
    console.log(`[api] health      http://localhost:${config.port}/api/health`);
  });
}

start();

process.on('SIGINT', async () => {
  await db.pool.end().catch(() => {});
  process.exit(0);
});
