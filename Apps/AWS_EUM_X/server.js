/*
 Minimal, modular server for AWS_EUM_X
 - Structured logging (pino)
 - /health, /ready, /probe/aws, /api/test/credentials, /api/test/dry-run
 - /api/send-sms with rate-limited queueing and backoff
 - /webhook/sns with signature verification
 - Migration runner for DATA_DIR
*/

const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
const https = require('https');
const crypto = require('crypto');
const helmet = require('helmet');
const cors = require('cors');
const pino = require('pino');
const { PinpointSMSVoiceV2Client, DescribePhoneNumbersCommand, DescribeSenderIdsCommand, SendTextMessageCommand } = require('@aws-sdk/client-pinpoint-sms-voice-v2');
require('dotenv').config();

const APP_VERSION = require('./package.json').version || '0.0.0';
const BUILD_TIMESTAMP = process.env.BUILD_TIMESTAMP || new Date().toISOString();
const PORT = parseInt(process.env.PORT, 10) || 8080;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');

// runtime configuration for send throttling/backoff
const DEFAULT_MPS = parseFloat(process.env.DEFAULT_MPS || '1.0');
const SEND_MAX_RETRIES = parseInt(process.env.SEND_MAX_RETRIES || '5', 10);
const SEND_BASE_BACKOFF_MS = parseInt(process.env.SEND_BASE_BACKOFF_MS || '500', 10);

// Structured logger with optional pretty transport in dev
let transport;
if (process.env.NODE_ENV !== 'production') {
  try { require.resolve('pino-pretty'); transport = { target: 'pino-pretty' }; } catch (e) { transport = undefined; }
}
const logger = pino({ level: process.env.LOG_LEVEL || 'info', ...(transport ? { transport } : {}) });

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

// AWS client initialization using default credential provider chain
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

// Low cost AWS probe
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

// Message parts estimator (centralised)
function estimateMessageParts(message) {
  const msgStr = typeof message === 'string' ? message : '';
  const chars = msgStr.length;
  // eslint-disable-next-line no-control-regex
  const isUcs2 = /[^\x00-\x7F]/.test(msgStr);
  const encoding = isUcs2 ? 'UCS-2' : 'GSM-7';
  const singleLimit = isUcs2 ? 70 : 160;
  const perPart = isUcs2 ? 67 : 153;
  const parts = chars <= singleLimit ? 1 : Math.ceil(chars / perPart);
  return { encoding, chars, parts, perPart, singleLimit };
}

// Simple MPS-aware rate limiter with in-memory queue and exponential backoff
class RateLimiter {
  constructor(defaultMps = 1.0, tickMs = 250) {
    this.defaultMps = defaultMps;
    this.tickMs = tickMs;
    this.origins = new Map(); // origin -> { tokens, lastRefill, mps, capacity }
    this.queue = [];
    this.timer = setInterval(() => this._tick(), this.tickMs);
    this.timer.unref();
  }

  _now() { return Date.now(); }

  _getOriginState(origin) {
    if (!origin) origin = 'default';
    if (!this.origins.has(origin)) {
      const mps = this.defaultMps;
      const capacity = Math.max(1, Math.ceil(mps * 2));
      this.origins.set(origin, { tokens: mps, lastRefill: this._now(), mps, capacity });
    }
    return this.origins.get(origin);
  }

  _refill(state) {
    const now = this._now();
    const elapsed = (now - state.lastRefill) / 1000.0;
    if (elapsed <= 0) return;
    const add = elapsed * state.mps;
    if (add > 0) {
      state.tokens = Math.min(state.capacity, state.tokens + add);
      state.lastRefill = now;
    }
  }

  _tick() {
    // Refill tokens and try to process queued items
    for (const state of this.origins.values()) this._refill(state);
    this._processQueue();
  }

  _processQueue() {
    const now = this._now();
    // Process queue in FIFO order
    for (let i = 0; i < this.queue.length; ) {
      const job = this.queue[i];
      if (job.nextAttemptAt && job.nextAttemptAt > now) { i++; continue; }
      const state = this._getOriginState(job.origin);
      if (state.tokens >= 1) {
        // consume token and process
        state.tokens -= 1;
        this.queue.splice(i, 1);
        this._attempt(job);
      } else {
        i++;
      }
    }
  }

  _attempt(job) {
    job.attempt = (job.attempt || 0) + 1;
    const promise = job.sendFunc(job.payload);
    promise.then((res) => job.resolve(res)).catch((err) => {
      const retryable = this._isRetryable(err);
      if (retryable && job.attempt <= SEND_MAX_RETRIES) {
        const backoff = SEND_BASE_BACKOFF_MS * Math.pow(2, job.attempt - 1) + Math.floor(Math.random() * 100);
        job.nextAttemptAt = this._now() + backoff;
        this.queue.push(job);
      } else {
        job.reject(err);
      }
    });
  }

  _isRetryable(err) {
    if (!err) return false;
    const name = err.name || err.code || '';
    return ['ThrottlingException', 'TooManyRequestsException', 'Throttling'].includes(name);
  }

  send(origin, payload, sendFunc) {
    return new Promise((resolve, reject) => {
      const job = { origin: origin || 'default', payload, sendFunc, resolve, reject, attempt: 0, nextAttemptAt: this._now() };
      // try immediate attempt by placing at front of queue and processing
      this.queue.push(job);
      this._processQueue();
    });
  }
}

const rateLimiter = new RateLimiter(DEFAULT_MPS);

// allow tuning MPS per origin at runtime
RateLimiter.prototype.setOriginMps = function (origin, mps) {
  const state = this._getOriginState(origin);
  state.mps = parseFloat(mps) || this.defaultMps;
  state.capacity = Math.max(1, Math.ceil(state.mps * 2));
  state.tokens = Math.min(state.tokens, state.capacity);
  logger.info({ origin, mps: state.mps, capacity: state.capacity }, 'Updated origin MPS');
};

// Remove any custom state for an origin (reverts to default behaviour)
RateLimiter.prototype.clearOrigin = function (origin) {
  if (!origin) origin = 'default';
  if (this.origins.has(origin)) {
    this.origins.delete(origin);
    logger.info({ origin }, 'Cleared origin-specific rate limiter state');
  }
};

// Migration runner
async function runMigrations() {
  const migrationsDir = path.join(__dirname, 'migrations');
  const metaFile = path.join(DATA_DIR, 'metadata.json');
  let currentVersion = 0;
  try {
    if (fs.existsSync(metaFile)) {
      const m = JSON.parse(fs.readFileSync(metaFile, 'utf8') || '{}');
      currentVersion = parseInt(m.schemaVersion || 0, 10);
    }
  } catch (e) {
    logger.warn({ err: e.message }, 'Failed to read metadata.json');
  }

  if (!fs.existsSync(migrationsDir)) {
    logger.info('No migrations directory; nothing to run');
    // write metadata if missing
    if (!fs.existsSync(metaFile)) fs.writeFileSync(metaFile, JSON.stringify({ schemaVersion: currentVersion }, null, 2));
    return { ok: true, currentVersion };
  }

  const files = (await fs.promises.readdir(migrationsDir)).filter(f => f.match(/^\d+_.*\.js$/)).sort();
  for (const f of files) {
    const v = parseInt(f.split('_')[0], 10);
    if (v > currentVersion) {
      logger.info({ migration: f }, 'Applying migration');
      const mod = require(path.join(migrationsDir, f));
      if (mod && typeof mod.up === 'function') {
        try {
          await mod.up(DATA_DIR, logger);
          currentVersion = v;
          fs.writeFileSync(metaFile, JSON.stringify({ schemaVersion: currentVersion }, null, 2), { mode: 0o600 });
          logger.info({ migration: f, version: currentVersion }, 'Migration applied');
        } catch (err) {
          logger.error({ err: err.message, migration: f }, 'Migration failed');
          return { ok: false, error: err.message, failedMigration: f };
        }
      }
    }
  }
  return { ok: true, currentVersion };
}

// SNS verification helpers
function validSnsCertHost(hostname) {
  // Allow sns.amazonaws.com and sns.<region>.amazonaws.com
  return /^sns(\.[a-z0-9-]+)?\.amazonaws\.com$/.test(hostname);
}

function buildStringToSign(msg) {
  if (!msg || typeof msg !== 'object') return '';
  const type = msg.Type;
  let s = '';
  if (type === 'Notification') {
    s += 'Message\n' + (msg.Message || '') + '\n';
    s += 'MessageId\n' + (msg.MessageId || '') + '\n';
    if (msg.Subject !== undefined && msg.Subject !== null) s += 'Subject\n' + msg.Subject + '\n';
    s += 'Timestamp\n' + (msg.Timestamp || '') + '\n';
    s += 'TopicArn\n' + (msg.TopicArn || '') + '\n';
    s += 'Type\n' + (msg.Type || '') + '\n';
  } else if (type === 'SubscriptionConfirmation' || type === 'UnsubscribeConfirmation') {
    s += 'Message\n' + (msg.Message || '') + '\n';
    s += 'MessageId\n' + (msg.MessageId || '') + '\n';
    s += 'SubscribeURL\n' + (msg.SubscribeURL || '') + '\n';
    s += 'Timestamp\n' + (msg.Timestamp || '') + '\n';
    s += 'Token\n' + (msg.Token || '') + '\n';
    s += 'TopicArn\n' + (msg.TopicArn || '') + '\n';
    s += 'Type\n' + (msg.Type || '') + '\n';
  }
  return s;
}

function fetchUrlText(urlStr) {
  return new Promise((resolve, reject) => {
    try {
      https.get(urlStr, (res) => {
        let data = '';
        res.setEncoding('utf8');
        res.on('data', (c) => data += c);
        res.on('end', () => resolve({ statusCode: res.statusCode, body: data }));
      }).on('error', (e) => reject(e));
    } catch (e) { reject(e); }
  });
}

async function verifySnsSignature(msg) {
  try {
    if (!msg.SigningCertURL || !msg.Signature) return false;
    const url = new URL(msg.SigningCertURL);
    if (url.protocol !== 'https:' || !validSnsCertHost(url.hostname)) {
      logger.warn({ host: url.hostname }, 'Rejecting SNS message because SigningCertURL host is not valid');
      return false;
    }
    const certResp = await fetchUrlText(msg.SigningCertURL);
    if (!certResp || certResp.statusCode !== 200) return false;
    const cert = certResp.body;
    const stringToSign = buildStringToSign(msg);
    const sigVer = String(msg.SignatureVersion || '1');
    const algo = sigVer === '1' ? 'RSA-SHA1' : 'RSA-SHA256';
    const verifier = crypto.createVerify(algo);
    verifier.update(stringToSign, 'utf8');
    try {
      const ok = verifier.verify(cert, msg.Signature, 'base64');
      return !!ok;
    } catch (e) {
      logger.warn({ err: e.message }, 'Signature verification threw error');
      return false;
    }
  } catch (err) {
    logger.warn({ err: err.message }, 'SNS signature verification failed');
    return false;
  }
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
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:'],
      connectSrc: ["'self'"],
      frameAncestors: ["'self'"],
      objectSrc: ["'none'"]
    }
  }));
  logger.info('Content Security Policy enabled (allows inline scripts/styles for EJS templates)');
} else { logger.warn('CSP disabled via DISABLE_CSP env var'); }

app.use(helmet.frameguard({ action: 'sameorigin' }));
app.use(cors());
app.use(bodyParser.json({ limit: '512kb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '512kb' }));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use('/css', express.static(path.join(__dirname, 'public', 'css')));
app.use('/js', express.static(path.join(__dirname, 'public', 'js')));
app.use('/icons', express.static(path.join(__dirname, 'icons')));
app.use(express.static(path.join(__dirname, 'public')));

// Persistence (SQLite-backed)
const { Persistence } = require('./persistence');
const persistence = new Persistence(DATA_DIR);

// Authentication utilities
const { hashPassword, verifyPassword, requireAuth, requireAuthAPI, requireSetup, requireNoAuth } = require('./lib/auth');
const { generateSecret, generateQRCode, verifyToken } = require('./lib/totp');

// Session configuration
const SQLiteStore = require('connect-sqlite3')(session);
const sessionSecret = persistence.getSessionSecret();
const sessionMiddleware = session({
  store: new SQLiteStore({
    db: 'sessions.db',
    dir: DATA_DIR
  }),
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set true if using HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
});

app.use(sessionMiddleware);

// expose migration runner and persistence for tests and admin
app.runMigrations = runMigrations;
app.persistence = persistence;

// Health
app.get('/health', (req, res) => res.json({ status: 'ok', version: APP_VERSION, build: BUILD_TIMESTAMP, uptime: Math.floor(process.uptime()) }));

// readiness: must have migrations applied and AWS probe OK
let lastMigrationsResult = { ok: true, currentVersion: 0 };
app.get('/ready', async (req, res) => {
  const aws = await probeAWS();
  const migrationsOk = lastMigrationsResult && lastMigrationsResult.ok;
  const ready = aws.ok && migrationsOk;
  res.json({ ready, aws, migrations: lastMigrationsResult });
});

app.get('/probe/aws', async (req, res) => { const r = await probeAWS(); if (r.ok) return res.json({ ready: true, ...r }); return res.status(503).json({ ready: false, ...r }); });

// ========================================
// Authentication Routes
// ========================================

// Root redirect - check if setup required or redirect to dashboard/login
app.get('/', (req, res) => {
  // Check if any users exist
  if (!persistence.hasAnyUsers()) {
    return res.redirect('/auth/setup');
  }
  // If authenticated, go to dashboard
  if (req.session && req.session.userId) {
    return res.redirect('/dashboard');
  }
  // Otherwise, go to login
  return res.redirect('/auth/login');
});

// Setup page (first-time only)
app.get('/auth/setup', (req, res) => {
  if (persistence.hasAnyUsers()) {
    return res.redirect('/auth/login');
  }
  res.render('setup', { version: APP_VERSION, error: null });
});

// Process setup
app.post('/auth/setup', async (req, res) => {
  if (persistence.hasAnyUsers()) {
    return res.redirect('/auth/login');
  }
  
  const { username, password, confirmPassword } = req.body || {};
  
  if (!username || !password) {
    return res.render('setup', { version: APP_VERSION, error: 'Username and password are required' });
  }
  
  if (password !== confirmPassword) {
    return res.render('setup', { version: APP_VERSION, error: 'Passwords do not match' });
  }
  
  if (password.length < 8) {
    return res.render('setup', { version: APP_VERSION, error: 'Password must be at least 8 characters' });
  }
  
  try {
    const passwordHash = await hashPassword(password);
    const user = persistence.createUser(username, passwordHash);
    
    // Auto-login after setup
    req.session.userId = user.id;
    req.session.username = user.username;
    
    logger.info({ username }, 'First user created during setup');
    return res.redirect('/config');
  } catch (err) {
    logger.error({ err: err.message }, 'Failed to create user');
    return res.render('setup', { version: APP_VERSION, error: 'Failed to create user' });
  }
});

// Login page
app.get('/auth/login', requireNoAuth, (req, res) => {
  if (!persistence.hasAnyUsers()) {
    return res.redirect('/auth/setup');
  }
  res.render('login', { version: APP_VERSION, error: null });
});

// Process login
app.post('/auth/login', async (req, res) => {
  const { username, password, totp } = req.body || {};
  
  if (!username || !password) {
    return res.render('login', { version: APP_VERSION, error: 'Username and password are required' });
  }
  
  try {
    const user = persistence.getUser(username);
    
    if (!user) {
      return res.render('login', { version: APP_VERSION, error: 'Invalid username or password' });
    }
    
    const valid = await verifyPassword(password, user.password_hash);
    
    if (!valid) {
      return res.render('login', { version: APP_VERSION, error: 'Invalid username or password' });
    }
    
    // Check if 2FA is enabled
    if (user.totp_enabled && user.totp_secret) {
      if (!totp) {
        return res.render('login', { version: APP_VERSION, error: '2FA code required', require2FA: true, username });
      }
      
      const totpValid = verifyToken(user.totp_secret, totp);
      if (!totpValid) {
        return res.render('login', { version: APP_VERSION, error: 'Invalid 2FA code', require2FA: true, username });
      }
    }
    
    // Create session
    req.session.userId = user.id;
    req.session.username = user.username;
    
    logger.info({ username }, 'User logged in');
    return res.redirect('/dashboard');
  } catch (err) {
    logger.error({ err: err.message }, 'Login error');
    return res.render('login', { version: APP_VERSION, error: 'Login failed' });
  }
});

// Logout
app.get('/auth/logout', (req, res) => {
  const username = req.session?.username;
  req.session.destroy((err) => {
    if (err) {
      logger.error({ err: err.message }, 'Failed to destroy session');
    } else {
      logger.info({ username }, 'User logged out');
    }
    res.redirect('/auth/login');
  });
});

// ========================================
// 2FA Management Routes
// ========================================

// Setup 2FA - Generate QR code
app.post('/auth/2fa/setup', requireAuthAPI, async (req, res) => {
  try {
    const userId = req.session.userId;
    const username = req.session.username;
    
    // Check if already enabled
    if (persistence.is2FAEnabled(userId)) {
      return res.status(400).json({ error: '2FA is already enabled. Disable it first to set up again.' });
    }
    
    // Generate new secret
    const { secret, otpauthUrl } = generateSecret(username);
    
    // Save secret (but don't enable yet)
    persistence.save2FASecret(userId, secret);
    
    // Generate QR code
    const qrCode = await generateQRCode(otpauthUrl);
    
    logger.info({ username }, '2FA setup initiated');
    
    return res.json({
      ok: true,
      secret: secret,
      qrCode: qrCode
    });
  } catch (err) {
    logger.error({ err: err.message }, '2FA setup failed');
    return res.status(500).json({ error: 'Failed to generate 2FA setup' });
  }
});

// Verify and enable 2FA
app.post('/auth/2fa/verify', requireAuthAPI, async (req, res) => {
  try {
    const userId = req.session.userId;
    const username = req.session.username;
    const { token } = req.body || {};
    
    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }
    
    // Get the secret we generated during setup
    const secret = persistence.get2FASecret(userId);
    
    if (!secret) {
      return res.status(400).json({ error: 'No 2FA setup found. Please initiate setup first.' });
    }
    
    // Verify the token
    const valid = verifyToken(secret, token);
    
    if (!valid) {
      return res.status(400).json({ error: 'Invalid token. Please try again.' });
    }
    
    // Enable 2FA
    persistence.enable2FA(userId);
    
    logger.info({ username }, '2FA enabled');
    
    return res.json({ ok: true, message: '2FA enabled successfully' });
  } catch (err) {
    logger.error({ err: err.message }, '2FA verification failed');
    return res.status(500).json({ error: 'Failed to verify 2FA token' });
  }
});

// Disable 2FA
app.post('/auth/2fa/disable', requireAuthAPI, async (req, res) => {
  try {
    const userId = req.session.userId;
    const username = req.session.username;
    
    persistence.disable2FA(userId);
    
    logger.info({ username }, '2FA disabled');
    
    return res.json({ ok: true, message: '2FA disabled successfully' });
  } catch (err) {
    logger.error({ err: err.message }, '2FA disable failed');
    return res.status(500).json({ error: 'Failed to disable 2FA' });
  }
});

// Get 2FA status
app.get('/auth/2fa/status', requireAuthAPI, (req, res) => {
  try {
    const userId = req.session.userId;
    const enabled = persistence.is2FAEnabled(userId);
    return res.json({ ok: true, enabled });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to get 2FA status' });
  }
});

// ========================================
// Protected Application Routes
// ========================================

// Dashboard UI for monitoring queue, AWS probe, and managing per-origin overrides
app.get('/dashboard', requireAuth, (req, res) => {
  res.render('dashboard', { 
    version: APP_VERSION,
    username: req.session.username 
  });
});

// Configuration page
app.get('/config', requireAuth, (req, res) => {
  const savedCreds = persistence.getCredentials();
  const userId = req.session.userId;
  const twoFAEnabled = persistence.is2FAEnabled(userId);
  
  // Mask the access key to show only first/last 4 characters
  let displayAccessKey = '';
  if (savedCreds?.accessKeyId) {
    const key = savedCreds.accessKeyId;
    if (key.length > 8) {
      displayAccessKey = key.substring(0, 4) + '...' + key.substring(key.length - 4);
    } else {
      displayAccessKey = '****';
    }
  }
  
  res.render('config', {
    version: APP_VERSION,
    username: req.session.username,
    savedAccessKey: displayAccessKey,
    savedAccessKeyFull: savedCreds?.accessKeyId || '',
    savedRegion: savedCreds?.region || process.env.AWS_REGION || 'eu-west-2',
    hasSavedCredentials: !!savedCreds,
    twoFAEnabled: twoFAEnabled
  });
});

// Old first-run page - redirect to config
app.get('/first-run', requireAuth, (req, res) => {
  res.redirect('/config');
});

// ========================================
// API Routes
// ========================================

// API: Get AWS origination numbers
app.get('/api/origination-numbers', requireAuthAPI, async (req, res) => {
  if (!smsClient) {
    return res.status(503).json({ error: 'AWS client not configured' });
  }
  
  try {
    let allOriginators = [];
    
    // Fetch Phone Numbers
    try {
      const phoneCommand = new DescribePhoneNumbersCommand({ MaxResults: 100 });
      const phoneResponse = await smsClient.send(phoneCommand);
      
      const phoneNumbers = (phoneResponse.PhoneNumbers || []).map(phone => {
        let country = phone.PhoneNumberCountryCode || 'Unknown';
        if (!phone.PhoneNumberCountryCode && phone.PhoneNumber) {
          if (phone.PhoneNumber.startsWith('+44')) country = 'GB';
          else if (phone.PhoneNumber.startsWith('+1')) country = 'US';
        }
        
        return {
          phoneNumber: phone.PhoneNumber,
          status: phone.Status,
          type: 'PhoneNumber',
          country: country,
          capabilities: phone.NumberCapabilities || []
        };
      });
      
      allOriginators = allOriginators.concat(phoneNumbers);
      logger.info({ count: phoneNumbers.length }, 'Fetched phone numbers');
    } catch (phoneErr) {
      logger.error({ err: phoneErr.message }, 'Failed to fetch phone numbers');
    }
    
    // Fetch Sender IDs
    try {
      const senderCommand = new DescribeSenderIdsCommand({ MaxResults: 100 });
      const senderResponse = await smsClient.send(senderCommand);
      
      const senderIds = (senderResponse.SenderIds || []).map(sender => {
        // AWS returns RegistrationStatus which can be: CREATED, PENDING, COMPLETE, etc.
        // For "Not Required" registration, sender.Registered is true
        let status = 'ACTIVE';
        if (sender.RegistrationStatus) {
          status = sender.RegistrationStatus; // CREATED, PENDING, COMPLETE, REJECTED, etc.
        } else if (sender.Registered === false) {
          status = 'PENDING';
        }
        
        return {
          phoneNumber: sender.SenderId,
          status: status,
          type: 'SenderId',
          country: sender.IsoCountryCode || 'GB',
          capabilities: []
        };
      });
      
      allOriginators = allOriginators.concat(senderIds);
      logger.info({ count: senderIds.length }, 'Fetched sender IDs');
    } catch (senderErr) {
      logger.warn({ err: senderErr.message }, 'Failed to fetch sender IDs (may not be available in this region)');
    }
    
    logger.info({ total: allOriginators.length }, 'Fetched all AWS originators');
    
    return res.json({ ok: true, numbers: allOriginators });
  } catch (err) {
    logger.error({ err: err.message }, 'Failed to fetch origination numbers');
    return res.status(500).json({ error: 'Failed to fetch origination numbers: ' + err.message });
  }
});

// API: Test AWS credentials and optionally save them
app.post('/api/test/credentials', requireAuthAPI, async (req, res) => {
  let { accessKeyId, secretAccessKey, region, saveCredentials } = req.body || {};
  
  // If secret key is empty, try to use existing saved credentials
  if (!secretAccessKey) {
    const savedCreds = persistence.getCredentials();
    if (savedCreds && savedCreds.secretAccessKey) {
      secretAccessKey = savedCreds.secretAccessKey;
      logger.info('Using existing saved secret access key');
    }
  }
  
  if (!accessKeyId || !secretAccessKey) return res.status(400).json({ error: 'Missing credentials (accessKeyId, secretAccessKey)' });
  const tmpClient = new PinpointSMSVoiceV2Client({ region: region || process.env.AWS_REGION || 'eu-west-2', credentials: { accessKeyId, secretAccessKey } });
  try {
    const cmd = new DescribePhoneNumbersCommand({ MaxResults: 1 });
    const resp = await tmpClient.send(cmd);
    
    // Save credentials if requested
    if (saveCredentials) {
      persistence.saveCredentials(accessKeyId, secretAccessKey, region || process.env.AWS_REGION || 'eu-west-2');
      logger.info('AWS credentials saved to database');
      
      // Reinitialize the global AWS client with saved credentials
      process.env.AWS_ACCESS_KEY_ID = accessKeyId;
      process.env.AWS_SECRET_ACCESS_KEY = secretAccessKey;
      if (region) process.env.AWS_REGION = region;
      initializeAWSClient();
    }
    
    return res.json({ ok: true, phoneNumbers: (resp.PhoneNumbers || []).length, saved: !!saveCredentials });
  } catch (err) {
    logger.warn({ reason: err.message }, 'Credential test failed');
    return res.status(400).json({ ok: false, error: err.message });
  }
});

// API: Dry-run send (local validation and parts estimation)
app.post('/api/test/dry-run', requireAuthAPI, async (req, res) => {
  const { DestinationPhoneNumber, MessageBody } = req.body || {};
  if (!DestinationPhoneNumber || !MessageBody) return res.status(400).json({ error: 'Missing DestinationPhoneNumber or MessageBody' });
  const e164 = /^\+[1-9]\d{6,14}$/;
  if (!e164.test(DestinationPhoneNumber)) return res.status(400).json({ error: 'Invalid DestinationPhoneNumber (must be E.164)' });
  const estimate = estimateMessageParts(MessageBody);
  return res.json({ ok: true, dryRun: true, estimate });
});

// Centralized estimation endpoint

app.post('/api/estimate', requireAuthAPI, (req, res) => { const { message } = req.body || {}; try { const estimate = estimateMessageParts(message); return res.json({ ok: true, estimate }); } catch (err) { logger.warn({ err: err.message }, 'Estimate failed'); return res.status(400).json({ ok: false, error: 'Estimate failed' }); } });

// API: Send SMS endpoint with rate limiting and backoff
// Send endpoint: enqueue for persistence-backed processing
app.post('/api/send-sms', requireAuthAPI, async (req, res) => {
  const { phoneNumber, message, originator, dryRun } = req.body || {};
  if (!phoneNumber || !message) return res.status(400).json({ error: 'Missing phoneNumber or message' });
  const e164 = /^\+[1-9]\d{6,14}$/;
  if (!e164.test(phoneNumber)) return res.status(400).json({ error: 'Invalid phoneNumber (must be E.164)' });

  const estimate = estimateMessageParts(message);
  if (dryRun || !smsClient) return res.json({ ok: true, dryRun: true, estimate });

  const job = persistence.enqueueOutbox(originator, phoneNumber, message);
  return res.json({ ok: true, queued: true, id: job.id, estimate });
});

// Queue endpoints
app.get('/api/queue', requireAuthAPI, (req, res) => {
  try { const stats = persistence.getQueueStats(); const items = persistence.listQueued(20); return res.json({ ok: true, stats, items }); } catch (e) { return res.status(500).json({ ok: false, error: e.message }); }
});

app.post('/api/queue/:id/resend', requireAuthAPI, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const ok = persistence.updateJobStatus(id, { status: 'queued', attempts: 0, nextAttemptAt: Date.now() });
  return res.json({ ok });
});

// Settings: per-origin MPS override
app.post('/api/settings/mps', requireAuthAPI, (req, res) => {
  const { origin, mps } = req.body || {};
  if (!origin || typeof mps !== 'number') return res.status(400).json({ error: 'Missing origin or mps (number)' });
  rateLimiter.setOriginMps(origin, mps);
  persistence.setMpsOverride(origin, mps);
  return res.json({ ok: true });
});

// Provide current per-origin MPS overrides
app.get('/api/settings/mps', requireAuthAPI, (req, res) => {
  try {
    const cfg = persistence.getConfig() || {};
    return res.json({ ok: true, mps_overrides: cfg.mps_overrides || {} });
  } catch (err) { return res.status(500).json({ ok: false, error: err.message }); }
});

app.delete('/api/settings/mps/:origin', requireAuthAPI, (req, res) => {
  try {
    const origin = req.params.origin;
    const cfg = persistence.getConfig() || {};
    if (cfg.mps_overrides && Object.prototype.hasOwnProperty.call(cfg.mps_overrides, origin)) {
      delete cfg.mps_overrides[origin];
      persistence.setConfig(cfg);
    }
    // Clear runtime state in rate limiter
    try { rateLimiter.clearOrigin(origin); } catch (e) { /* ignore errors */ }
    return res.json({ ok: true });
  } catch (err) { return res.status(500).json({ ok: false, error: err.message }); }
});

// Config export/import (simple JSON store in data dir)
app.get('/api/config/export', requireAuthAPI, (req, res) => {
  try {
    const parsed = persistence.getConfig() || {};
    ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_SESSION_TOKEN', 'aws_access_key_id', 'aws_secret_access_key', 'aws_session_token'].forEach(k => delete parsed[k]);
    res.setHeader('Content-Type', 'application/json');
    return res.send(JSON.stringify(parsed, null, 2));
  } catch (err) { logger.warn({ err: err.message }, 'Failed to read or parse configuration for export'); return res.status(500).json({ error: 'Failed to export configuration' }); }
});

app.post('/api/config/import', requireAuthAPI, (req, res) => {
  try {
    const incoming = req.body || {};
    const sanitized = { ...incoming };
    ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_SESSION_TOKEN', 'aws_access_key_id', 'aws_secret_access_key', 'aws_session_token'].forEach(k => { if (k in sanitized) delete sanitized[k]; });
    persistence.setConfig(sanitized);
    return res.json({ ok: true, message: 'Configuration saved (secrets removed for safety)' });
  } catch (err) { logger.error({ err: err.message }, 'Failed to save configuration'); return res.status(500).json({ ok: false, error: 'Failed to save configuration' }); }
});

// SNS webhook endpoint. Use text parser to accept SNS text/plain deliveries.
app.post('/webhook/sns', bodyParser.text({ type: '*/*' }), async (req, res) => {
  let parsed = null;
  try { parsed = typeof req.body === 'string' ? JSON.parse(req.body) : req.body; } catch (e) { logger.warn({ err: e.message }, 'Invalid SNS webhook body'); return res.status(400).send('Bad Request'); }

  // Allow bypass of SNS verification in test/dev when explicitly requested
  const disableSnsVerification = String(process.env.DISABLE_SNS_VERIFICATION || 'false').toLowerCase() === 'true';
  let verified = true;
  if (!disableSnsVerification) verified = await verifySnsSignature(parsed);
  if (!verified) {
    logger.warn('SNS message failed signature verification');
    return res.status(403).send('Forbidden');
  }

  if (parsed.Type === 'SubscriptionConfirmation') {
    try {
      const resp = await fetchUrlText(parsed.SubscribeURL);
      logger.info({ statusCode: resp.statusCode }, 'Subscription confirmation URL fetched');
      return res.sendStatus(200);
    } catch (err) {
      logger.warn({ err: err.message }, 'Subscription confirmation failed');
      return res.status(500).send('Subscription confirmation failed');
    }
  }

  if (parsed.Type === 'Notification') {
    // Message might be JSON inside Message attribute
    let inner = parsed.Message;
    try { inner = JSON.parse(parsed.Message); } catch (e) { /* not JSON, keep as string */ }
    logger.info({ notification: inner }, 'SNS Notification received');

    // Persist inbound message into messages store
    try {
      const from = inner.originationNumber || inner.from || '';
      const to = inner.destinationNumber || inner.to || '';
      const body = inner.messageBody || inner.Message || '';
      const messageId = inner.inboundMessageId || parsed.MessageId || `inbound_${Date.now()}`;
      const rec = { message_id: String(messageId), from_number: String(from), to_number: String(to), body: String(body), direction: 'inbound', status: 'received', timestamp: Date.now(), created_at: Date.now() };
      persistence.addMessage(rec);

      // Check keywords for auto-reply
      const keywords = persistence.getKeywords();
      if (Array.isArray(keywords) && keywords.length) {
        const text = (body || '').toUpperCase();
        for (const k of keywords) {
          if (!k.active) continue;
          try {
            const trigger = String(k.trigger || '').toUpperCase();
            if (!trigger) continue;
            if (text.includes(trigger)) {
              const response = String(k.response || '');
              if (response) {
                // enqueue auto-reply: origin is the inbound destination (our number)
                persistence.enqueueOutbox(to, from, response);
                logger.info({ trigger: k.trigger, response }, 'Auto-reply enqueued');
              }
            }
          } catch (e) { /* continue */ }
        }
      }
    } catch (e) {
      logger.warn({ err: e.message }, 'Failed to persist inbound notification');
    }
    return res.sendStatus(200);
  }

  return res.sendStatus(200);
});

// Admin: migrations status
app.get('/admin/migrations', async (req, res) => {
  try { const r = await runMigrations(); lastMigrationsResult = r; return res.json({ ok: true, migrations: r }); } catch (e) { return res.status(500).json({ ok: false, error: e.message }); }
});

// Error handler — keep messages generic to avoid leaking sensitive info
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => { logger.error({ err: err && err.stack ? err.stack : err }, 'Unhandled error'); res.status(500).json({ error: 'Internal server error' }); });

// Export app for tests and programmatic usage
module.exports = app;

// If run directly, apply migrations then start server
if (require.main === module) {
  (async () => {
    try {
      lastMigrationsResult = await runMigrations();
      logger.info({ migrations: lastMigrationsResult }, 'Migrations result');
      
      // Load saved credentials if no env vars provided
      if (!process.env.AWS_ACCESS_KEY_ID && !process.env.AWS_SECRET_ACCESS_KEY) {
        const savedCreds = persistence.getCredentials();
        if (savedCreds) {
          process.env.AWS_ACCESS_KEY_ID = savedCreds.accessKeyId;
          process.env.AWS_SECRET_ACCESS_KEY = savedCreds.secretAccessKey;
          if (savedCreds.region) process.env.AWS_REGION = savedCreds.region;
          initializeAWSClient();
          logger.info({ region: savedCreds.region }, 'Loaded saved AWS credentials from database');
        } else {
          logger.warn('No AWS credentials found in environment or database - first-run configuration required');
        }
      }
    } catch (e) {
      logger.error({ err: e.message }, 'Migrations failed at startup');
    }

    // Start the persistent queue worker in production mode
    let stopWorker = null;
    const startQueueWorker = () => {
      let stopped = false;
      let inFlight = 0;
      const MAX_CONCURRENT = parseInt(process.env.QUEUE_MAX_CONCURRENT || '4', 10);

      const sleep = ms => new Promise(r => setTimeout(r, ms));

      const isRetryableErr = (err) => {
        if (!err) return false;
        const n = err.name || err.code || '';
        return ['ThrottlingException', 'TooManyRequestsException', 'Throttling'].includes(n);
      };

      const loop = async () => {
        while (!stopped) {
          if (inFlight >= MAX_CONCURRENT) { await sleep(200); continue; }
          const job = persistence.fetchNextJob();
          if (!job) { await sleep(800); continue; }
          inFlight++;
          (async () => {
            try {
              // increment attempts before send
              job.attempts = (job.attempts || 0) + 1;
              persistence.updateJobStatus(job.id, { attempts: job.attempts });
              const result = await rateLimiter.send(job.origin || 'default', job, async (payload) => {
                const params = { DestinationPhoneNumber: payload.phoneNumber, MessageBody: payload.message, OriginationIdentity: payload.origin || undefined };
                const cmd = new SendTextMessageCommand(params);
                return await smsClient.send(cmd);
              });
              // mark sent
              persistence.updateJobStatus(job.id, { status: 'sent', result: (result || {}), sentAt: Date.now() });
              persistence.addMessage({ message_id: (result && (result.MessageId || result.messageId)) || `out_${Date.now()}`, from_number: job.origin || '', to_number: job.phoneNumber, body: job.message, direction: 'outbound', status: 'sent', timestamp: Date.now(), created_at: Date.now() });
            } catch (err) {
              const retryable = isRetryableErr(err);
              const attempts = job.attempts || 1;
              if (retryable && attempts <= SEND_MAX_RETRIES) {
                const backoff = SEND_BASE_BACKOFF_MS * Math.pow(2, attempts - 1) + Math.floor(Math.random() * 200);
                const next = Date.now() + backoff;
                persistence.updateJobStatus(job.id, { status: 'retry', attempts, nextAttemptAt: next, lastError: String(err && err.message ? err.message : err) });
              } else {
                persistence.updateJobStatus(job.id, { status: 'failed', attempts, lastError: String(err && err.message ? err.message : err) });
                persistence.addMessage({ message_id: `failed_${Date.now()}`, from_number: job.origin || '', to_number: job.phoneNumber, body: job.message, direction: 'outbound', status: 'failed', timestamp: Date.now(), created_at: Date.now() });
              }
            } finally { inFlight--; }
          })();
        }
      };
      loop();
      return () => { stopped = true; };
    };

    try {
      // eslint-disable-next-line no-unused-vars
      stopWorker = startQueueWorker();
    } catch (e) {
      logger.warn({ err: e.message }, 'Failed to start queue worker');
    }

    app.listen(PORT, () => { logger.info({ port: PORT }, `AWS_EUM_X server running on port ${PORT}`); });
  })();
}
