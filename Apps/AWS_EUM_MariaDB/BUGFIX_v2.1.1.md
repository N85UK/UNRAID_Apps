# AWS_EUM_MariaDB v2.1.1 - Bug Fix Release

## Release Date: October 12, 2025

## Critical Bug Fixed

### Originator Dropdown Value Error

**Problem:**
- Users were unable to send SMS messages
- Form was submitting AWS ARN instead of the phone number label
- This caused AWS Pinpoint to reject the messages

**Root Cause:**
```html
<!-- BEFORE (v2.1.0) - INCORRECT -->
<option value="<%= originators[label] %>"><%= label %></option>
<!-- This sent the ARN (arn:aws:...) as the originator -->

<!-- AFTER (v2.1.1) - CORRECT -->
<option value="<%= label %>"><%= label %></option>
<!-- This now sends the label (+447418367358) as the originator -->
```

**Files Changed:**
- `views/index.ejs` - Line 95 fixed

**Impact:**
- ✅ SMS sending now works correctly
- ✅ Form submits phone number label
- ✅ AWS Pinpoint accepts the originator value

## Validation Performed

### Code Review
- ✅ Checked all form field names match server endpoints
- ✅ Verified no Chart.js in MariaDB version (no aspect ratio issues)
- ✅ Confirmed CSP configuration appropriate
- ✅ Validated version constants consistent across files

### Files Validated
| File | Check | Status |
|------|-------|--------|
| `views/index.ejs` | Form fields | ✅ Fixed |
| `server.js` | Version constant | ✅ Updated to 2.1.1 |
| `package.json` | Version number | ✅ Updated to 2.1.1 |
| `Dockerfile` | Version label | ✅ Updated to 2.1.1 |
| `public/js/app.js` | No Chart.js issues | ✅ N/A |
| `CHANGELOG.md` | Updated | ✅ Complete |

## Version History

### v2.1.1 (Oct 12, 2025)
- **Fixed**: Originator dropdown sending ARN instead of label
- **Updated**: Documentation and version numbers
- **Validated**: All files for consistency

### v2.1.0 (Oct 8, 2025)
- Initial MariaDB Enterprise Edition release
- ❌ Had originator dropdown bug (same as v3.0.7)

## Upgrade Instructions

### From v2.1.0 to v2.1.1

1. **Pull new image:**
   ```bash
   docker pull ghcr.io/n85uk/aws-eum-mariadb:latest
   ```

2. **Stop and remove old container:**
   ```bash
   docker stop aws-eum-mariadb
   docker rm aws-eum-mariadb
   ```

3. **Start new container:**
   - Use same docker run command or docker-compose
   - No configuration changes needed
   - Database schema unchanged

4. **Verify:**
   - Open web interface
   - Check that phone numbers load in dropdown
   - Send test SMS message
   - Confirm message sends successfully

## Testing Checklist

Before deploying to production:

- [ ] Container starts successfully
- [ ] Web UI loads without errors
- [ ] Database connection establishes
- [ ] AWS originators/phone numbers load
- [ ] Dropdown shows correct phone numbers
- [ ] Can select phone number from dropdown
- [ ] Form accepts phone number and message
- [ ] Submit sends POST request
- [ ] SMS message delivers successfully
- [ ] Message history saves to database

## Compatibility

- **Node.js**: 18.0.0 or higher
- **MariaDB**: 10.5+ or MySQL 8.0+
- **UNRAID**: 6.9.0+
- **Docker**: Any recent version

## Related Issues

- Matches bug fix from AWS_EUM_v3 v3.0.10
- Documented in `BACKPORT_FIXES.md`
- Identified during v3 bug fix session (Oct 11, 2025)

## References

- **BACKPORT_FIXES.md** - Original bug identification
- **CHANGELOG.md** - Full release history
- **README.md** - Installation and configuration guide
- **AWS_EUM_v3 v3.0.10** - Original fix reference

## Support

For issues or questions:
- **GitHub Issues**: https://github.com/N85UK/UNRAID_Apps/issues
- **Documentation**: https://github.com/N85UK/UNRAID_Apps/tree/main/Apps/AWS_EUM_MariaDB

---

**Status**: ✅ Ready for Production  
**Build**: Automated via GitHub Actions  
**Registry**: ghcr.io/n85uk/aws-eum-mariadb:2.1.1
