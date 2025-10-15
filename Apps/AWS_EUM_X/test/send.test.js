const request = require('supertest');
const app = require('../server');

describe('send endpoint', () => {
  test('POST /api/send-sms dry-run returns estimate', async () => {
    const res = await request(app).post('/api/send-sms').send({ phoneNumber: '+447700900000', message: 'Hello', dryRun: true });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('dryRun', true);
    expect(res.body).toHaveProperty('estimate');
  });

  test('POST /api/send-sms invalid phone returns 400', async () => {
    const res = await request(app).post('/api/send-sms').send({ phoneNumber: '770090000', message: 'Hello' });
    expect(res.statusCode).toBe(400);
  });
});
