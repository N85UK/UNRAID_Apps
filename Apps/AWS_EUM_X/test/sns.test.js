const request = require('supertest');
const fs = require('fs');
const path = require('path');

const TEST_DATA_DIR = path.join(__dirname, 'tmp-sns');
process.env.DATA_DIR = TEST_DATA_DIR;
process.env.DISABLE_SNS_VERIFICATION = 'true';

beforeAll(() => { if (!fs.existsSync(TEST_DATA_DIR)) fs.mkdirSync(TEST_DATA_DIR, { recursive: true }); });
afterAll(() => { try { fs.rmSync(TEST_DATA_DIR, { recursive: true, force: true }); } catch (e) {} });

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

    // check messages file
    const messagesFile = path.join(TEST_DATA_DIR, 'messages.json');
    const exists = fs.existsSync(messagesFile);
    expect(exists).toBe(true);
    const content = JSON.parse(fs.readFileSync(messagesFile, 'utf8') || '{}');
    expect(Array.isArray(content.messages)).toBe(true);
    const found = content.messages.find(m => m.body && m.body.includes('Hello from SNS'));
    expect(found).toBeTruthy();
  });
});
