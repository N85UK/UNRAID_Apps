const fs = require('fs');
const path = require('path');

async function runMigrations(dataDir, logger) {
  const migrationsDir = path.join(__dirname);
  const metaFile = path.join(dataDir, 'metadata.json');
  let currentVersion = 0;
  try {
    if (fs.existsSync(metaFile)) {
      const m = JSON.parse(fs.readFileSync(metaFile, 'utf8') || '{}');
      currentVersion = parseInt(m.schemaVersion || 0, 10);
    }
  } catch (e) {
    logger && logger.warn && logger.warn({ err: e.message }, 'Failed to read metadata.json');
  }

  if (!fs.existsSync(migrationsDir)) {
    if (!fs.existsSync(metaFile)) fs.writeFileSync(metaFile, JSON.stringify({ schemaVersion: currentVersion }, null, 2));
    return { ok: true, currentVersion };
  }

  const files = fs.readdirSync(migrationsDir).filter(f => f.match(/^\d+_.*\.js$/)).sort();
  for (const f of files) {
    const v = parseInt(f.split('_')[0], 10);
    if (v > currentVersion) {
      const mod = require(path.join(migrationsDir, f));
      if (mod && typeof mod.up === 'function') {
        await mod.up(dataDir, logger);
        currentVersion = v;
        fs.writeFileSync(metaFile, JSON.stringify({ schemaVersion: currentVersion }, null, 2), { mode: 0o600 });
        logger && logger.info && logger.info({ migration: f, version: currentVersion }, 'Migration applied');
      }
    }
  }
  return { ok: true, currentVersion };
}

module.exports = { runMigrations };
