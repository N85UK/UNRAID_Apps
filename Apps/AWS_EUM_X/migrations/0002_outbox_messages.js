const fs = require('fs');
const path = require('path');

exports.up = async function (dataDir, logger) {
  const outbox = { lastId: 0, jobs: [] };
  const messages = { messages: [] };
  const conversations = { conversations: [] };
  const keywords = { keywords: [] };
  const outboxFile = path.join(dataDir, 'outbox.json');
  const messagesFile = path.join(dataDir, 'messages.json');
  const convFile = path.join(dataDir, 'conversations.json');
  const keywordsFile = path.join(dataDir, 'keywords.json');

  if (!fs.existsSync(outboxFile)) fs.writeFileSync(outboxFile, JSON.stringify(outbox, null, 2), { mode: 0o600 });
  if (!fs.existsSync(messagesFile)) fs.writeFileSync(messagesFile, JSON.stringify(messages, null, 2), { mode: 0o600 });
  if (!fs.existsSync(convFile)) fs.writeFileSync(convFile, JSON.stringify(conversations, null, 2), { mode: 0o600 });
  if (!fs.existsSync(keywordsFile)) fs.writeFileSync(keywordsFile, JSON.stringify(keywords, null, 2), { mode: 0o600 });
  // bump metadata version to 2
  const metaFile = path.join(dataDir, 'metadata.json');
  try {
    const m = fs.existsSync(metaFile) ? JSON.parse(fs.readFileSync(metaFile, 'utf8') || '{}') : {};
    m.schemaVersion = Math.max(parseInt(m.schemaVersion || 0, 10), 2);
    fs.writeFileSync(metaFile, JSON.stringify(m, null, 2), { mode: 0o600 });
  } catch (e) { logger && logger.warn && logger.warn({ err: e.message }, 'Failed to bump metadata.json'); }
};
