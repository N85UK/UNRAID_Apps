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

// Structured logger with minimal redaction rules
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV !== 'production' ? { target: 'pino-pretty' } : undefined
});

function redactKey(key) {
  const v = process.env[key];
  if (!v) return null;
  if (v.length <= 8) return '****';
  return `${v.slice(0,4)}****${v.slice(-4)}`;
}

logger.info({ version: APP_VERSION, build: BUILD_TIMESTAMP }, 'Starting AWS_EUM_X');
logger.info({ aws_access_key: redactKey('AWS_ACCESS_KEY_ID') ? redactKey('AWS_ACCESS_KEY_ID') : '(not-configured)' }, 'AWS configuration');

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

// API: Dry-run send (safe test)
app.post('/api/test/dry-run', async (req, res) => {
  const { DestinationPhoneNumber, MessageBody, OriginationIdentity } = req.body || {};
  // Basic validation
  if (!DestinationPhoneNumber || !MessageBody) return res.status(400).json({ error: 'Missing DestinationPhoneNumber or MessageBody' });
  const e164 = /^\+?[1-9][0-9]{1,14}$/;
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

// Config export/import (simple JSON store in data dir)
app.get('/api/config/export', (req, res) => {
  const cfgFile = path.join(DATA_DIR, 'config.json');
  if (!fs.existsSync(cfgFile)) return res.status(404).json({ error: 'No configuration found' });
  const raw = fs.readFileSync(cfgFile, 'utf8');
  res.setHeader('Content-Type', 'application/json');
  return res.send(raw);
});

app.post('/api/config/import', (req, res) => {
  const cfgFile = path.join(DATA_DIR, 'config.json');
  try {
    fs.writeFileSync(cfgFile, JSON.stringify(req.body || {}, null, 2), { mode: 0o600 });
    return res.json({ ok: true, message: 'Configuration saved' });
  } catch (err) {
    logger.error({ err: err.message }, 'Failed to save configuration');
    return res.status(500).json({ ok: false, error: 'Failed to save configuration' });
  }
});

// Error handler
app.use((err, req, res, next) => {
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
