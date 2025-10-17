const request = require('supertest');
const fs = require('fs');
const path = require('path');

const TEST_DATA_DIR = path.join(__dirname, 'tmp-settings');
process.env.DATA_DIR = TEST_DATA_DIR;

beforeAll(() => { if (!fs.existsSync(TEST_DATA_DIR)) fs.mkdirSync(TEST_DATA_DIR, { recursive: true }); });
afterAll(() => { try { fs.rmSync(TEST_DATA_DIR, { recursive: true, force: true }); } catch (e) { /* ignore cleanup errors */ } });

const app = require('../server');

describe('settings endpoints', () => {
  test('GET /api/settings/mps returns overrides object', async () => {
    const res = await request(app).get('/api/settings/mps');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('ok', true);
    expect(res.body).toHaveProperty('mps_overrides');
    expect(typeof res.body.mps_overrides).toBe('object');
  });

  test('POST /api/settings/mps and DELETE should persist and remove overrides', async () => {
    const post = await request(app).post('/api/settings/mps').send({ origin: 'test-origin', mps: 2.5 });
    expect(post.statusCode).toBe(200);
    expect(post.body).toHaveProperty('ok', true);
    const get1 = await request(app).get('/api/settings/mps');
    expect(get1.body.mps_overrides).toHaveProperty('test-origin', 2.5);
    const del = await request(app).delete('/api/settings/mps/test-origin');
    expect(del.statusCode).toBe(200);
    const get2 = await request(app).get('/api/settings/mps');
    expect(get2.body.mps_overrides).not.toHaveProperty('test-origin');
  });
});
