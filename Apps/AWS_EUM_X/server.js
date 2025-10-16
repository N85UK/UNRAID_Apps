/*
 Minimal, modular server for AWS_EUM_X
 - Structured logging (pino)
 - /health, /ready, /probe/aws, /api/test/credentials, /api/test/dry-run
 - Static UI (first-run wizard)
 - No secrets logged in plain text
*/

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const cors = require('cors');
const pino = require('pino');
const { PinpointSMSVoiceV2Client, DescribePhoneNumbersCommand, SendTextMessageCommand } = require('@aws-sdk/client-pinpoint-sms-voice-v2');
require('dotenv').config();

const APP_VERSION = require('./package.json').version || '0.0.0';
const BUILD_TIMESTAMP = process.env.BUILD_TIMESTAMP || new Date().toISOString();
const PORT = parseInt(process.env.PORT, 10) || 80;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');

// Structured logger with optional pretty transport in dev
let transport;
if (process.env.NODE_ENV !== 'production') {
  try {
    // Only enable pino-pretty if it's installed (dev environments)
    require.resolve('pino-pretty');
    transport = { target: 'pino-pretty' };
  } catch (e) {
    // pino-pretty not available, fall back to structured JSON logs
    // Avoid printing stack here to prevent leaking environment info
    console.warn('pino-pretty not found; using JSON logs');
    transport = undefined;
  }
}

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  ...(transport ? { transport } : {})
});

// Do NOT print secrets in logs. Only surface whether AWS is configured and the region.
logger.info({ version: APP_VERSION, build: BUILD_TIMESTAMP }, 'Starting AWS_EUM_X');
logger.info({ aws_configured: !!process.env.AWS_ACCESS_KEY_ID, aws_region: process.env.AWS_REGION || 'eu-west-2' }, 'AWS configuration');

// Ensure data directory exists and is writable
function ensureDataDirectory(dir) {
  try {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true, mode: 0o755 });
    const testFile = path.join(dir, '.write-test');
    fs.writeFileSync(testFile, 'ok');
    fs.unlinkSync(testFile);
    logger.info({ dir }, 'Data directory OK');
    return true;
  } catch (err) {
    logger.warn({ err: err.message, dir }, 'Data directory not writable');
    return false;
  }
}

ensureDataDirectory(DATA_DIR);

let smsClient = null;

function initializeAWSClientFromEnv() {
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    try {
      smsClient = new PinpointSMSVoiceV2Client({
        region: process.env.AWS_REGION || 'eu-west-2',
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        }
      });
      logger.info({ region: process.env.AWS_REGION || 'eu-west-2' }, 'AWS client initialized');
    } catch (err) {
      logger.error({ err: err.message }, 'Failed to initialize AWS client from environment');
      smsClient = null;
    }
  } else {
    logger.info('AWS credentials not found in environment; API test endpoints will be available for validation only');
  }
}

initializeAWSClientFromEnv();

async function probeAWS() {
  if (!smsClient) return { ok: false, reason: 'not-configured' };
  try {
    const cmd = new DescribePhoneNumbersCommand({ MaxResults: 1 });
    const res = await smsClient.send(cmd);
    return { ok: true, phoneNumbers: (res.PhoneNumbers || []).length };
  } catch (err) {
    return { ok: false, reason: err.message, code: err.Code || err.name || 'Error' };
  }
}

// App
const app = express();
app.use(helmet());
app.use(cors());
app.use(bodyParser.json({ limit: '512kb' }));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use('/css', express.static(path.join(__dirname, 'public', 'css')));
app.use('/js', express.static(path.join(__dirname, 'public', 'js')));
app.use(express.static(path.join(__dirname, 'public')));

// Health
app.get('/health', (req, res) => {
  res.json({ status: 'ok', version: APP_VERSION, build: BUILD_TIMESTAMP, uptime: process.uptime() });
});

// Readiness probe for AWS (returns 200/503 based on AWS connectivity)
app.get('/probe/aws', async (req, res) => {
  const result = await probeAWS();
  if (result.ok) return res.json({ ready: true, ...result });
  return res.status(503).json({ ready: false, ...result });
});

// Basic readiness summary (non-blocking)
app.get('/ready', async (req, res) => {
  const result = await probeAWS();
  res.json({ ready: result.ok, aws: result });
});

// UI Routes
app.get('/', (req, res) => {
  // Redirect to dashboard if AWS is configured, otherwise first-run
  if (smsClient) {
    res.redirect('/dashboard');
  } else {
    res.render('first-run', { version: APP_VERSION });
  }
});

app.get('/dashboard', async (req, res) => {
  res.render('dashboard', { version: APP_VERSION, build: BUILD_TIMESTAMP });
});

app.get('/settings', (req, res) => {
  const config = {
    aws_region: process.env.AWS_REGION || 'us-east-1',
    rate_limit_parts_per_second: process.env.RATE_LIMIT_PARTS_PER_SECOND || '1.0',
    max_queue_size: process.env.RATE_LIMIT_MAX_QUEUE_SIZE || '200',
    max_retries: process.env.MAX_SEND_RETRIES || '5',
    sends_enabled: process.env.SENDS_ENABLED === 'true',
    simulate_sends: process.env.SENDS_SIMULATE !== 'false',
    log_level: process.env.LOG_LEVEL || 'info',
    log_format: process.env.LOG_FORMAT || 'json',
    history_retention: process.env.HISTORY_RETENTION || '100',
    disable_csp: process.env.DISABLE_CSP !== 'false',
    cache_duration: process.env.CACHE_DURATION || '300000'
  };
  res.render('settings', { config });
});

app.get('/actions', (req, res) => {
  res.render('actions', { version: APP_VERSION });
});

app.get('/observability', (req, res) => {
  const config = {
    log_level: process.env.LOG_LEVEL || 'info'
  };
  res.render('observability', { config });
});

app.get('/first-run', (req, res) => {
  res.render('first-run', { version: APP_VERSION });
});

// API: Test AWS credentials (ephemeral, not stored)
app.post('/api/test/credentials', async (req, res) => {
  const { accessKeyId, secretAccessKey, region } = req.body || {};
  if (!accessKeyId || !secretAccessKey) return res.status(400).json({ error: 'Missing credentials (accessKeyId, secretAccessKey)' });
  const tmpClient = new PinpointSMSVoiceV2Client({ region: region || process.env.AWS_REGION || 'eu-west-2', credentials: { accessKeyId, secretAccessKey } });
  try {
    const cmd = new DescribePhoneNumbersCommand({ MaxResults: 1 });
    const resp = await tmpClient.send(cmd);
    return res.json({ ok: true, phoneNumbers: (resp.PhoneNumbers || []).length });
  } catch (err) {
    logger.warn({ reason: err.message }, 'Credential test failed');
    return res.status(400).json({ ok: false, error: err.message });
  }
});

// API: Dry-run send (safe test)
app.post('/api/test/dry-run', async (req, res) => {
  const { DestinationPhoneNumber, MessageBody, OriginationIdentity } = req.body || {};
  // Basic validation
  if (!DestinationPhoneNumber || !MessageBody) return res.status(400).json({ error: 'Missing DestinationPhoneNumber or MessageBody' });
  // E.164: + followed by 7-15 digits, first digit non-zero
  const e164 = /^\+[1-9]\d{6,14}$/;
  if (!e164.test(DestinationPhoneNumber)) return res.status(400).json({ error: 'Invalid DestinationPhoneNumber (must be E.164)' });

  // Use configured client if present, otherwise ask user to run credentials test
  const clientToUse = smsClient;
  if (!clientToUse) return res.status(400).json({ error: 'AWS client not configured. Use the credentials test endpoint first or set environment variables.' });

  try {
    const params = {
      DestinationPhoneNumber,
      MessageBody,
      OriginationIdentity: OriginationIdentity || undefined,
      DryRun: true
    };
    const cmd = new SendTextMessageCommand(params);
    await clientToUse.send(cmd);
    // If DryRun is supported, AWS will succeed or return a validation error
    return res.json({ ok: true, message: 'DryRun succeeded (no message sent)' });
  } catch (err) {
    logger.warn({ err: err.message }, 'DryRun send failed');
    return res.status(400).json({ ok: false, error: err.message });
  }
});

// ---------------------------
// Message queue + rate limiting
// ---------------------------
const RATE_LIMIT_PARTS_PER_SECOND = parseFloat(process.env.RATE_LIMIT_PARTS_PER_SECOND) || 1.0; // message parts per second
const RATE_LIMIT_MAX_QUEUE_SIZE = parseInt(process.env.RATE_LIMIT_MAX_QUEUE_SIZE, 10) || 200;
const SENDS_ENABLED = process.env.SENDS_ENABLED === 'true'; // default false
const SENDS_SIMULATE = process.env.SENDS_SIMULATE === 'true'; // default false: when true, simulated sends occur even when no AWS config
const MAX_SEND_RETRIES = parseInt(process.env.MAX_SEND_RETRIES, 10) || 5;

// Simple message parts estimator (approximate)
function estimateMessageParts(message) {
  if (!message) return 1;
  // crude non-GSM detection: non-ascii characters treated as UCS-2
  // eslint-disable-next-line no-control-regex
  const nonGsm = /[^\x00-\x7F]/u.test(message);
  if (nonGsm) {
    if (message.length <= 70) return 1;
    return Math.ceil(message.length / 67);
  }
  // GSM fallback
  if (message.length <= 160) return 1;
  return Math.ceil(message.length / 153);
}

// In-memory queue implementation
const processedIdempotency = new Map();
const lastSends = [];

class MessageQueue {
  constructor() {
    this.queue = [];
    this.capacity = RATE_LIMIT_PARTS_PER_SECOND; // tokens per second
    this.tokens = this.capacity;
    this.processing = false;
    // Refill tokens every second
    setInterval(() => { this.tokens = this.capacity; }, 1000);
    // Periodic processor
    setInterval(() => { this.process(); }, 200);
  }

  enqueue(item) {
    const qid = `${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
    item.queueId = qid;
    item.enqueuedAt = Date.now();
    this.queue.push(item);
    return qid;
  }

  async process() {
    if (this.processing) return;
    this.processing = true;
    try {
      while (this.queue.length > 0) {
        const item = this.queue[0];
        if (item.retryAt && item.retryAt > Date.now()) break; // not ready yet
        if (item.parts > this.tokens) break; // wait for tokens
        // consume tokens and pop
        this.tokens -= item.parts;
        this.queue.shift();
        // Attempt send asynchronously (don't block loop)
        this.attemptSend(item).catch(err => {
          logger.warn({ err: err && err.message ? err.message : err }, 'attemptSend unhandled error');
        });
      }
    } finally {
      this.processing = false;
    }
  }

  async attemptSend(item) {
    // idempotency check
    if (item.idempotencyKey && processedIdempotency.has(item.idempotencyKey)) {
      const prev = processedIdempotency.get(item.idempotencyKey);
      lastSends.unshift({ queueId: item.queueId, status: 'duplicate', result: prev, at: Date.now() });
      return prev;
    }

    // Decide whether to actually call AWS or simulate
    const willSimulate = item.simulate || SENDS_SIMULATE || !smsClient || !SENDS_ENABLED;

    try {
      if (willSimulate) {
        const result = { MessageId: `sim-${Date.now()}`, simulated: true };
        processedIdempotency.set(item.idempotencyKey || item.queueId, result);
        lastSends.unshift({ queueId: item.queueId, status: 'sent', result, at: Date.now() });
        // trim history
        if (lastSends.length > 200) lastSends.pop();
        logger.info({ queueId: item.queueId, to: item.DestinationPhoneNumber, simulated: true }, 'Simulated send');
        return result;
      }

      // Real send via AWS
      const params = {
        DestinationPhoneNumber: item.DestinationPhoneNumber,
        MessageBody: item.MessageBody,
        OriginationIdentity: item.OriginationIdentity || undefined,
        MessageType: item.MessageType || undefined,
        MaxPrice: item.MaxPrice || undefined
      };
      const cmd = new SendTextMessageCommand(params);
      const resp = await smsClient.send(cmd);
      lastSends.unshift({ queueId: item.queueId, status: 'sent', result: resp, at: Date.now() });
      if (item.idempotencyKey) processedIdempotency.set(item.idempotencyKey, resp);
      if (lastSends.length > 200) lastSends.pop();
      logger.info({ queueId: item.queueId, to: item.DestinationPhoneNumber, result: (resp && resp.MessageId) || 'ok' }, 'Message sent');
      return resp;
    } catch (err) {
      // Determine if we should retry
      const isThrottle = (err && (err.name === 'ThrottlingException' || err.Code === 'ThrottlingException' || err.statusCode === 429));
      if ((isThrottle || err.retryable) && (item.retries || 0) < MAX_SEND_RETRIES) {
        item.retries = (item.retries || 0) + 1;
        const backoffMs = Math.min(30000, Math.pow(2, item.retries) * 1000);
        item.retryAt = Date.now() + backoffMs;
        this.queue.push(item);
        logger.warn({ queueId: item.queueId, reason: err && err.message }, 'Send failed, scheduled retry');
        return null;
      }
      // Permanent failure
      lastSends.unshift({ queueId: item.queueId, status: 'failed', error: err && err.message, at: Date.now() });
      if (lastSends.length > 200) lastSends.pop();
      logger.error({ queueId: item.queueId, error: err && err.message }, 'Message failed permanently');
      return null;
    }
  }

  status() {
    return { queueDepth: this.queue.length, tokens: this.tokens, capacity: this.capacity };
  }
}

const messageQueue = new MessageQueue();

// API: enqueue a message for sending
app.post('/api/send-sms', async (req, res) => {
  const { DestinationPhoneNumber, MessageBody, OriginationIdentity, MessageType, MaxPrice, idempotencyKey, simulate } = req.body || {};
  if (!DestinationPhoneNumber || !MessageBody) return res.status(400).json({ error: 'Missing DestinationPhoneNumber or MessageBody' });
  const e164 = /^\+[1-9]\d{6,14}$/;
  if (!e164.test(DestinationPhoneNumber)) return res.status(400).json({ error: 'Invalid DestinationPhoneNumber (must be E.164)' });

  if (messageQueue.queue.length >= RATE_LIMIT_MAX_QUEUE_SIZE) return res.status(429).json({ error: 'Queue is full' });

  const parts = estimateMessageParts(MessageBody);
  const queueItem = { DestinationPhoneNumber, MessageBody, OriginationIdentity, MessageType, MaxPrice, parts, idempotencyKey: idempotencyKey || null, simulate: !!simulate };
  const qid = messageQueue.enqueue(queueItem);
  return res.status(202).json({ accepted: true, queueId: qid, parts });
});

app.get('/api/queue/status', (req, res) => {
  return res.json({ ok: true, ...messageQueue.status() });
});

app.get('/api/last-sends', (req, res) => {
  return res.json({ ok: true, history: lastSends.slice(0, 50) });
});

// Config export/import (simple JSON store in data dir)
app.get('/api/config/export', (req, res) => {
  const cfgFile = path.join(DATA_DIR, 'config.json');
  if (!fs.existsSync(cfgFile)) return res.status(404).json({ error: 'No configuration found' });
  try {
    const raw = fs.readFileSync(cfgFile, 'utf8');
    const parsed = JSON.parse(raw || '{}');
    // Remove sensitive keys before export
    ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_SESSION_TOKEN', 'aws_access_key_id', 'aws_secret_access_key', 'aws_session_token']
      .forEach(k => delete parsed[k]);
    res.setHeader('Content-Type', 'application/json');
    return res.send(JSON.stringify(parsed, null, 2));
  } catch (err) {
    logger.warn({ err: err.message }, 'Failed to read or parse configuration for export');
    return res.status(500).json({ error: 'Failed to export configuration' });
  }
});

app.post('/api/config/import', (req, res) => {
  const cfgFile = path.join(DATA_DIR, 'config.json');
  try {
    const incoming = req.body || {};
    // Never persist secrets by import. Remove common AWS secret keys.
    const sanitized = { ...incoming };
    ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_SESSION_TOKEN', 'aws_access_key_id', 'aws_secret_access_key', 'aws_session_token']
      .forEach(k => { if (k in sanitized) delete sanitized[k]; });
    fs.writeFileSync(cfgFile, JSON.stringify(sanitized, null, 2), { mode: 0o600 });
    return res.json({ ok: true, message: 'Configuration saved (secrets removed for safety)' });
  } catch (err) {
    logger.error({ err: err.message }, 'Failed to save configuration');
    return res.status(500).json({ ok: false, error: 'Failed to save configuration' });
  }
});

// Error handler
app.use((err, req, res, _next) => {
  logger.error({ err: err && err.stack ? err.stack : err }, 'Unhandled error');
  res.status(500).json({ error: 'Internal server error' });
});

// Export app for tests and programmatic usage
module.exports = app;

// If run directly, start server
if (require.main === module) {
  app.listen(PORT, () => {
    logger.info({ port: PORT }, `AWS_EUM_X server running on port ${PORT}`);
  });
}
