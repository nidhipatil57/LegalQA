const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PG_BIN = 'D:/Nidhi/LegalQA/pg_bin/pgsql/bin/postgres.exe';
const PG_DATA = 'D:/Nidhi/LegalQA/db_data';
const PORT = '5433';
const LOG_FILE = path.join(PG_DATA, 'server.log');

function isPostgresRunning() {
  try {
    // Check if port 5433 is active on Windows
    const output = execSync(`netstat -ano | findstr :${PORT}`, { encoding: 'utf8' });
    return output.includes('LISTENING');
  } catch (error) {
    return false;
  }
}

function startDatabase() {
  if (isPostgresRunning()) {
    console.log(`[Database Control] PostgreSQL is already running on port ${PORT}.`);
    return;
  }

  console.log(`[Database Control] Starting local PostgreSQL on port ${PORT}...`);
  
  if (!fs.existsSync(PG_BIN)) {
    console.error(`[Database Control] Error: PostgreSQL binary not found at ${PG_BIN}`);
    process.exit(1);
  }

  // Ensure log directory exists
  if (!fs.existsSync(PG_DATA)) {
    console.error(`[Database Control] Error: Data directory not found at ${PG_DATA}`);
    process.exit(1);
  }

  // Open log file stream
  const out = fs.openSync(LOG_FILE, 'a');
  const err = fs.openSync(LOG_FILE, 'a');

  // Spawn postgres.exe as a detached background process
  const child = spawn(PG_BIN, ['-D', PG_DATA, '-p', PORT], {
    detached: true,
    stdio: ['ignore', out, err]
  });

  child.unref();
  
  // Wait a moment and check if it successfully bound to the port
  setTimeout(() => {
    if (isPostgresRunning()) {
      console.log(`[Database Control] PostgreSQL started successfully on port ${PORT}.`);
    } else {
      console.error(`[Database Control] Error: Failed to start PostgreSQL. Check logs at ${LOG_FILE}`);
    }
  }, 2000);
}

function stopDatabase() {
  console.log(`[Database Control] Stopping local PostgreSQL on port ${PORT}...`);
  const PG_CTL = 'D:/Nidhi/LegalQA/pg_bin/pgsql/bin/pg_ctl.exe';
  try {
    if (fs.existsSync(PG_CTL)) {
      execSync(`"${PG_CTL}" -D "${PG_DATA}" stop`, { stdio: 'inherit' });
      console.log('[Database Control] PostgreSQL stopped.');
    } else {
      console.error('[Database Control] pg_ctl.exe not found. Cannot stop gracefully.');
    }
  } catch (error) {
    console.error('[Database Control] Stop failed:', error.message);
  }
}

const action = process.argv[2];
if (action === 'start') {
  startDatabase();
} else if (action === 'stop') {
  stopDatabase();
} else {
  console.log('Usage: node db-control.js [start|stop]');
}
