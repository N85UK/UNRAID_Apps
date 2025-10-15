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
const { PinpointSMSVoiceV2Client, DescribePhoneNumbersCommand } = require('@aws-sdk/client-pinpoint-sms-voice-v2');
require('dotenv').config();

const APP_VERSION = require('./package.json').version || '0.0.0';
const BUILD_TIMESTAMP = process.env.BUILD_TIMESTAMP || new Date().toISOString();
const PORT = parseInt(process.env.PORT, 10) || 80;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');

// Structured logger with optional pretty transport in dev
let transport;
if (process.env.NODE_ENV !== 'production') {
  try {
    // Enable pino-pretty in dev environments when available
    require.resolve('pino-pretty');
    transport = { target: 'pino-pretty' };
  } catch (e) {
    transport = undefined;
  }
}

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  ...(transport ? { transport } : {})
});

// Do NOT print secrets in logs. Only surface whether AWS is configured and the region.
logger.info({ version: APP_VERSION, build: BUILD_TIMESTAMP }, 'Starting AWS_EUM_X');
logger.info({ aws_configured: !!(process.env.AWS_ACCESS_KEY_ID || process.env.AWS_REGION), aws_region: process.env.AWS_REGION || 'eu-west-2' }, 'AWS configuration');

// Ensure data directory exists and is writable
function ensureDataDirectory(dir) {
  try {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
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

// Initialize AWS client without forcing credentials so default provider chain can be used
let smsClient = null;
function initializeAWSClient() {
  try {
    smsClient = new PinpointSMSVoiceV2Client({ region: process.env.AWS_REGION || 'eu-west-2' });
    logger.info({ region: process.env.AWS_REGION || 'eu-west-2' }, 'AWS client initialized (using default credential provider chain if available)');
  } catch (err) {
    logger.error({ err: err.message }, 'Failed to initialize AWS client');
    smsClient = null;
  }
}

initializeAWSClient();

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

// Message parts estimator (simple safe heuristic)
function estimateMessageParts(message) {
  // Ensure we always operate on a string to avoid runtime errors when
  // message is undefined, null, or a non-string value.
  const msgStr = typeof message === 'string' ? message : '';
  const chars = msgStr.length;
  // Treat as UCS-2 (unicode) when non-ascii present — conservative but safe
  const isUcs2 = /[^\x00-\x7F]/.test(msgStr);
  const encoding = isUcs2 ? 'UCS-2' : 'GSM-7';
  const singleLimit = isUcs2 ? 70 : 160;
  const perPart = isUcs2 ? 67 : 153;
  const parts = chars <= singleLimit ? 1 : Math.ceil(chars / perPart);
  return { encoding, chars, parts, perPart, singleLimit };
}

// App
const app = express();
app.use(helmet());

// CSP: secure-by-default. Allow disabling via DISABLE_CSP=true for edge cases.
const disableCsp = String(process.env.DISABLE_CSP || 'false').toLowerCase() === 'true';
if (!disableCsp) {
  app.use(helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'", 'data:'],
      connectSrc: ["'self'"],
      frameAncestors: ["'self'"],
      objectSrc: ["'none'"]
    }
  }));
  logger.info('Content Security Policy enabled');
} else {
  logger.warn('CSP disabled via DISABLE_CSP env var');
}

// Frame options
app.use(helmet.frameguard({ action: 'sameorigin' }));

app.use(cors());
app.use(bodyParser.json({ limit: '512kb' }));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Static assets
app.use('/css', express.static(path.join(__dirname, 'public', 'css')));
app.use('/js', express.static(path.join(__dirname, 'public', 'js')));
// Serve icons placed next to the app source
app.use('/icons', express.static(path.join(__dirname, 'icons')));
app.use(express.static(path.join(__dirname, 'public')));

// Health
app.get('/health', (req, res) => {
  res.json({ status: 'ok', version: APP_VERSION, build: BUILD_TIMESTAMP, uptime: Math.floor(process.uptime()) });
});

// Readiness probe for AWS (returns 200/503 based on AWS connectivity)
app.get('/probe/aws', async (req, res) => {
  const result = await probeAWS();
  if (result.ok) return res.json({ ready: true, ...result });
  return res.status(503).json({ ready: false, ...result });
});

app.get('/ready', async (req, res) => {
  const result = await probeAWS();
  res.json({ ready: result.ok, aws: result });
});

// First-run UI
app.get('/', (req, res) => {
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

// API: Dry-run send (safe test) — does local validation and parts estimation only
app.post('/api/test/dry-run', async (req, res) => {
  const { DestinationPhoneNumber, MessageBody } = req.body || {};
  if (!DestinationPhoneNumber || !MessageBody) return res.status(400).json({ error: 'Missing DestinationPhoneNumber or MessageBody' });
  const e164 = /^\+[1-9]\d{6,14}$/;
  if (!e164.test(DestinationPhoneNumber)) return res.status(400).json({ error: 'Invalid DestinationPhoneNumber (must be E.164)' });

  // Estimate message parts and return a safe result without calling AWS
  const estimate = estimateMessageParts(MessageBody);
  return res.json({ ok: true, dryRun: true, estimate });
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

// Centralized estimation endpoint to avoid duplicating logic between the
// frontend and backend. Client can call this endpoint for live estimation.
app.post('/api/estimate', (req, res) => {
  const { message } = req.body || {};
  try {
    const estimate = estimateMessageParts(message);
    return res.json({ ok: true, estimate });
  } catch (err) {
    logger.warn({ err: err.message }, 'Estimate failed');
    return res.status(400).json({ ok: false, error: 'Estimate failed' });
  }
});
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

// Error handler — keep messages generic to avoid leaking sensitive info
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
