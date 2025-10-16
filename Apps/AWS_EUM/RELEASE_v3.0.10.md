# AWS End User Messaging v3.0.10 - Critical Bug Fix Release

**Release Date:** October 12, 2025  
**Version:** 3.0.10  
**Type:** Hotfix Release

## 🐛 Critical Bug Fixes

This release addresses **two critical runtime JavaScript errors** that were causing the application to malfunction in v3.0.9:

### 1. **ChartManager Reference Error (CRITICAL)**
- **Issue:** JavaScript attempted to call `ChartManager.updateMessageChart()` even though ChartManager was removed in v3.0.9
- **Impact:** This caused a runtime error: `Uncategorized ReferenceError: ChartManager is not defined`
- **Symptoms:** "Network error - please try again" notification appeared when sending messages
- **Fix:** Removed all remaining ChartManager method calls from:
  - `FormHandler.updateStats()` - Removed chart update after successful message send
  - `RealTimeManager.updateChartsWithRealData()` - Removed chart updates from real-time stats
  - `RealTimeManager.updateChartsWithFallbackData()` - Removed chart updates from fallback data
- **Result:** Clean JavaScript execution with no undefined references

### 2. **Message History Display Bug (CRITICAL)**
- **Issue:** Frontend template referenced `msg.destination` but server sends `msg.phoneNumber`
- **Impact:** Message history showed "undefined" for phone numbers
- **Symptoms:** Messages were sent successfully but history section didn't display phone numbers
- **Fix:** Changed template from `${msg.destination}` to `${msg.phoneNumber}` in `HistoryManager.render()`
- **Result:** Phone numbers now display correctly in message history

## 🔍 Root Cause Analysis

When charts were removed in v3.0.9:
- ✅ Chart.js and Moment.js CDN includes were removed from HTML
- ✅ ChartManager module (115 lines) was deleted from JavaScript
- ✅ Chart HTML containers were removed from template
- ✅ Chart CSS styles were removed
- ❌ **MISSED:** Calls to ChartManager methods were left in FormHandler and RealTimeManager
- ❌ **MISSED:** Template variable name didn't match server response structure

## 📊 Changes Summary

| Component | Change | Lines Modified |
|-----------|--------|----------------|
| `public/js/app-v3.js` | Removed ChartManager.updateMessageChart() call from FormHandler | -3 lines |
| `public/js/app-v3.js` | Removed ChartManager calls from RealTimeManager (2 methods) | -6 lines |
| `public/js/app-v3.js` | Fixed message history phone number field name | 1 line |
| `server.js` | Updated APP_VERSION to 3.0.10 | 1 line |
| `package.json` | Updated version to 3.0.10 | 1 line |
| `Dockerfile` | Updated version to 3.0.10 | 1 line |

**Total Code Reduction:** 9 lines removed, 3 lines modified

## ✅ Validation Performed

- ✅ JavaScript syntax validation: `node -c public/js/app-v3.js` - PASSED
- ✅ No ChartManager references remaining in codebase
- ✅ Template variable matches server response structure
- ✅ All message history fields properly mapped

## 🚀 Upgrade Instructions

### For Docker Users (UNRAID, Portainer, etc.)

1. **Pull the new image:**
   ```bash
   docker pull ghcr.io/n85uk/aws-eum:latest
   # OR specific version:
   docker pull ghcr.io/n85uk/aws-eum:3.0.10
   ```

2. **Force update your container** in UNRAID Docker UI or recreate with:
   ```bash
   docker stop aws-eum
   docker rm aws-eum
   docker run -d \
     --name aws-eum \
     --network br0 \
     --ip 10.0.2.11 \
     -e DISABLE_CSP=true \
     -e AWS_ACCESS_KEY_ID=your_key \
     -e AWS_SECRET_ACCESS_KEY=your_secret \
     -e AWS_REGION=eu-west-2 \
     -v /mnt/user/appdata/aws-eum:/app/data \
     ghcr.io/n85uk/aws-eum:latest
   ```

3. **Test the application:**
   - Navigate to http://10.0.2.11 (or your configured IP)
   - Send a test SMS message
   - Verify message appears in history with phone number displayed
   - Check browser console (F12) - should have no JavaScript errors

## 🔧 What's Fixed

### Before v3.0.10 (Broken):
```
User sends SMS → Success notification appears → 
JavaScript error: "ChartManager is not defined" → 
Network error notification → 
Message sent but history shows "undefined" for phone number
```

### After v3.0.10 (Working):
```
User sends SMS → Success notification appears → 
No JavaScript errors → 
Message appears in history with phone number displayed correctly
```

## 📝 Technical Details

### ChartManager Method Stubs
The following methods now contain only deprecation comments:
- `RealTimeManager.updateChartsWithRealData(stats)` - No longer performs chart updates
- `RealTimeManager.updateChartsWithFallbackData()` - No longer performs chart updates

These methods are kept for compatibility with the existing RealTimeManager initialization flow but perform no operations.

### Message History Data Structure

**Server Response Format:**
```json
{
  "success": true,
  "count": 1,
  "history": [
    {
      "timestamp": "2025-10-12T10:30:00.000Z",
      "originator": "MySender",
      "phoneNumber": "+447123456789",  // ← Correct field name
      "message": "Test message",
      "messageId": "abc123",
      "messageInfo": { ... }
    }
  ]
}
```

**Template Variable (Now Fixed):**
```javascript
${msg.phoneNumber}  // ✅ Matches server response
// Was: ${msg.destination}  // ❌ Undefined - server doesn't send this
```

## 🎯 Version Compatibility

- **Upgrading from v3.0.9:** Direct upgrade, no breaking changes
- **Upgrading from v3.0.8 or earlier:** Charts will be removed, message history fixed
- **Upgrading from v2.x:** See MIGRATION.md for full migration guide

## 🔐 Security Notes

- No security vulnerabilities addressed in this release
- Non-root container execution maintained (appuser UID 1000)
- CSP configuration unchanged (DISABLE_CSP=true still required for UNRAID)

## 📚 Related Issues

- Resolves: "Network error - please try again" on message send
- Resolves: Message history shows "undefined" for phone numbers
- Resolves: JavaScript console errors referencing ChartManager

## 🙏 Acknowledgments

This release fixes critical runtime bugs discovered immediately after v3.0.9 deployment. Thank you to users who reported the "Network error" and missing phone numbers issues.

## 📞 Support

If you encounter any issues:
1. Check browser console for JavaScript errors
2. Verify container logs: `docker logs aws-eum`
3. Ensure environment variables are correctly set
4. Report issues on GitHub: https://github.com/N85UK/UNRAID_Apps/issues

---

**Previous Release:** [v3.0.9 - Chart Removal and Message History Fix](RELEASE_v3.0.9.md)  
**Full Changelog:** [CHANGELOG.md](../../CHANGELOG.md)
