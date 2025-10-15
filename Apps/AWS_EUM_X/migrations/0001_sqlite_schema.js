const fs = require('fs');
const path = require('path');

exports.up = async function (dataDir, logger) {
  // For sqlite-based persistence, schema is created by the persistence layer.
  // This migration will ensure metadata.json reflects the migration run.
  try {
    const metaFile = path.join(dataDir, 'metadata.json');
    const meta = fs.existsSync(metaFile) ? JSON.parse(fs.readFileSync(metaFile, 'utf8') || '{}') : {};
    meta.schemaVersion = Math.max(parseInt(meta.schemaVersion || 0, 10), 2);
    fs.writeFileSync(metaFile, JSON.stringify(meta, null, 2), { mode: 0o600 });
    logger && logger.info && logger.info({ schemaVersion: meta.schemaVersion }, 'Applied sqlite schema migration (metadata updated)');
  } catch (e) {
    logger && logger.warn && logger.warn({ err: e.message }, 'Failed to update metadata.json for sqlite migration');
  }
};
