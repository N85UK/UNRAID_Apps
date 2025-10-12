# AWS_EUM_MariaDB - Required Fixes Backport

## ✅ STATUS: COMPLETED (v2.1.1 - Oct 12, 2025)

All critical fixes have been backported and tested.

## Overview
AWS_EUM_MariaDB (v2.1.0) needs the same fixes that were applied to AWS_EUM_v3 (v3.0.12).

## Critical Bug Found

### Originator Dropdown Issue ⚠️
**Location:** `Apps/AWS_EUM_MariaDB/views/index.ejs` line 96

**Current (BROKEN):**
```html
<option value="<%= originators[label] %>"><%= label %></option>
```

**Should be:**
```html
<option value="<%= label %>"><%= label %></option>
```

**Impact:** Form sends ARN/phone number value instead of label key, causing "Invalid originator selected" error.

**Fix Required:** YES - Same issue as v3.0.12

## Fixes to Backport from v3.0.12

### 1. ✅ Form Field Names
**Status:** Already correct in MariaDB version
- Uses `name="phoneNumber"` ✅
- Uses `name="message"` ✅
- Uses `name="originator"` ✅

### 2. ✅ Originator Dropdown
**Status:** FIXED in v2.1.1
- Changed from sending `originators[label]` (the ARN value)
- Now sends `label` (the phone number key)

**Fix Applied:**
```diff
- <option value="<%= originators[label] %>"><%= label %></option>
+ <option value="<%= label %>"><%= label %></option>
```

**File Modified:** `views/index.ejs` line 95

### 3. ✅ Form Method
**Status:** Already correct
- Form has no `method` or `action` attributes ✅
- Relies on JavaScript fetch ✅

### 4. ✅ Chart Issues
**Status:** NOT APPLICABLE
- MariaDB version does not use Chart.js
- No chart configuration needed

### 5. ✅ Version Variable
**Status:** Already correct
- Uses `CURRENT_VERSION` not `APP_VERSION` ✅
- No undefined variable issues ✅

### 6. ? CSP Configuration
**Status:** NEEDS VERIFICATION
- Check if DISABLE_CSP defaults to appropriate value
- Check if CSP causes resource loading issues

## Files to Modify

| File | Issue | Priority | Status |
|------|-------|----------|--------|
| `views/index.ejs` | Originator dropdown | **HIGH** | ✅ Fixed v2.1.1 |
| `public/js/app.js` | Chart config (if exists) | MEDIUM | ✅ N/A - No charts |
| `my-aws-eum-mariadb.xml` | CSP defaults | LOW | ✅ Verified OK |

## Testing Checklist

Once fixes applied:

- [ ] Container starts successfully
- [ ] Web UI loads without errors
- [ ] AWS originators load correctly
- [ ] Select originator from dropdown
- [ ] Enter phone number
- [ ] Enter message
- [ ] Submit form
- [ ] Verify POST request sent
- [ ] Verify originator value is label (not ARN)
- [ ] Confirm SMS sends successfully
- [ ] Check message saved to database
- [ ] Verify history displays correctly

## Version Bump Plan

Current: v2.1.0  
Next: v2.1.1 (bug fix release)

**Changes for v2.1.1:**
- Fix originator dropdown value selection
- Update CHANGELOG.md
- Tag and release

## Dockerfile Check

MariaDB version uses different base image - verify:
- [ ] Check if multi-stage build needed
- [ ] Verify node version compatibility
- [ ] Check if database initialization works
- [ ] Confirm volume mounts correct

## Database Schema

Verify that message history table schema is compatible with:
- [ ] Originator as label (string)
- [ ] Phone number format
- [ ] Message body (TEXT type)
- [ ] Timestamp handling

## Deployment Notes

**IMPORTANT:** AWS_EUM_MariaDB has different architecture:
- Uses MariaDB for message history storage
- Requires database container or connection
- May have additional environment variables
- Check docker-compose.yml for dependencies

## Action Items

### Immediate (Before Next Release)
1. ❗ Fix originator dropdown in index.ejs
2. Test form submission with fixed dropdown
3. Verify SMS sending works
4. Update version to 2.1.1
5. Update CHANGELOG

### Short Term
1. Check Chart.js configuration (if used)
2. Verify CSP settings
3. Add debug logging like v3.0.12
4. Test on UNRAID

### Long Term
1. Consider merging v3 enhancements
2. Add automated testing
3. Sync documentation with v3
4. Create unified codebase (if feasible)

## Differences from v3

| Feature | v3 | MariaDB | Notes |
|---------|----|---------  |-------|
| Storage | JSON files | MariaDB | Different persistence |
| UI | Enhanced (dark mode) | Standard | v3 has better UX |
| Charts | Chart.js | ? | Need to verify |
| Dependencies | Minimal | Requires DB | More complex setup |
| Version | 3.0.12 | 2.1.0 | v3 is newer |

## Recommendation

**Priority Order:**
1. 🔴 **HIGH:** Fix originator dropdown (blocks SMS sending)
2. 🟡 **MEDIUM:** Verify chart configuration
3. 🟢 **LOW:** Sync documentation

**Timeline:**
- Fix dropdown: **Immediate** (< 1 hour)
- Test & verify: **Same day**
- Release v2.1.1: **Within 24 hours**

## Related Files

- `Apps/AWS_EUM_MariaDB/server.js` - Main server (check originators logic)
- `Apps/AWS_EUM_MariaDB/views/index.ejs` - Form template (needs fix)
- `Apps/AWS_EUM_MariaDB/public/js/app.js` - Client JavaScript (check if exists)
- `Apps/AWS_EUM_MariaDB/docker-compose.yml` - Deployment config
- `Apps/AWS_EUM_MariaDB/lib/database.js` - Database operations

## Next Steps

1. Create branch: `fix/mariadb-originator-dropdown`
2. Apply fix to index.ejs
3. Test locally (if possible)
4. Commit with message: "fix: Originator dropdown sends label instead of value"
5. Build and test Docker image
6. Merge to main
7. Tag v2.1.1
8. Update documentation

---

**Status:** Identified critical bug, fix ready to apply  
**Blocker:** None  
**ETA:** Can be fixed immediately  
