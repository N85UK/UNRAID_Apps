const bcrypt = require('bcrypt');

const SALT_ROUNDS = 12;

/**
 * Hash a password using bcrypt
 */
async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a password against a hash
 */
async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

/**
 * Middleware to require authentication
 * Redirects to login page if not authenticated
 */
function requireAuth(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }
  return res.redirect('/auth/login');
}

/**
 * Middleware to require authentication for API endpoints
 * Returns 401 JSON response if not authenticated
 */
function requireAuthAPI(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }
  return res.status(401).json({ error: 'Unauthorized' });
}

/**
 * Middleware to check if setup is required
 * Redirects to setup if no users exist
 */
function requireSetup(persistence) {
  return (req, res, next) => {
    if (!persistence.hasAnyUsers()) {
      return res.redirect('/auth/setup');
    }
    return next();
  };
}

/**
 * Middleware to ensure user is NOT authenticated (for login/setup pages)
 */
function requireNoAuth(req, res, next) {
  if (req.session && req.session.userId) {
    return res.redirect('/dashboard');
  }
  return next();
}

module.exports = {
  hashPassword,
  verifyPassword,
  requireAuth,
  requireAuthAPI,
  requireSetup,
  requireNoAuth
};
