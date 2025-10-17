# AWS EUM X v0.1.3 - Phase 1 Authentication System

**Release Date:** October 17, 2025

## Overview

Version 0.1.3 introduces a complete authentication system to secure AWS EUM X. This is a **breaking change** that requires all users to create an account on first startup.

## What's New

### 🔐 Authentication System

- **User Authentication**: Secure login with username and password
- **Password Security**: Bcrypt hashing with 12 salt rounds
- **Session Management**: SQLite-backed sessions with 24-hour expiration
- **HTTP-Only Cookies**: Prevents XSS attacks on session tokens
- **First-Time Setup**: Guided wizard for creating admin account

### 🎨 New Pages

1. **Setup Page** (`/auth/setup`):
   - First-time account creation
   - Only accessible when no users exist
   - Auto-login after account creation

2. **Login Page** (`/auth/login`):
   - Clean, modern login interface
   - Remembers username (autocomplete)
   - Error messages for invalid credentials

3. **Config Page** (`/config`):
   - Replaces the old first-run wizard
   - AWS credentials management
   - Dry-run testing
   - AWS origination numbers (UI ready, API coming in Phase 3)
   - Navigation links to Dashboard and Logout

### 🔒 Protected Routes

All application routes now require authentication:

- `/dashboard` - Main dashboard (requires login)
- `/config` - Configuration page (requires login)
- `/api/*` - All API endpoints (returns 401 if not authenticated)

Public routes:

- `/health` - Health check endpoint
- `/ready` - Readiness probe
- `/probe/aws` - AWS connectivity check
- `/webhook/sns` - SNS webhook receiver

### 🔄 Routing Changes

**New Root Behavior** (`/`):

- No users exist → Redirect to `/auth/setup`
- Not authenticated → Redirect to `/auth/login`
- Authenticated → Redirect to `/dashboard`

**Removed**:

- Old first-run wizard at `/` (moved to `/config`)

### 📦 New Dependencies

```json
{
  "bcrypt": "^5.1.1",
  "express-session": "^1.18.0",
  "connect-sqlite3": "^0.9.13"
}
```

### 📊 Database Changes

**New Table: `users`**

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at INTEGER DEFAULT (cast(strftime('%s','now') as integer) * 1000)
);
```

**New Config Key: `session_secret`**

- Automatically generated on first startup
- Stored in `config` table
- Used for session cookie signing

- Auto-cleanup of expired sessions

### Sessions Database

Sessions stored in `/app/data/sessions.db`, managed by `connect-sqlite3` store with auto-cleanup of expired sessions.

## Breaking Changes

⚠️ **Important:** Existing deployments will require setup on first access after upgrade.

1. **Authentication Required**: All routes except health checks now require login
2. **First Access**: You'll be redirected to setup page to create admin account
3. **API Changes**: API calls without session will return 401 Unauthorized
4. **Root Route**: `/` no longer shows first-run wizard directly

## Migration Guide

### For New Deployments

1. Start the container
2. Navigate to `http://your-server:8080`
3. You'll be automatically redirected to setup
4. Create your admin account (username + password)
5. You'll be logged in and redirected to config page
6. Configure your AWS credentials
7. Access dashboard from navigation

### For Existing Deployments

1. Stop the container
2. Pull the new image: `docker pull ghcr.io/n85uk/aws-eum-x:v0.1.3`
3. Start the container
4. Navigate to your UNRAID URL
5. Follow the first-time setup wizard
6. Your existing AWS credentials (if saved) will still be available
7. Your message history and queue will be preserved

## Security Features

### Password Security

- **Hashing**: bcrypt with 12 rounds (industry standard)
- **Minimum Length**: 8 characters required
- **Confirmation**: Password must be entered twice during setup
- **Storage**: Only hashed passwords stored, never plaintext

### Session Security

- **HTTP-Only**: Cookies not accessible via JavaScript
- **Same-Site**: CSRF protection (when HTTPS enabled)
- **Expiration**: 24-hour idle timeout
- **Secret**: Cryptographically random session secret (64-byte hex)
- **Storage**: SQLite database (survives container restarts)

### Protection Mechanisms

- **Route Guards**: `requireAuth` middleware on all protected routes
- **API Guards**: `requireAuthAPI` middleware returns JSON 401
- **Setup Lock**: First user can only be created via setup page
- **No Auth Bypass**: Login page redirects authenticated users to dashboard

## Testing Checklist

✅ **Setup Flow**:

- [ ] First access redirects to `/auth/setup`
- [ ] Can create admin account
- [ ] Password confirmation works
- [ ] Auto-login after setup works
- [ ] Redirected to config page after setup

✅ **Login Flow**:

- [ ] Login page shows for unauthenticated users
- [ ] Valid credentials allow login
- [ ] Invalid credentials show error
- [ ] Session persists across page reloads
- [ ] Authenticated users can't access login page

✅ **Protected Routes**:

- [ ] Dashboard requires authentication
- [ ] Config page requires authentication
- [ ] API endpoints return 401 when not authenticated
- [ ] Unauthenticated requests redirect to login

✅ **Logout**:

- [ ] Logout destroys session
- [ ] Redirects to login page
- [ ] Can't access protected routes after logout

✅ **Data Persistence**:

- [ ] User accounts survive container restart
- [ ] Sessions survive container restart
- [ ] AWS credentials still accessible after authentication
- [ ] Message history preserved

## Known Issues

None at this time. Please report issues on GitHub.

## What's Next: Phase 2

The next release will include:

- **2FA (TOTP)**: Optional two-factor authentication
- **QR Code Setup**: Scan with Google Authenticator, Authy, etc.
- **Backup Codes**: Recovery codes for 2FA
- **2FA Management**: Enable/disable in config page

## What's Next: Phase 3

Future enhancements:

- **AWS Origination Numbers**: Auto-fetch from Pinpoint API
- **User Management**: Multiple users (admin + read-only)
- **Password Change**: Change password in config
- **Session Management**: View active sessions, force logout

## Files Changed

### New Files

- `lib/auth.js` - Authentication middleware and utilities
- `views/setup.ejs` - First-time setup page
- `views/login.ejs` - Login page
- `views/config.ejs` - Configuration page (moved from first-run)
- `public/js/config.js` - Config page client-side logic
- `AUTH_IMPLEMENTATION_PLAN.md` - Full implementation plan

### Modified Files

- `package.json` - Added auth dependencies, bumped version to 0.1.3
- `persistence.js` - Added users table, auth methods, session secret
- `server.js` - Added session middleware, auth routes, protected existing routes
- `views/dashboard.ejs` - Added username display and navigation links

## Upgrade Instructions

### UNRAID

1. Go to Docker tab
2. Stop AWS EUM X container
3. Click "Force Update" to pull latest image
4. Start container
5. Navigate to WebUI
6. Complete first-time setup

### Docker CLI

```bash
docker stop aws-eum-x
docker rm aws-eum-x
docker pull ghcr.io/n85uk/aws-eum-x:v0.1.3
docker run -d \
  --name aws-eum-x \
  -p 8080:8080 \
  -e PUID=99 \
  -e PGID=100 \
  -v /path/to/data:/app/data \
  ghcr.io/n85uk/aws-eum-x:v0.1.3
```

Then navigate to `http://localhost:8080` and complete setup.

## Support

If you encounter any issues:

1. Check the container logs: `docker logs aws-eum-x`
2. Ensure data directory is writable (PUID/PGID correct)
3. Report bugs on [GitHub Issues](https://github.com/N85UK/UNRAID_Apps/issues)

## Credits

Built with:

- bcrypt (password hashing)
- express-session (session management)
- connect-sqlite3 (session store)
- better-sqlite3 (database)

---

[Full Changelog](https://github.com/N85UK/UNRAID_Apps/compare/aws-eum-x-v0.1.2...aws-eum-x-v0.1.3)
