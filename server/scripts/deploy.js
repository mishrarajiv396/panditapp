'use strict';

/**
 * Production boot: wait for MySQL, apply the schema, seed the catalogue once,
 * then start the Express server. `AUTO_SETUP=false` skips migrate/seed when the
 * database is managed separately.
 */

const path = require('path');
const { spawnSync } = require('child_process');
const db = require('../src/db');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForDb(attempts = 30, delayMs = 3000) {
  for (let i = 1; i <= attempts; i += 1) {
    try {
      await db.ping();
      console.log(`[deploy] database ready (attempt ${i})`);
      return;
    } catch (err) {
      console.log(`[deploy] waiting for database ${i}/${attempts}: ${err.message}`);
      await sleep(delayMs);
    }
  }
  throw new Error('Database did not become ready in time');
}

function runScript(file) {
  const result = spawnSync(process.execPath, [path.join(__dirname, file)], {
    cwd: path.join(__dirname, '..'),
    env: process.env,
    stdio: 'inherit'
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${file} exited with code ${result.status}`);
}

async function main() {
  await waitForDb();

  if (process.env.AUTO_SETUP !== 'false') {
    runScript('migrate.js');
    runScript('seed.js');
  }

  // server.js performs its own final ping and starts listening.
  require('../src/server');
}

main().catch((err) => {
  console.error('[deploy] failed:', err.message);
  process.exit(1);
});
