const pino = require('pino');

// Secret redaction patterns
const redactPaths = [
  'aws.credentials.accessKeyId',
  'aws.credentials.secretAccessKey',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'config.aws.credentials',
  '*.accessKeyId',
  '*.secretAccessKey',
  'req.headers.authorization',
  'req.headers.cookie'
];

// Phone number redaction (show last 4 digits only)
const redactPhoneNumber = (number) => {
  if (!number || typeof number !== 'string') return number;
  if (number.length <= 4) return '****';
  return `${number.slice(0, -4).replace(/./g, '*')}${number.slice(-4)}`;
};

// Custom serializer for phone numbers
const serializers = {
  req: (req) => ({
    id: req.id,
    method: req.method,
    url: req.url,
    // Remove sensitive headers
    headers: {
      'user-agent': req.headers['user-agent'],
      'content-type': req.headers['content-type']
    }
  }),
  res: (res) => ({
    statusCode: res.statusCode
  }),
  err: pino.stdSerializers.err
};

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  redact: {
    paths: redactPaths,
    censor: '[REDACTED]'
  },
  serializers,
  formatters: {
    level(label) {
      return { level: label };
    }
  },
  transport: process.env.NODE_ENV !== 'production' ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname'
    }
  } : undefined,
  base: {
    env: process.env.NODE_ENV || 'production',
    app: 'aws-eum-x',
    version: process.env.APP_VERSION || '1.0.0'
  }
});

// Helper to redact phone numbers in log data
logger.redactPhone = redactPhoneNumber;

module.exports = logger;
