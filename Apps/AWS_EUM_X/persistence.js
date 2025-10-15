const fs = require('fs');
const path = require('path');

function safeWriteAtomic(filePath, data) {
  const tmp = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(tmp, data, { encoding: 'utf8', mode: 0o600 });
  fs.renameSync(tmp, filePath);
}

function readJson(filePath, defaultValue) {
  try {
    if (!fs.existsSync(filePath)) return defaultValue;
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw || 'null') || defaultValue;
  } catch (e) {
    // If file corrupted, return default (we don't crash the app on read errors)
    return defaultValue;
  }
}

class Persistence {
  constructor(baseDir) {
    this.baseDir = baseDir;
    this.outboxFile = path.join(baseDir, 'outbox.json');
    this.messagesFile = path.join(baseDir, 'messages.json');
    this.conversationsFile = path.join(baseDir, 'conversations.json');
    this.keywordsFile = path.join(baseDir, 'keywords.json');
    this.metaFile = path.join(baseDir, 'metadata.json');
    this._initFiles();
  }

  _initFiles() {
    try {
      if (!fs.existsSync(this.baseDir)) fs.mkdirSync(this.baseDir, { recursive: true, mode: 0o700 });
      if (!fs.existsSync(this.outboxFile)) safeWriteAtomic(this.outboxFile, JSON.stringify({ lastId: 0, jobs: [] }, null, 2));
      if (!fs.existsSync(this.messagesFile)) safeWriteAtomic(this.messagesFile, JSON.stringify({ messages: [] }, null, 2));
      if (!fs.existsSync(this.conversationsFile)) safeWriteAtomic(this.conversationsFile, JSON.stringify({ conversations: [] }, null, 2));
      if (!fs.existsSync(this.keywordsFile)) safeWriteAtomic(this.keywordsFile, JSON.stringify({ keywords: [] }, null, 2));
      if (!fs.existsSync(this.metaFile)) safeWriteAtomic(this.metaFile, JSON.stringify({ schemaVersion: 1 }, null, 2));
    } catch (e) {
      // best effort
    }
  }

  _readOutbox() { return readJson(this.outboxFile, { lastId: 0, jobs: [] }); }
  _writeOutbox(obj) { safeWriteAtomic(this.outboxFile, JSON.stringify(obj, null, 2)); }

  enqueueOutbox(origin, phoneNumber, message) {
    const outbox = this._readOutbox();
    const id = (outbox.lastId || 0) + 1;
    const job = {
      id,
      origin: origin || 'default',
      phoneNumber,
      message,
      status: 'queued',
      attempts: 0,
      nextAttemptAt: Date.now(),
      createdAt: Date.now(),
      lastError: null
    };
    outbox.lastId = id;
    outbox.jobs.push(job);
    this._writeOutbox(outbox);
    return job;
  }

  fetchNextJob() {
    const outbox = this._readOutbox();
    const now = Date.now();
    const idx = outbox.jobs.findIndex(j => (j.status === 'queued' || j.status === 'retry') && (!j.nextAttemptAt || j.nextAttemptAt <= now));
    if (idx === -1) return null;
    const job = outbox.jobs[idx];
    job.status = 'processing';
    job.processingAt = Date.now();
    this._writeOutbox(outbox);
    return job;
  }

  updateJobStatus(id, fields) {
    const outbox = this._readOutbox();
    const idx = outbox.jobs.findIndex(j => j.id === id);
    if (idx === -1) return false;
    const job = outbox.jobs[idx];
    Object.assign(job, fields);
    this._writeOutbox(outbox);
    return true;
  }

  getQueueStats() {
    const outbox = this._readOutbox();
    const counts = { queued: 0, processing: 0, sent: 0, failed: 0, retry: 0 };
    outbox.jobs.forEach(j => { counts[j.status] = (counts[j.status] || 0) + 1; });
    return { lastId: outbox.lastId || 0, counts, queueDepth: outbox.jobs.filter(j => j.status === 'queued' || j.status === 'retry').length };
  }

  listQueued(limit = 20) {
    const outbox = this._readOutbox();
    return outbox.jobs.filter(j => j.status === 'queued' || j.status === 'retry').slice(0, limit).map(j => ({ id: j.id, origin: j.origin, phoneNumber: j.phoneNumber, attempts: j.attempts, nextAttemptAt: j.nextAttemptAt, createdAt: j.createdAt }));
  }

  addMessage(record) {
    const doc = readJson(this.messagesFile, { messages: [] });
    doc.messages.push(record);
    safeWriteAtomic(this.messagesFile, JSON.stringify(doc, null, 2));
    // update conversation
    const conv = readJson(this.conversationsFile, { conversations: [] });
    let c = conv.conversations.find(x => x.phone_number === record.from_number || x.phone_number === record.to_number);
    if (!c) {
      c = { phone_number: record.from_number || record.to_number, last_message: record.body, last_message_time: record.timestamp || Date.now(), unread_count: record.direction === 'inbound' ? 1 : 0, created_at: Date.now(), updated_at: Date.now() };
      conv.conversations.push(c);
    } else {
      c.last_message = record.body;
      c.last_message_time = record.timestamp || Date.now();
      if (record.direction === 'inbound') c.unread_count = (c.unread_count || 0) + 1;
      c.updated_at = Date.now();
    }
    safeWriteAtomic(this.conversationsFile, JSON.stringify(conv, null, 2));
  }

  getKeywords() { return readJson(this.keywordsFile, { keywords: [] }).keywords; }

  addKeyword(trigger, response, active = 1) {
    const doc = readJson(this.keywordsFile, { keywords: [] });
    const id = (doc.keywords.reduce((a, b) => Math.max(a, b.id || 0), 0) || 0) + 1;
    doc.keywords.push({ id, trigger, response, active });
    safeWriteAtomic(this.keywordsFile, JSON.stringify(doc, null, 2));
    return id;
  }

  // Simple config helpers for storing small runtime overrides (like per-origin MPS)
  getConfig() {
    const cfgFile = path.join(this.baseDir, 'config.json');
    return readJson(cfgFile, {});
  }

  setConfig(changes) {
    const cfgFile = path.join(this.baseDir, 'config.json');
    const cfg = readJson(cfgFile, {});
    Object.assign(cfg, changes);
    safeWriteAtomic(cfgFile, JSON.stringify(cfg, null, 2));
  }

  setMpsOverride(origin, mps) {
    const cfg = this.getConfig();
    cfg.mps_overrides = cfg.mps_overrides || {};
    cfg.mps_overrides[origin] = mps;
    this.setConfig(cfg);
  }

}

module.exports = { Persistence };
