require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const csrf = require('csurf');
const helmet = require('helmet');
const path = require('path');

const logger = require('./lib/logger');
const config = require('./lib/config');
const awsClient = require('./lib/aws-client');
const rateLimiter = require('./lib/rate-limiter');
const messageHistory = require('./lib/message-history');
const { validate, calculateSMSSegments, estimateCost } = require('./lib/validation');

const app = express();
const PORT = config.get('app.port');
const HOST = config.get('app.host');

// Trust proxy for proper IP forwarding
app.set('trust proxy', 1);

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  }
}));

// Body parsers
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Session
app.use(cookieSession({
  name: 'session',
  keys: [config.get('app.sessionSecret')],
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict'
}));

// CSRF protection
const csrfProtection = csrf({ cookie: false });

// Static files
app.use(express.static(path.join(__dirname, '../public')));

// Request logging
app.use((req, res, next) => {
  req.id = require('crypto').randomBytes(8).toString('hex');
  logger.info({
    reqId: req.id,
    method: req.method,
    url: req.url,
    ip: req.ip
  }, 'Incoming request');
  next();
});

// Global state
let appStartTime = Date.now();

// ============================================================================
// HEALTH & STATUS ENDPOINTS
// ============================================================================

app.get('/health', async (req, res) => {
  try {
    const awsHealth = await awsClient.healthCheck();
    const rateLimiterStats = rateLimiter.getStats();
    
    const health = {
      status: awsHealth.status === 'ok' ? 'ok' : 'degraded',
      uptime: Math.floor((Date.now() - appStartTime) / 1000),
      timestamp: new Date().toISOString(),
      version: process.env.APP_VERSION || '1.0.0',
      aws: awsHealth,
      rateLimiter: {
        enabled: rateLimiterStats.enabled,
        queueSize: rateLimiterStats.queueSize,
        tokensAvailable: rateLimiterStats.availableTokens
      },
      stats: messageHistory.getStats(1)
    };

    res.status(health.status === 'ok' ? 200 : 503).json(health);
  } catch (error) {
    logger.error({ error: error.message }, 'Health check failed');
    res.status(503).json({
      status: 'error',
      error: error.message
    });
  }
});

app.get('/health/ready', async (req, res) => {
  try {
    const awsHealth = await awsClient.healthCheck();
    if (awsHealth.status === 'ok') {
      res.status(200).json({ ready: true });
    } else {
      res.status(503).json({ ready: false, reason: awsHealth.error });
    }
  } catch (error) {
    res.status(503).json({ ready: false, reason: error.message });
  }
});

// ============================================================================
// WEB UI ROUTES
// ============================================================================

app.get('/', csrfProtection, async (req, res) => {
  try {
    // Check if this is first run
    if (config.isFirstRun() && config.get('ui.enableWizard')) {
      return res.redirect('/wizard');
    }

    const history = messageHistory.getAll({ page: 1, pageSize: 10 });
    const stats = messageHistory.getStats(7);
    const awsHealth = await awsClient.healthCheck();
    const rateLimiterStats = rateLimiter.getStats();

    res.render('index', {
      csrfToken: req.csrfToken(),
      history: history.items,
      stats,
      awsHealth,
      rateLimiterStats,
      config: config.export()
    });
  } catch (error) {
    logger.error({ error: error.message }, 'Error rendering index');
    res.status(500).render('error', { error: 'Failed to load dashboard' });
  }
});

app.get('/wizard', csrfProtection, (req, res) => {
  res.render('wizard', {
    csrfToken: req.csrfToken(),
    step: parseInt(req.query.step || '1', 10),
    config: config.export()
  });
});

app.post('/wizard/complete', csrfProtection, (req, res) => {
  config.markWizardComplete();
  res.redirect('/');
});

app.get('/settings', csrfProtection, async (req, res) => {
  try {
    const pools = await awsClient.listPhonePools();
    const phoneNumbers = await awsClient.listPhoneNumbers();
    const configSets = await awsClient.listConfigurationSets();

    res.render('settings', {
      csrfToken: req.csrfToken(),
      config: config.export(),
      pools: pools.pools,
      phoneNumbers: phoneNumbers.phoneNumbers,
      configSets
    });
  } catch (error) {
    logger.error({ error: error.message }, 'Error loading settings');
    res.render('settings', {
      csrfToken: req.csrfToken(),
      config: config.export(),
      error: error.message
    });
  }
});

app.get('/actions', csrfProtection, (req, res) => {
  const queueInfo = rateLimiter.getQueueInfo();
  res.render('actions', {
    csrfToken: req.csrfToken(),
    queueInfo,
    stats: messageHistory.getStats(1)
  });
});

app.get('/observability', csrfProtection, (req, res) => {
  const stats = messageHistory.getStats(30);
  res.render('observability', {
    csrfToken: req.csrfToken(),
    stats
  });
});

// ============================================================================
// API ROUTES
// ============================================================================

app.post('/api/send-sms', csrfProtection, async (req, res) => {
  try {
    const validation = validate('sendSMS', req.body);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        errors: validation.errors
      });
    }

    const { phoneNumber, message, originationIdentity, messageType, configurationSetName, maxPrice } = validation.value;

    // Check opt-out
    const optOutCheck = await awsClient.checkOptOut(phoneNumber);
    if (optOutCheck.optedOut) {
      return res.status(400).json({
        success: false,
        error: 'Recipient has opted out of receiving messages'
      });
    }

    // Calculate segments and cost
    const segmentInfo = calculateSMSSegments(message);
    const estimatedCost = estimateCost(segmentInfo.segments);

    // Send via rate limiter
    const result = await rateLimiter.send(
      (params) => awsClient.sendSMS(params),
      {
        phoneNumber,
        message,
        originationIdentity,
        messageType,
        configurationSetName,
        maxPrice
      }
    );

    // Record in history
    messageHistory.add({
      type: 'SMS',
      phoneNumber,
      message,
      messageId: result.messageId,
      originationIdentity,
      status: 'sent',
      segments: segmentInfo.segments,
      cost: estimatedCost
    });

    res.json({
      success: true,
      messageId: result.messageId,
      segments: segmentInfo.segments,
      estimatedCost
    });

  } catch (error) {
    logger.error({ error: error.message }, 'Failed to send SMS');
    
    // Record failure
    if (req.body.phoneNumber) {
      messageHistory.add({
        type: 'SMS',
        phoneNumber: req.body.phoneNumber,
        message: req.body.message,
        status: 'failed',
        error: error.userMessage || error.message
      });
    }

    res.status(500).json({
      success: false,
      error: error.userMessage || 'Failed to send SMS',
      errorType: error.errorType,
      retryable: error.retryable
    });
  }
});

app.post('/api/send-test', csrfProtection, async (req, res) => {
  try {
    const validation = validate('testMessage', req.body);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        errors: validation.errors
      });
    }

    const { phoneNumber, originationIdentity } = validation.value;
    const testMessage = `Test message from AWS EUM X at ${new Date().toISOString()}`;

    const result = await awsClient.sendSMS({
      phoneNumber,
      message: testMessage,
      originationIdentity,
      messageType: 'TRANSACTIONAL'
    });

    messageHistory.add({
      type: 'SMS',
      phoneNumber,
      message: testMessage,
      messageId: result.messageId,
      originationIdentity,
      status: 'sent'
    });

    res.json({
      success: true,
      messageId: result.messageId,
      message: 'Test message sent successfully'
    });

  } catch (error) {
    logger.error({ error: error.message }, 'Failed to send test message');
    res.status(500).json({
      success: false,
      error: error.userMessage || error.message
    });
  }
});

app.get('/api/history', (req, res) => {
  const page = parseInt(req.query.page || '1', 10);
  const pageSize = parseInt(req.query.pageSize || '25', 10);
  const filter = {
    type: req.query.type,
    status: req.query.status,
    dateFrom: req.query.dateFrom,
    dateTo: req.query.dateTo
  };

  const history = messageHistory.getAll({ page, pageSize, filter });
  res.json(history);
});

app.get('/api/stats', (req, res) => {
  const days = parseInt(req.query.days || '7', 10);
  const stats = messageHistory.getStats(days);
  res.json(stats);
});

app.post('/api/config', csrfProtection, (req, res) => {
  try {
    const validation = validate('updateConfig', req.body);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        errors: validation.errors
      });
    }

    // Update config
    Object.keys(validation.value).forEach(key => {
      config.set(key, validation.value[key]);
    });

    res.json({
      success: true,
      message: 'Configuration updated'
    });

  } catch (error) {
    logger.error({ error: error.message }, 'Failed to update configuration');
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/config/export', (req, res) => {
  const exported = config.export();
  res.setHeader('Content-Disposition', 'attachment; filename=aws-eum-x-config.json');
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(exported, null, 2));
});

app.post('/api/config/import', csrfProtection, (req, res) => {
  try {
    config.import(req.body);
    res.json({
      success: true,
      message: 'Configuration imported successfully'
    });
  } catch (error) {
    logger.error({ error: error.message }, 'Failed to import configuration');
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/history/export', (req, res) => {
  try {
    const csv = messageHistory.exportCSV();
    res.setHeader('Content-Disposition', 'attachment; filename=message-history.csv');
    res.setHeader('Content-Type', 'text/csv');
    res.send(csv);
  } catch (error) {
    logger.error({ error: error.message }, 'Failed to export history');
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/queue/clear', csrfProtection, (req, res) => {
  const cleared = rateLimiter.clearQueue();
  res.json({
    success: true,
    cleared,
    message: `Cleared ${cleared} messages from queue`
  });
});

app.get('/api/aws/pools', async (req, res) => {
  try {
    const result = await awsClient.listPhonePools(req.query.nextToken);
    res.json(result);
  } catch (error) {
    logger.error({ error: error.message }, 'Failed to list phone pools');
    res.status(500).json({
      success: false,
      error: error.userMessage || error.message
    });
  }
});

app.get('/api/aws/phone-numbers', async (req, res) => {
  try {
    const result = await awsClient.listPhoneNumbers(req.query.nextToken);
    res.json(result);
  } catch (error) {
    logger.error({ error: error.message }, 'Failed to list phone numbers');
    res.status(500).json({
      success: false,
      error: error.userMessage || error.message
    });
  }
});

app.post('/api/validate-phone', (req, res) => {
  const { phoneNumber } = req.body;
  const validation = validate('sendSMS', { phoneNumber, message: 'test', originationIdentity: 'test' });
  
  res.json({
    valid: validation.valid,
    errors: validation.errors
  });
});

app.post('/api/calculate-segments', (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const segmentInfo = calculateSMSSegments(message);
  const estimatedCost = estimateCost(segmentInfo.segments);

  res.json({
    ...segmentInfo,
    estimatedCost
  });
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

app.use((req, res) => {
  res.status(404).render('error', {
    error: 'Page not found',
    statusCode: 404
  });
});

app.use((err, req, res, next) => {
  logger.error({ error: err.message, stack: err.stack }, 'Unhandled error');
  
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).render('error', {
      error: 'Invalid CSRF token. Please refresh and try again.',
      statusCode: 403
    });
  }

  res.status(500).render('error', {
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    statusCode: 500
  });
});

// ============================================================================
// STARTUP
// ============================================================================

async function startup() {
  try {
    logger.info('Starting AWS EUM X...');

    // Validate configuration
    config.validate();
    logger.info('Configuration validated');

    // Initialize rate limiter
    rateLimiter.initialize();

    // Test AWS connection (don't fail if credentials not configured yet)
    try {
      await awsClient.healthCheck();
      logger.info('AWS connection verified');
    } catch (error) {
      logger.warn('AWS connection not available - configuration may be required');
    }

    // Start server
    app.listen(PORT, HOST, () => {
      logger.info({
        port: PORT,
        host: HOST,
        env: process.env.NODE_ENV || 'production'
      }, 'AWS EUM X server started');
    });

  } catch (error) {
    logger.error({ error: error.message, stack: error.stack }, 'Failed to start server');
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  rateLimiter.shutdown();
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  rateLimiter.shutdown();
  process.exit(0);
});

// Start the application
startup();

module.exports = app;
