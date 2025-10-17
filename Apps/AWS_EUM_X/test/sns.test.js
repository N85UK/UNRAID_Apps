const request = require('supertest');
const fs = require('fs');
const path = require('path');

const TEST_DATA_DIR = path.join(__dirname, 'tmp-sns');
process.env.DATA_DIR = TEST_DATA_DIR;
process.env.DISABLE_SNS_VERIFICATION = 'true';

beforeAll(() => { if (!fs.existsSync(TEST_DATA_DIR)) fs.mkdirSync(TEST_DATA_DIR, { recursive: true }); });
afterAll(() => { try { fs.rmSync(TEST_DATA_DIR, { recursive: true, force: true }); } catch (e) { /* ignore cleanup errors */ } });

const app = require('../server');

describe('SNS webhook', () => {
  test('POST /webhook/sns should persist inbound message when verification disabled', async () => {
    const messageBody = JSON.stringify({ originationNumber: '+447518384350', destinationNumber: '+447418367358', messageBody: 'Hello from SNS' });
    const payload = {
      Type: 'Notification',
      MessageId: 'mid-1',
      Message: messageBody
    };

    const res = await request(app).post('/webhook/sns').send(payload).set('Content-Type', 'application/json');
    expect(res.statusCode).toBe(200);

  // check via persistence API
  const found = app.persistence.findMessageByBody('Hello from SNS');
  expect(found).toBeTruthy();
  });
});
