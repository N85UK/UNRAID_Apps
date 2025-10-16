const pino = require('pino');

// Redaction serializers for sensitive data
const redactors = {
  // Redact AWS credentials
  AWS_ACCESS_KEY_ID: (value) => {
    if (!value || typeof value !== 'string') return value;
    if (value.length < 8) return '***';
    return `${value.substring(0, 4)}****${value.substring(value.length - 4)}`;
  },
  AWS_SECRET_ACCESS_KEY: () => '***REDACTED***',
  
  // Redact authorization headers
  authorization: () => '***REDACTED***',
  Authorization: () => '***REDACTED***',
  
  // Redact session tokens
  sessionToken: () => '***REDACTED***',
  SessionToken: () => '***REDACTED***',
  
  // Redact passwords
  password: () => '***REDACTED***',
  Password: () => '***REDACTED***',
  
  // Partial redaction for phone numbers (keep country code visible)
  phoneNumber: (value) => {
    if (!value || typeof value !== 'string') return value;
    if (value.length < 6) return '***';
    return `${value.substring(0, 3)}****${value.substring(value.length - 2)}`;
  },
  
  // Redact message bodies in production (keep for debugging in dev)
  messageBody: (value) => {
    if (process.env.NODE_ENV === 'development') return value;
    if (!value || typeof value !== 'string') return value;
    if (value.length <= 20) return '***';
    return `${value.substring(0, 10)}...${value.substring(value.length - 10)}`;
  }
};

// Custom serializers for AWS SDK objects
const serializers = {
  req: (req) => ({
    id: req.id,
    method: req.method,
    url: req.url,
    // Redact sensitive headers
    headers: req.headers ? {
      ...req.headers,
      authorization: req.headers.authorization ? redactors.authorization() : undefined,
      'x-api-key': req.headers['x-api-key'] ? '***REDACTED***' : undefined
    } : undefined,
    remoteAddress: req.remoteAddress,
    remotePort: req.remotePort
  }),
  
  res: (res) => ({
    statusCode: res.statusCode,
    headers: res.getHeaders ? res.getHeaders() : undefined
  }),
  
  err: pino.stdSerializers.err,
  
  // Custom serializer for AWS errors
  awsError: (err) => ({
    name: err.name,
    message: err.message,
    code: err.code,
    statusCode: err.$metadata?.httpStatusCode,
    requestId: err.$metadata?.requestId,
    // Don't log full error stack in production
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
};

// Base logger configuration
const baseConfig = {
  level: process.env.LOG_LEVEL || 'info',
  serializers,
  
  // Redact sensitive fields from all log entries
  redact: {
    paths: [
      'AWS_ACCESS_KEY_ID',
      'AWS_SECRET_ACCESS_KEY',
      'req.headers.authorization',
      'req.headers.cookie',
      'req.body.password',
      'res.headers["set-cookie"]',
      'credentials.accessKeyId',
      'credentials.secretAccessKey',
      'config.credentials'
    ],
    censor: '***REDACTED***'
  },
  
  // Base metadata
  base: {
    pid: process.pid,
    hostname: process.env.HOSTNAME || 'aws-eum-x',
    app: 'aws-eum-x',
    version: process.env.APP_VERSION || '1.0.0'
  }
};

// Create logger instance based on environment
let logger;

if (process.env.NODE_ENV === 'production' || process.env.LOG_FORMAT === 'json') {
  // Production: JSON logs
  logger = pino(baseConfig);
} else {
  // Development: Pretty formatted logs
  const transport = pino.transport({
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss Z',
      ignore: 'pid,hostname',
      singleLine: false,
      messageFormat: '{levelLabel} - {msg}'
    }
  });
  
  logger = pino(baseConfig, transport);
}

// Helper function to redact sensitive data from objects
function redactSensitiveData(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  
  const redacted = Array.isArray(obj) ? [...obj] : { ...obj };
  
  for (const [key, value] of Object.entries(redacted)) {
    const lowerKey = key.toLowerCase();
    
    // Check for keys that need redaction
    if (lowerKey.includes('secret') || 
        lowerKey.includes('password') || 
        lowerKey.includes('token') ||
        lowerKey === 'authorization') {
      redacted[key] = '***REDACTED***';
    } else if (lowerKey.includes('accesskey')) {
      redacted[key] = redactors.AWS_ACCESS_KEY_ID(value);
    } else if (typeof value === 'object' && value !== null) {
      redacted[key] = redactSensitiveData(value);
    }
  }
  
  return redacted;
}

// Create child logger with additional context
function createLogger(context = {}) {
  return logger.child(redactSensitiveData(context));
}

// Export logger and utilities
module.exports = {
  logger,
  createLogger,
  redactSensitiveData,
  redactors
};
