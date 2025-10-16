const request = require('supertest');
const fs = require('fs');
const path = require('path');

// Use an isolated test data directory
const TEST_DATA_DIR = path.join(__dirname, 'tmp-data');
process.env.DATA_DIR = TEST_DATA_DIR;

beforeAll(() => {
  if (!fs.existsSync(TEST_DATA_DIR)) fs.mkdirSync(TEST_DATA_DIR, { recursive: true });
});

afterAll(() => {
  try {
    fs.rmSync(TEST_DATA_DIR, { recursive: true, force: true });
  } catch (e) {
    // best-effort cleanup; ignore errors
  }
});

const app = require('../server');

describe('config import security', () => {
  test('POST /api/config/import should sanitize secrets before saving', async () => {
    const payload = {
      aws_access_key_id: 'AKIA_NOT_REAL',
      aws_secret_access_key: 'SECRET_NOT_REAL',
      some_setting: 'value123'
    };

    const res = await request(app).post('/api/config/import').send(payload);
    expect(res.statusCode).toBe(200);
    const cfgFile = path.join(TEST_DATA_DIR, 'config.json');
    expect(fs.existsSync(cfgFile)).toBe(true);
    const saved = JSON.parse(fs.readFileSync(cfgFile, 'utf8'));
    expect(saved).not.toHaveProperty('aws_access_key_id');
    expect(saved).not.toHaveProperty('aws_secret_access_key');
    expect(saved).toHaveProperty('some_setting', 'value123');
  });
});
