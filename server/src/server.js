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

  const server = app.listen(config.port, () => {
    console.log(`[api] PanditApp listening on http://localhost:${config.port}`);
    console.log(`[api] site        http://localhost:${config.port}/index.html`);
    console.log(`[api] health      http://localhost:${config.port}/api/health`);
  });

  // Render/Railway send SIGTERM on every deploy. Stop accepting connections,
  // let in-flight requests finish, then close the MySQL pool so the platform
  // can replace the instance without dropping a booking mid-write.
  let closing = false;
  function shutdown(signal) {
    if (closing) return;
    closing = true;
    console.log(`[api] ${signal} received — finishing in-flight requests`);
    const force = setTimeout(() => {
      console.error('[api] shutdown timed out, exiting');
      process.exit(1);
    }, 10_000);
    force.unref();

    server.close(async () => {
      clearTimeout(force);
      await db.pool.end().catch(() => {});
      console.log('[api] shutdown complete');
      process.exit(0);
    });
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

start();
