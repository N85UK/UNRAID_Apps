const request = require('supertest');
const fs = require('fs');
const path = require('path');

const TEST_DATA_DIR = path.join(__dirname, 'tmp-settings');
process.env.DATA_DIR = TEST_DATA_DIR;

beforeAll(() => { if (!fs.existsSync(TEST_DATA_DIR)) fs.mkdirSync(TEST_DATA_DIR, { recursive: true }); });
afterAll(() => { try { fs.rmSync(TEST_DATA_DIR, { recursive: true, force: true }); } catch (e) {} });

const app = require('../server');

describe('settings endpoints', () => {
  test('GET /api/settings/mps returns overrides object', async () => {
    const res = await request(app).get('/api/settings/mps');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('ok', true);
    expect(res.body).toHaveProperty('mps_overrides');
    expect(typeof res.body.mps_overrides).toBe('object');
  });
});
