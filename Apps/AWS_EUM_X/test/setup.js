// Test environment setup
process.env.NODE_ENV = 'test';
process.env.DATA_DIR = process.env.DATA_DIR || './test-data';
process.env.SESSION_SECRET = 'test-secret-key-do-not-use-in-production';
process.env.SENDS_ENABLED = 'false';
process.env.SENDS_SIMULATE = 'true';

// Suppress console output during tests unless debugging
if (!process.env.DEBUG_TESTS) {
  global.console = {
    ...console,
    log: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: console.error, // Keep errors visible
  };
}
