const request = require('supertest');
const fs = require('fs');
const path = require('path');

const TEST_DATA_DIR = path.join(__dirname, 'tmp-queue-data');
process.env.DATA_DIR = TEST_DATA_DIR;
process.env.SENDS_SIMULATE = 'true'; // enable simulation for tests

beforeAll(() => {
  if (!fs.existsSync(TEST_DATA_DIR)) fs.mkdirSync(TEST_DATA_DIR, { recursive: true });
});

afterAll(() => {
  try {
    fs.rmSync(TEST_DATA_DIR, { recursive: true, force: true });
  } catch (e) {
    // ignore cleanup errors
  }
});

const app = require('../server');

describe('send queue', () => {
  test('enqueue and process simulated send', async () => {
    const payload = { DestinationPhoneNumber: '+447700900123', MessageBody: 'Hello from tests', simulate: true };
    const enq = await request(app).post('/api/send-sms').send(payload);
    expect(enq.statusCode).toBe(202);
    expect(enq.body).toHaveProperty('queueId');

    // Wait for processing to happen
    await new Promise(resolve => setTimeout(resolve, 600));

    const hs = await request(app).get('/api/last-sends');
    expect(hs.statusCode).toBe(200);
    expect(hs.body).toHaveProperty('history');
    expect(Array.isArray(hs.body.history)).toBe(true);
    expect(hs.body.history.length).toBeGreaterThan(0);
    const entry = hs.body.history.find(e => e.queueId === enq.body.queueId);
    expect(entry).toBeDefined();
    expect(entry.status).toBe('sent');
  });
});
