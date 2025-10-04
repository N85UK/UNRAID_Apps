const nock = require('nock');
const { fetchUserWithCookie, getUserFromCookie } = require('../auth');

describe('auth bridge (GraphQL)', () => {
  afterEach(() => nock.cleanAll());

  test('fetchUserWithCookie returns user from GraphQL viewer field', async () => {
    const cookie = 'CAKE=abc';
    const graphql = nock('http://127.0.0.1').post('/graphql').reply(200, { data: { viewer: { username: 'alice', roles: ['admin'] } } });
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
