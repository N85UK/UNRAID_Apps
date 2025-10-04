const fetch = require('node-fetch');

// Simple in-memory cache for cookie -> user lookup
const cache = new Map();
const CACHE_TTL = 60 * 1000; // 60s

async function fetchUserWithCookie(cookie) {
  // Try known Unraid API endpoints that may return current user
  const endpoints = [
    'http://127.0.0.1/api/session',
    'http://127.0.0.1/api/users/current',
    'http://127.0.0.1/api/auth'
  ];

  for (const ep of endpoints) {
    try {
      const resp = await fetch(ep, {headers: {cookie}, redirect: 'manual'});
      if (resp.status === 200) {
        const json = await resp.json();
        // Try to find common fields
        const username = json.username || json.user || (json.data && json.data.username) || null;
        const roles = json.roles || json.role || (json.data && json.data.roles) || [];
        if (username) return {username, roles};
      }
    } catch (e) {
      // ignore and try next endpoint
    }
  }
  return null;
}

async function getUserFromCookie(req) {
  const cookie = req.headers.cookie || '';
  if (!cookie) return null;

  if (cache.has(cookie)) {
    const entry = cache.get(cookie);
    if ((Date.now() - entry.ts) < CACHE_TTL) return entry.user;
    cache.delete(cookie);
  }

  const user = await fetchUserWithCookie(cookie);
  cache.set(cookie, {user, ts: Date.now()});
  return user;
}

module.exports = {getUserFromCookie, fetchUserWithCookie};
