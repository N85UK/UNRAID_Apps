# AWS EUM v3.0.7 - Critical Bug Fixes

## Release Date
October 11, 2024

## Version
**3.0.7** - Critical bug fix release

## Critical Issues Fixed

### 1. **Syntax Error - Corrupted String Literal** (CRITICAL)
**Problem:** Line 248 contained a corrupted string with literal `\n` escape sequences instead of actual newlines, causing the server to crash immediately on startup.

**Original Code:**
```javascript
// Initialize AWS client\ninitializeAWSClient();\n\n// Cache for AWS data...
```

**Fixed Code:**
```javascript
// Initialize AWS client
initializeAWSClient();

// Cache for AWS data (using variables declared above)
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
```

**Impact:** Server would not start at all. This was preventing the Docker container from running.

---

### 2. **Undefined Variable - CURRENT_VERSION** (CRITICAL)
**Problem:** The code referenced `CURRENT_VERSION` in 7 locations, but this constant was never defined. The correct constant name is `APP_VERSION`.

**Locations Fixed:**
- Line 381: Update version comparison
- Line 386: Update info object
- Line 397: Console log output
- Line 543: Config object
- Line 557: Config object (error handler)
- Line 762: API health endpoint
- Line 1019: Update check endpoint
- Line 1033: Server startup message

**Original Code:**
```javascript
console.log(`🚀 AWS EUM v${CURRENT_VERSION} server running on port ${PORT}`);
```

**Fixed Code:**
```javascript
console.log(`🚀 AWS EUM v${APP_VERSION} server running on port ${PORT}`);
```

**Impact:** Server would crash during startup when logging the version number or during auto-update checks.

---

### 3. **Missing Views Directory Configuration**
**Problem:** The EJS view engine was configured but the views directory path was never explicitly set, which could cause issues finding templates.

**Original Code:**
```javascript
app.set('view engine', 'ejs');
```

**Fixed Code:**
```javascript
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
```

**Impact:** Potential template rendering failures in certain environments.

---

## Verification

All fixes have been tested and verified:

```bash
✅ Syntax check passed: node -c server.js
✅ Server starts successfully without errors
✅ Auto-update checking works correctly
✅ Version number displays correctly in logs
✅ All required files present and accessible
```

## Server Startup Output (After Fixes)

```
🔒 CSP Configuration:
   - DISABLE_CSP: false
   - CSP_POLICY: default
   - NETWORK_HOST: http://10.0.2.11
🔒 Using network-specific CSP policy
⚠️  AWS credentials not configured
Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables
🚀 AWS EUM v3.0.7 server running on port 80
🌐 HTTP Server: http://0.0.0.0:80
🌍 AWS Region: eu-west-2
📁 Public directory: /Users/paul.mccann/UNRAID_Apps/Apps/AWS_EUM/public
📄 CSS file exists: true (/Users/paul.mccann/UNRAID_Apps/Apps/AWS_EUM/public/css/style-v3.css)
📄 JS file exists: true (/Users/paul.mccann/UNRAID_Apps/Apps/AWS_EUM/public/js/app-v3.js)
📊 CSS file size: 11026 bytes
🔐 AWS Configured: false
⚠️  Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY to enable AWS features
🔄 Auto-update: enabled
🧪 Static file diagnostics: http://0.0.0.0:80/api/debug/static
🎨 CSS direct access: http://0.0.0.0:80/css/style.css
📱 Auto-update checking enabled (every 24 hours)
🔍 Checking for updates...
✅ Application is up to date
```

## Files Changed

1. `server.js` - Fixed syntax errors and undefined variable references
2. `package.json` - Version bump to 3.0.7
3. `Dockerfile` - Version bump to 3.0.7

## Upgrade Instructions

### For Docker Users

The container should now start properly. If you experienced the 502 Bad Gateway error:

1. **Stop and remove the old container:**
   ```bash
   docker stop AWS_EUM
   docker rm AWS_EUM
   ```

2. **Pull the updated image:**
   ```bash
   docker pull ghcr.io/n85uk/aws-eum-v3:3.0.7
   ```

3. **Start the container** using your UNRAID template or docker-compose

### For UNRAID Users

1. **Stop the container** in UNRAID Docker UI
2. **Edit the container** and change the repository tag to `:3.0.7` (or use `:latest`)
3. **Force update** to pull the new image
4. **Start the container**
5. **Check the logs** - you should see the version as `v3.0.7` and no errors

## Breaking Changes

None. This is a pure bug fix release with no API or configuration changes.

## Known Issues

None. All critical startup issues have been resolved.

## Next Steps

- GitHub Actions will automatically build and push the new Docker image
- Watchtower will auto-update containers using the `:latest` tag
- Manual updates required for pinned version tags

---

**Critical Severity:** This release fixes show-stopper bugs that prevented the application from starting. Immediate upgrade is **strongly recommended** for all users experiencing startup issues.
