const request = require('supertest');
const fs = require('fs');
const path = require('path');

const TEST_DATA_DIR = path.join(__dirname, 'tmp-queue');
process.env.DATA_DIR = TEST_DATA_DIR;

beforeAll(() => { if (!fs.existsSync(TEST_DATA_DIR)) fs.mkdirSync(TEST_DATA_DIR, { recursive: true }); });
afterAll(() => { try { fs.rmSync(TEST_DATA_DIR, { recursive: true, force: true }); } catch (e) { /* ignore cleanup errors */ } });

const app = require('../server');

describe('queue endpoints', () => {
  test('POST /api/send-sms enqueues job', async () => {
    const res = await request(app).post('/api/send-sms').send({ phoneNumber: '+447700900001', message: 'Queue test' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('queued', true);
    const q = await request(app).get('/api/queue');
    expect(q.statusCode).toBe(200);
    expect(q.body).toHaveProperty('stats');
    expect(q.body.stats.queueDepth).toBeGreaterThanOrEqual(1);
  });
});
