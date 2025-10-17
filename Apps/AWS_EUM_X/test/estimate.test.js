const request = require('supertest');
const app = require('../server');

describe('estimate endpoint', () => {
  test('POST /api/estimate returns estimate for ascii', async () => {
    const res = await request(app).post('/api/estimate').send({ message: 'Hello' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('estimate');
    expect(res.body.estimate.parts).toBe(1);
  });

  test('POST /api/estimate handles non-string gracefully', async () => {
    const res = await request(app).post('/api/estimate').send({ message: null });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('estimate');
    expect(res.body.estimate.chars).toBe(0);
  });
});
