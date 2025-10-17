# AWS EUM v3.0.8 - Critical UI and Functionality Fixes

## Release Date

October 11, 2024

## Version

**3.0.8** - Critical bug fixes for user interface and functionality

## Issues Fixed

### 1. **"Missing required fields" Error** (CRITICAL)

**Problem:** SMS form always returned "Missing required fields" error when trying to send messages.

**Root Cause:** Form field mismatch between frontend and backend

- Frontend HTML: `<input name="destination">`
- Backend API expects: `req.body.phoneNumber`

**Fix:** Changed form field from `name="destination"` to `name="phoneNumber"` to match API expectations

**Impact:** SMS sending now works correctly ✅

---

### 2. **Charts Expanding Down Entire Page** (CRITICAL)

**Problem:** Message Statistics and Success Rate charts kept expanding vertically, filling the entire page and making UI unusable.

**Root Cause:** Chart.js configuration had `maintainAspectRatio: false` which allows unlimited expansion

**Files Changed:**

- `public/js/app-v3.js` - `initMessageChart()`
- `public/js/app-v3.js` - `initSuccessChart()`

**Fix:** Changed both charts to `maintainAspectRatio: true`

**Impact:** Charts now maintain proper size and aspect ratio ✅

---

### 3. **DISABLE_CSP Default Value**

**Problem:** Template defaulted to `DISABLE_CSP=false` which caused CSP errors on custom bridge networks (br0.x)

**Fix:** Changed XML template default to `DISABLE_CSP=true` for better compatibility with custom networks

**Files Changed:**

- `my-aws-eum.xml` - Default changed from `false` to `true`

**Impact:** New installations work immediately on br0.x networks ✅

---

### 4. **Data Directory Permission Warning**

**Note:** This is a warning, not a critical error

**Warning in logs:**

```
Error saving update info: EACCES: permission denied, open '/data/update-info.json'
```

**Cause:** The container runs as non-root user (`appuser`) but the mounted `/data` volume may have incorrect ownership

**Solution:** Run on UNRAID host:

```bash
chown -R 1000:1000 /mnt/user/appdata/aws-eum
```

**Impact:** Update check information will persist correctly ✅

---

## Files Modified

1. **views/index-v3.ejs** - Fixed form field name (`destination` → `phoneNumber`)
2. **public/js/app-v3.js** - Fixed chart aspect ratio settings (2 locations)
3. **my-aws-eum.xml** - Changed DISABLE_CSP default to `true`
4. **package.json** - Version bump to 3.0.8
5. **server.js** - Version bump to 3.0.8
6. **Dockerfile** - Version bump to 3.0.8

## Verification

### SMS Sending Works

```bash
docker logs AWS_EUM | grep "sending"
```

Should NOT show: `Missing required fields` ✅

### Charts Display Correctly

- Visit <http://10.0.2.11:80>
- Charts should be properly sized and not expanding
- Check: Message Statistics chart is ~300-400px tall ✅

### CSP Disabled

```bash
docker logs AWS_EUM | grep CSP
```

Should show:

```
🔒 CSP Configuration:
   - DISABLE_CSP: true
🔓 CSP completely disabled via environment variable
```

✅

## Upgrade Instructions

### For Existing Containers

1. **Pull new image:**

   ```bash
   docker pull ghcr.io/n85uk/aws-eum:latest
   ```

2. **Update container via UNRAID UI:**
   - Docker tab → AWS_EUM
   - Force Update
   - Start

3. **Verify version in logs:**

   ```bash
   docker logs AWS_EUM | grep "v3.0.8"
   ```

   Should show: `🚀 AWS EUM v3.0.8 server running on port 80`

4. **Fix data directory permissions (optional):**

   ```bash
   chown -R 1000:1000 /mnt/user/appdata/aws-eum
   ```

5. **Restart container:**

   ```bash
   docker restart AWS_EUM
   ```

### For New Installations

The XML template now has better defaults:

- `DISABLE_CSP=true` (for br0.x compatibility)
- All other settings optimized

Just install via Community Applications and it will work! ✅

## Breaking Changes

None. This is a pure bug fix release.

## Known Issues

None. All critical issues resolved.

## Testing Performed

- ✅ SMS sending with multiple originators
- ✅ Chart rendering and sizing
- ✅ Dark mode toggle
- ✅ Message history
- ✅ CSP disabled on br0.2 network
- ✅ Container starts without errors
- ✅ All static resources load

## Next Steps

The automated Git Flow will build this new version automatically:

1. Tag v3.0.8 created and pushed ✅
2. GitHub Actions building Docker image (5-10 minutes)
3. Image available at `ghcr.io/n85uk/aws-eum:3.0.8` and `:latest`
4. Watchtower will auto-update containers using `:latest`

---

**Summary:** All critical UI bugs fixed. SMS sending works, charts display correctly, CSP defaults improved. Immediate upgrade recommended! 🚀
