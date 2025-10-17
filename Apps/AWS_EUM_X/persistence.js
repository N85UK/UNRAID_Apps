const fs = require('fs');
const path = require('path');

// Use better-sqlite3 for synchronous SQLite access
let Database;
try { Database = require('better-sqlite3'); } catch (e) { Database = null; }

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
}

class Persistence {
  constructor(baseDir) {
    this.baseDir = baseDir;
    ensureDir(baseDir);
    this.dbFile = path.join(baseDir, 'messages.db');
    if (!Database) throw new Error('better-sqlite3 is required for SQLite persistence but is not installed');
    this.db = new Database(this.dbFile);
    this._initSchema();
  }

  _initSchema() {
    const db = this.db;
    db.pragma('journal_mode = WAL');
    db.prepare(`CREATE TABLE IF NOT EXISTS meta (k TEXT PRIMARY KEY, v TEXT)`).run();
    
    // Users table for authentication
    db.prepare(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      totp_secret TEXT,
      totp_enabled INTEGER DEFAULT 0,
      created_at INTEGER DEFAULT (cast(strftime('%s','now') as integer) * 1000)
    )`).run();
    
    db.prepare(`CREATE TABLE IF NOT EXISTS outbox (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      origin TEXT,
      phone_number TEXT,
      message TEXT,
      status TEXT,
      attempts INTEGER DEFAULT 0,
      next_attempt_at INTEGER,
      created_at INTEGER DEFAULT (cast(strftime('%s','now') as integer) * 1000),
      processing_at INTEGER,
      last_error TEXT,
      result TEXT
    )`).run();
    db.prepare(`CREATE INDEX IF NOT EXISTS idx_outbox_status_next ON outbox(status, next_attempt_at)`).run();
    db.prepare(`CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      message_id TEXT UNIQUE,
      from_number TEXT,
      to_number TEXT,
      body TEXT,
      direction TEXT,
      status TEXT,
      timestamp INTEGER,
      created_at INTEGER DEFAULT (cast(strftime('%s','now') as integer) * 1000)
    )`).run();
    db.prepare(`CREATE INDEX IF NOT EXISTS idx_messages_from ON messages(from_number)`).run();
    db.prepare(`CREATE INDEX IF NOT EXISTS idx_messages_to ON messages(to_number)`).run();
    db.prepare(`CREATE TABLE IF NOT EXISTS conversations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone_number TEXT UNIQUE,
      last_message TEXT,
      last_message_time INTEGER,
      unread_count INTEGER DEFAULT 0,
      created_at INTEGER DEFAULT (cast(strftime('%s','now') as integer) * 1000),
      updated_at INTEGER DEFAULT (cast(strftime('%s','now') as integer) * 1000)
    )`).run();
    db.prepare(`CREATE TABLE IF NOT EXISTS keywords (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trigger TEXT UNIQUE,
      response TEXT,
      active INTEGER DEFAULT 1,
      created_at INTEGER DEFAULT (cast(strftime('%s','now') as integer) * 1000),
      updated_at INTEGER DEFAULT (cast(strftime('%s','now') as integer) * 1000)
    )`).run();
    db.prepare(`CREATE TABLE IF NOT EXISTS config (k TEXT PRIMARY KEY, v TEXT)`).run();
    const row = db.prepare('SELECT v FROM meta WHERE k = ?').get('schemaVersion');
    if (!row) db.prepare('INSERT OR REPLACE INTO meta (k, v) VALUES (?, ?)').run('schemaVersion', JSON.stringify(1));
  }

  enqueueOutbox(origin, phoneNumber, message) {
    const now = Date.now();
    const stmt = this.db.prepare('INSERT INTO outbox (origin, phone_number, message, status, next_attempt_at, created_at) VALUES (?, ?, ?, ?, ?, ?)');
    const info = stmt.run(origin || 'default', phoneNumber, message, 'queued', now, now);
    return { id: info.lastInsertRowid, origin: origin || 'default', phoneNumber, message, status: 'queued', attempts: 0, nextAttemptAt: now, createdAt: now };
  }

  fetchNextJob() {
    const now = Date.now();
    const job = this.db.prepare("SELECT id, origin, phone_number AS phoneNumber, message, attempts, next_attempt_at AS nextAttemptAt, created_at AS createdAt FROM outbox WHERE status IN ('queued','retry') AND (next_attempt_at IS NULL OR next_attempt_at <= ?) ORDER BY created_at LIMIT 1").get(now);
    if (!job) return null;
    this.db.prepare('UPDATE outbox SET status = ?, processing_at = ? WHERE id = ?').run('processing', Date.now(), job.id);
    return Object.assign({}, job, { status: 'processing' });
  }

  updateJobStatus(id, fields) {
    const updates = [];
    const values = [];
    for (const k of Object.keys(fields)) {
      if (k === 'nextAttemptAt') { updates.push('next_attempt_at = ?'); values.push(fields[k]); }
      else if (k === 'lastError') { updates.push('last_error = ?'); values.push(fields[k]); }
      else if (k === 'result') { updates.push('result = ?'); values.push(JSON.stringify(fields[k])); }
      else if (k === 'status') { updates.push('status = ?'); values.push(fields[k]); }
      else if (k === 'attempts') { updates.push('attempts = ?'); values.push(fields[k]); }
      else if (k === 'sentAt') { updates.push('processing_at = ?'); values.push(fields[k]); }
    }
    if (!updates.length) return false;
    values.push(id);
    const sql = `UPDATE outbox SET ${updates.join(', ')} WHERE id = ?`;
    const info = this.db.prepare(sql).run(...values);
    return info.changes > 0;
  }

  getQueueStats() {
    const rows = this.db.prepare('SELECT status, COUNT(*) AS cnt FROM outbox GROUP BY status').all();
    const counts = rows.reduce((acc, r) => { acc[r.status] = r.cnt; return acc; }, {});
    const qDepth = this.db.prepare("SELECT COUNT(*) AS cnt FROM outbox WHERE status IN ('queued','retry')").get().cnt;
    const lastIdRow = this.db.prepare('SELECT MAX(id) AS lastId FROM outbox').get();
    return { lastId: lastIdRow.lastId || 0, counts, queueDepth: qDepth };
  }

  listQueued(limit = 20) {
    const rows = this.db.prepare("SELECT id, origin, phone_number AS phoneNumber, attempts, next_attempt_at AS nextAttemptAt, created_at AS createdAt FROM outbox WHERE status IN ('queued','retry') ORDER BY created_at LIMIT ?").all(limit);
    return rows;
  }

  addMessage(record) {
    try {
      const stmt = this.db.prepare('INSERT OR IGNORE INTO messages (message_id, from_number, to_number, body, direction, status, timestamp, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
      stmt.run(record.message_id, record.from_number, record.to_number, record.body, record.direction, record.status || 'received', record.timestamp || Date.now(), record.created_at || Date.now());
    } catch (e) { /* ignore duplicate messages */ }
    try {
      const convStmt = this.db.prepare('SELECT * FROM conversations WHERE phone_number = ?');
      const existing = convStmt.get(record.from_number) || convStmt.get(record.to_number);
      if (!existing) {
        this.db.prepare('INSERT INTO conversations (phone_number, last_message, last_message_time, unread_count, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)').run(record.from_number || record.to_number, record.body, record.timestamp || Date.now(), record.direction === 'inbound' ? 1 : 0, Date.now(), Date.now());
      } else {
        this.db.prepare('UPDATE conversations SET last_message = ?, last_message_time = ?, unread_count = ?, updated_at = ? WHERE phone_number = ?').run(record.body, record.timestamp || Date.now(), (existing.unread_count || 0) + (record.direction === 'inbound' ? 1 : 0), Date.now(), existing.phone_number);
      }
    } catch (e) { /* ignore conversation update errors */ }
  }

  getKeywords() { return this.db.prepare('SELECT id, trigger, response, active FROM keywords').all(); }

  addKeyword(trigger, response, active = 1) { const info = this.db.prepare('INSERT INTO keywords (trigger, response, active) VALUES (?, ?, ?)').run(trigger, response, active ? 1 : 0); return info.lastInsertRowid; }

  getConfig() { const row = this.db.prepare('SELECT v FROM config WHERE k = ?').get('config'); if (!row) return {}; try { return JSON.parse(row.v || '{}'); } catch (e) { return {}; } }

  setConfig(changes) { const cur = this.getConfig(); const merged = Object.assign({}, cur, changes); this.db.prepare('INSERT OR REPLACE INTO config (k, v) VALUES (?, ?)').run('config', JSON.stringify(merged)); }

  // Credential storage (encrypted in production, consider using encryption at rest)
  saveCredentials(accessKeyId, secretAccessKey, region) {
    const credentials = { accessKeyId, secretAccessKey, region, savedAt: Date.now() };
    this.db.prepare('INSERT OR REPLACE INTO config (k, v) VALUES (?, ?)').run('aws_credentials', JSON.stringify(credentials));
  }

  getCredentials() {
    const row = this.db.prepare('SELECT v FROM config WHERE k = ?').get('aws_credentials');
    if (!row) return null;
    try {
      return JSON.parse(row.v || 'null');
    } catch (e) {
      return null;
    }
  }

  clearCredentials() {
    this.db.prepare('DELETE FROM config WHERE k = ?').run('aws_credentials');
  }

  setMpsOverride(origin, mps) { const cfg = this.getConfig(); cfg.mps_overrides = cfg.mps_overrides || {}; cfg.mps_overrides[origin] = mps; this.setConfig(cfg); }

  findMessageByBody(substr) { return this.db.prepare('SELECT * FROM messages WHERE body LIKE ? ORDER BY created_at DESC LIMIT 1').get(`%${substr}%`); }

  // User authentication methods
  createUser(username, passwordHash) {
    try {
      const info = this.db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').run(username, passwordHash);
      return { id: info.lastInsertRowid, username };
    } catch (err) {
      if (err.message && err.message.includes('UNIQUE')) {
        throw new Error('Username already exists');
      }
      throw err;
    }
  }

  getUser(username) {
    return this.db.prepare('SELECT id, username, password_hash, totp_secret, totp_enabled, created_at FROM users WHERE username = ?').get(username);
  }

  getUserById(id) {
    return this.db.prepare('SELECT id, username, password_hash, totp_secret, totp_enabled, created_at FROM users WHERE id = ?').get(id);
  }

  hasAnyUsers() {
    const row = this.db.prepare('SELECT COUNT(*) as count FROM users').get();
    return row.count > 0;
  }

  getSessionSecret() {
    const row = this.db.prepare('SELECT v FROM config WHERE k = ?').get('session_secret');
    if (row) {
      try {
        return JSON.parse(row.v);
      } catch (e) {
        // Fall through to generate new secret
      }
    }
    // Generate and save a new secret
    const crypto = require('crypto');
    const secret = crypto.randomBytes(64).toString('hex');
    this.db.prepare('INSERT OR REPLACE INTO config (k, v) VALUES (?, ?)').run('session_secret', JSON.stringify(secret));
    return secret;
  }

  // 2FA methods
  save2FASecret(userId, secret) {
    this.db.prepare('UPDATE users SET totp_secret = ? WHERE id = ?').run(secret, userId);
  }

  enable2FA(userId) {
    this.db.prepare('UPDATE users SET totp_enabled = 1 WHERE id = ?').run(userId);
  }

  disable2FA(userId) {
    this.db.prepare('UPDATE users SET totp_enabled = 0, totp_secret = NULL WHERE id = ?').run(userId);
  }

  get2FASecret(userId) {
    const user = this.getUserById(userId);
    return user?.totp_secret || null;
  }

  is2FAEnabled(userId) {
    const user = this.getUserById(userId);
    return user?.totp_enabled === 1;
  }
}

module.exports = { Persistence };
