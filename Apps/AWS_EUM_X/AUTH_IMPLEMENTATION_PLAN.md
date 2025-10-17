# Authentication & Config Page Implementation Plan

## Overview
Major refactor to add secure authentication, move credentials to config page, and make dashboard the default.

## Changes Required

### 1. Dependencies to Add
```json
{
  "bcrypt": "^5.1.1",
  "express-session": "^1.18.0", 
  "speakeasy": "^2.0.0",
  "qrcode": "^1.5.3",
  "connect-sqlite3": "^0.9.13"
}
```

### 2. Database Schema Updates (persistence.js)
```sql
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  totp_secret TEXT,
  totp_enabled INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL
);

-- Sessions table (managed by express-session store)
```

### 3. New Server Routes (server.js)

#### Authentication Routes
- `GET /` - Redirect to /dashboard if authenticated, else /auth/login
- `GET /auth/login` - Show login page
- `POST /auth/login` - Process login (username, password, optional TOTP)
- `GET /auth/logout` - Destroy session
- `GET /auth/setup` - First-time setup page (create admin account)
- `POST /auth/2fa/setup` - Generate TOTP secret and QR code
- `POST /auth/2fa/verify` - Verify and enable TOTP
- `POST /auth/2fa/disable` - Disable TOTP

#### Protected Routes (require authentication middleware)
- `GET /dashboard` - Main dashboard (currently exists)
- `GET /config` - Configuration page (new)
- All `/api/*` routes - Require authentication

#### New API Endpoints
- `GET /api/origination-numbers` - Fetch phone numbers from AWS Pinpoint
- `GET /api/user/profile` - Get current user info
- `POST /api/user/change-password` - Change password

### 4. Middleware
```javascript
// Authentication middleware
function requireAuth(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }
  res.redirect('/auth/login');
}

// API auth middleware (returns JSON)
function requireAuthAPI(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }
  res.status(401).json({ error: 'Unauthorized' });
}
```

### 5. Session Configuration
```javascript
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);

app.use(session({
  store: new SQLiteStore({
    db: 'sessions.db',
    dir: './data'
  }),
  secret: process.env.SESSION_SECRET || persistence.getSessionSecret(),
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set true if using HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));
```

### 6. Views Created
- ✅ `views/login.ejs` - Login page with 2FA support
- ✅ `views/config.ejs` - Configuration page with:
  - AWS credentials management
  - Dry-run testing
  - Origination number fetching
  - 2FA setup/management

### 7. Client-Side Scripts
- ✅ `public/js/config.js` - Config page interactions

### 8. Dashboard Updates
- Update `views/dashboard.ejs` to add:
  - Config link in header
  - Logout link
  - Remove first-run link

### 9. Security Features
- ✅ Password hashing with bcrypt (12 rounds)
- ✅ TOTP 2FA with QR code generation
- ✅ Session-based authentication
- ✅ HTTP-only cookies
- ✅ CSRF protection (optional, recommended)
- ✅ Rate limiting on login attempts (optional, recommended)

### 10. Migration Path
- On first startup, check if users table is empty
- If empty, redirect to setup page to create admin account
- Existing deployments: provide migration script or auto-migrate

## Implementation Priority

### Phase 1 (Essential)
1. Add dependencies to package.json
2. Update database schema in persistence.js
3. Add session middleware
4. Implement basic authentication (no 2FA)
5. Protect all routes with auth middleware
6. Redirect / to dashboard when authenticated

### Phase 2 (Enhanced Security)
1. Implement 2FA with TOTP
2. Add QR code generation
3. Add 2FA setup flow in config page

### Phase 3 (AWS Integration)
1. Implement origination number fetching
2. Add number selection to dashboard send form
3. Cache numbers for performance

## Testing Checklist
- [ ] First-time setup creates admin user
- [ ] Login works with correct credentials
- [ ] Login fails with incorrect credentials
- [ ] Session persists across page reloads
- [ ] Logout destroys session
- [ ] Protected routes redirect to login
- [ ] 2FA setup generates valid QR code
- [ ] 2FA verification works
- [ ] 2FA required on login when enabled
- [ ] AWS origination numbers fetch correctly
- [ ] Config page saves credentials
- [ ] Dashboard is default page after login

## Estimated Implementation Time
- Phase 1: 4-6 hours
- Phase 2: 2-3 hours  
- Phase 3: 1-2 hours
- Testing: 2-3 hours
**Total: 9-14 hours**

## Files to Create/Modify

### Create
- ✅ views/login.ejs
- ✅ views/config.ejs
- ✅ public/js/config.js
- lib/auth.js (authentication helpers)
- lib/totp.js (2FA helpers)

### Modify
- server.js (major refactor)
- persistence.js (add users table, auth methods)
- views/dashboard.ejs (update header links)
- package.json (add dependencies)
- Dockerfile (no changes needed)
- entrypoint.sh (no changes needed)

## Security Considerations
1. Store passwords with bcrypt (salt rounds: 12)
2. Store TOTP secrets encrypted
3. Use secure session secrets (auto-generated if not provided)
4. Implement rate limiting on login (5 attempts per 15 min)
5. Log all authentication events
6. Consider adding CSRF tokens
7. Use HTTPS in production (reverse proxy)

## Next Steps
This is a significant refactor. Would you like me to:
1. Implement Phase 1 (basic auth) now
2. Create separate branch for this work
3. Break it into smaller PRs
4. Provide more detailed code for specific parts

The auth system adds ~500-800 lines of code across multiple files.
