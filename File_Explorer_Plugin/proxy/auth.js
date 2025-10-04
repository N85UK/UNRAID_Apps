const fetch = require('node-fetch');

// Simple in-memory cache for cookie -> user lookup
const cache = new Map();
const CACHE_TTL = 60 * 1000; // 60s

function getCachedUserForCookie(cookie) {
  if (!cookie) return null;
  const entry = cache.get(cookie);
  if (!entry) return null;
  if ((Date.now() - entry.ts) < CACHE_TTL) return entry.user;
  cache.delete(cookie);
  return null;
}

async function fetchUserWithCookie(cookie) {
  if (!cookie) return null;

  // GraphQL endpoint (local Unraid)
  const graphqlUrl = process.env.UNRAID_GRAPHQL_URL || 'http://127.0.0.1/graphql';

  // Candidate queries to try for retrieving current user info
  const candidates = [
    '{ viewer { username roles } }',
    '{ me { username roles } }',
    '{ currentUser { username roles } }',
    '{ session { user { username roles } } }',
    '{ whoami { username roles } }'
  ];

  for (const query of candidates) {
    try {
      const resp = await fetch(graphqlUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'cookie': cookie
        },
        body: JSON.stringify({query}),
        redirect: 'manual'
      });

      if (resp.status === 200) {
        const json = await resp.json();
        if (json && json.data) {
          // Try to extract username/roles from the returned data
          const user = extractUserFromGraphQLData(json.data);
          if (user && user.username) return user;
        }
      }

      // If we receive 401 or 403, stop trying further (unauthenticated cookie)
      if (resp.status === 401 || resp.status === 403) return null;
    } catch (e) {
      // ignore and try next candidate
    }
  }

  // fallback: try old REST endpoints if present (best-effort)
  const restEndpoints = [
    'http://127.0.0.1/api/session',
    'http://127.0.0.1/api/users/current',
    'http://127.0.0.1/api/auth'
  ];

  for (const ep of restEndpoints) {
    try {
      const resp = await fetch(ep, {headers: {cookie}, redirect: 'manual'});
      if (resp.status === 200) {
        const json = await resp.json();
        const username = json.username || json.user || (json.data && json.data.username) || null;
        const roles = json.roles || json.role || (json.data && json.data.roles) || [];
        if (username) return {username, roles};
      }
    } catch (e) {
      // ignore
    }
  }

  return null;
}

// Search nested GraphQL response data for username/roles
function extractUserFromGraphQLData(data) {
  if (!data) return null;
  // flatten top-level fields
  for (const key of Object.keys(data)) {
    const val = data[key];
    if (!val) continue;
    // common shapes: { viewer: { username, roles } }, { session: { user: { username } } }
    if (val.username) {
      return {username: val.username, roles: val.roles || []};
    }
    if (val.user && val.user.username) {
      return {username: val.user.username, roles: val.user.roles || val.user.role || []};
    }
    if (val.session && val.session.user && val.session.user.username) {
      return {username: val.session.user.username, roles: val.session.user.roles || []};
    }
    if (val.me && val.me.username) {
      return {username: val.me.username, roles: val.me.roles || []};
    }
    // nested deeper
    if (typeof val === 'object') {
      const nested = extractUserFromGraphQLData(val);
      if (nested) return nested;
    }
  }
  return null;
}

async function getUserFromCookie(req) {
  const cookie = req.headers.cookie || '';
  if (!cookie) return null;

  const cached = getCachedUserForCookie(cookie);
  if (cached) return cached;

  const user = await fetchUserWithCookie(cookie);
  cache.set(cookie, {user, ts: Date.now()});
  return user;
}

module.exports = {getUserFromCookie, fetchUserWithCookie, getCachedUserForCookie};
