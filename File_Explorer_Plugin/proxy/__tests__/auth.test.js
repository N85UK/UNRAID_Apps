const nock = require('nock');
const { fetchUserWithCookie, getUserFromCookie } = require('../auth');

describe('auth bridge', () => {
  afterEach(() => nock.cleanAll());

  test('fetchUserWithCookie tries endpoints and returns user when found', async () => {
    const cookie = 'CAKE=abc';
    // mock /api/session
    nock('http://127.0.0.1').get('/api/session').reply(200, { username: 'alice', roles: ['admin'] });
    const user = await fetchUserWithCookie(cookie);
    expect(user).not.toBeNull();
    expect(user.username).toBe('alice');
    expect(user.roles).toContain('admin');
  });

  test('getUserFromCookie returns null when no cookie', async () => {
    const fakeReq = { headers: {} };
    const user = await getUserFromCookie(fakeReq);
    expect(user).toBeNull();
  });
});
