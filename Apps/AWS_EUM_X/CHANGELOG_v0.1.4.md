# AWS EUM X v0.1.4 - 2FA & AWS Integration

**Release Date:** October 17, 2025

## Overview

Version 0.1.4 adds **Two-Factor Authentication (TOTP)** for enhanced security and **AWS Origination Number auto-fetching** for easier configuration. These are non-breaking additions that enhance the existing authentication system.

## What's New

### 🔐 Phase 2: Two-Factor Authentication (TOTP)

Complete 2FA implementation using Time-based One-Time Passwords (TOTP):

#### Setup Process

1. **Generate Secret**: Click "Setup 2FA" in config page
2. **Scan QR Code**: Use any authenticator app:
   - Google Authenticator
   - Authy
   - Microsoft Authenticator
   - 1Password
   - Any TOTP-compatible app
3. **Verify**: Enter 6-digit code to confirm setup
4. **Enable**: 2FA is now active for your account

#### Login with 2FA

- Enter username and password as usual
- If 2FA is enabled, a third field appears
- Enter the 6-digit code from your authenticator app
- Invalid codes show clear error messages

#### Management

- **Enable**: Setup wizard with QR code in config page
- **Disable**: One-click disable (removes secret and requirement)
- **Re-setup**: Disable and setup again to change authenticator device
- **Status**: Visual indicator shows if 2FA is enabled

### 📱 Phase 3: AWS Origination Numbers

Automatic fetching of your AWS Pinpoint phone numbers:

#### Features

- **One-Click Fetch**: Button in config page to load numbers from AWS
- **Number Details**: Displays:
  - Phone number (E.164 format)
  - Status (active, pending, etc.)
  - Type (toll-free, long code, short code)
  - Capabilities (SMS, voice, etc.)
- **Easy Selection**: Copy phone numbers for use in send form
- **Real-time**: Always shows current AWS configuration

#### How to Use

1. Configure AWS credentials in config page
2. Click "Fetch from AWS" button
3. Your origination numbers appear in a list
4. Copy any number to use in dashboard send form

## New API Endpoints

### 2FA Management

#### POST /auth/2fa/setup

Setup 2FA for authenticated user.

**Request:** None (uses session)

**Response:**

```json
{
  "ok": true,
  "secret": "JBSWY3DPEHPK3PXP",
  "qrCode": "data:image/png;base64,..."
}
```

#### POST /auth/2fa/verify

Verify TOTP token and enable 2FA.

**Request:**

```json
{
  "token": "123456"
}
```

**Response:**

```json
{
  "ok": true,
  "message": "2FA enabled successfully"
}
```

#### POST /auth/2fa/disable

Disable 2FA for authenticated user.

**Response:**

```json
{
  "ok": true,
  "message": "2FA disabled successfully"
}
```

#### GET /auth/2fa/status

Get current 2FA status.

**Response:**

```json
{
  "ok": true,
  "enabled": true
}
```

### AWS Integration

#### GET /api/origination-numbers

Fetch origination numbers from AWS Pinpoint.

**Response:**

```json
{
  "ok": true,
  "numbers": [
    {
      "phoneNumber": "+442012345678",
      "status": "ACTIVE",
      "type": "LONG_CODE",
      "capabilities": ["SMS", "VOICE"]
    }
  ]
}
```

## Technical Implementation

### 2FA (TOTP)

**Library:** speakeasy ^2.0.0

**Features:**

- 32-character base32 secrets
- 30-second time step
- SHA-1 algorithm (TOTP standard)
- 2-step time window (tolerance for clock skew)
- 6-digit codes

**Security:**

- Secrets stored encrypted in SQLite
- QR codes generated server-side as data URLs
- No QR code persistence (generated on-demand)
- Token validation prevents replay attacks
- Clear separation between setup and enabled states

### Database Schema Updates

**Users Table Changes:**

```sql
ALTER TABLE users ADD COLUMN totp_secret TEXT;
ALTER TABLE users ADD COLUMN totp_enabled INTEGER DEFAULT 0;
```

Note: These are backward-compatible. Existing users have NULL/0 values (2FA disabled).

### QR Code Generation

**Library:** qrcode ^1.5.3

**Implementation:**

- Generated as data URLs (base64-encoded PNG)
- Embedded directly in HTML (no file storage)
- Standard TOTP URI format: `otpauth://totp/AWS%20EUM%20X%20(username)?secret=...&issuer=AWS%20EUM%20X`

### AWS SDK Integration

**Command:** DescribePhoneNumbersCommand

**Parameters:**

- MaxResults: 100 (fetches up to 100 numbers)
- Uses existing AWS client configuration
- Requires same credentials as SMS sending

## User Experience Improvements

### Config Page Enhancements

1. **2FA Section:**
   - Status badge (enabled/disabled)
   - Setup button with wizard
   - QR code display area
   - Manual secret display
   - Verification input
   - Enable/disable controls

2. **AWS Numbers Section:**
   - Fetch button
   - Loading states
   - Number list with details
   - Error handling

### Login Flow

- **Without 2FA**: Username + Password (unchanged)
- **With 2FA**: Username + Password + TOTP Code (6 digits)
- Auto-focus on relevant field
- Clear error messages
- Username preservation on 2FA error

### Visual Feedback

- Success messages (green)
- Error messages (red)
- Loading indicators
- Status badges
- Inline help text

## Security Considerations

### 2FA Implementation

✅ **Best Practices:**

- Standard TOTP (RFC 6238)
- Secure secret generation (32 characters)
- Time-step tolerance (±60 seconds)
- No secret exposure in logs
- One-time verification during setup

⚠️ **Known Limitations:**

- No backup codes (planned for future)
- Single device (can re-setup for new device)
- No recovery email (disable via admin)

#### AWS Integration Security

- Uses authenticated endpoints only
- No credential storage in origination numbers
- Read-only operation (no modifications)
- Same permissions as SMS sending

## Migration Guide

### From v0.1.3 to v0.1.4

**No action required for existing deployments!**

1. Pull new image: `docker pull ghcr.io/n85uk/aws-eum-x:v0.1.4`
2. Restart container
3. Database schema auto-updates on startup
4. All existing functionality works unchanged
5. 2FA is disabled by default for all users

### Enabling 2FA (Optional)

1. Login to application
2. Navigate to Config page
3. Scroll to "Two-Factor Authentication (TOTP)" section
4. Click "Setup 2FA"
5. Scan QR code with authenticator app
6. Enter code to verify
7. 2FA is now enabled
8. Next login will require TOTP code

## Testing Checklist

✅ **2FA Setup:**

- [ ] Setup button generates QR code
- [ ] QR code scannable by authenticator apps
- [ ] Manual secret works in authenticator
- [ ] Verification with correct code succeeds
- [ ] Verification with incorrect code fails
- [ ] Status updates after enabling

✅ **2FA Login:**

- [ ] Login requires TOTP when 2FA enabled
- [ ] Correct TOTP allows login
- [ ] Incorrect TOTP shows error
- [ ] Username preserved on TOTP error
- [ ] Login works without 2FA when disabled

✅ **2FA Disable:**

- [ ] Disable button removes 2FA
- [ ] Login no longer requires TOTP
- [ ] Can re-enable 2FA after disabling
- [ ] New secret generated on re-setup

✅ **AWS Origination Numbers:**

- [ ] Fetch button loads numbers from AWS
- [ ] Numbers display with correct details
- [ ] Error shown if AWS not configured
- [ ] Error shown if fetch fails
- [ ] Loading indicator shows during fetch

✅ **Backward Compatibility:**

- [ ] Existing users login without 2FA
- [ ] No database migration errors
- [ ] All v0.1.3 features work
- [ ] Sessions persist across upgrade

## Breaking Changes

**None!** This is a fully backward-compatible release.

- 2FA is optional (disabled by default)
- Existing authentication works unchanged
- Database migrations are automatic
- No configuration changes required

## Known Issues

None at this time. Please report issues on [GitHub](https://github.com/N85UK/UNRAID_Apps/issues).

## What's Next

Planned features for future releases:

### v0.1.5 (Coming Soon)

- 2FA backup codes for recovery
- Password change functionality
- User profile management
- Session management UI (view active sessions)

### v0.2.0 (Future)

- Multiple user accounts
- Role-based access control (admin, user, read-only)
- Audit logging
- API keys for programmatic access

## Dependencies Added

```json
{
  "speakeasy": "^2.0.0",
  "qrcode": "^1.5.3"
}
```

## Files Changed

### New Files

- `lib/totp.js` - TOTP utility functions (generate, verify, QR codes)

### Modified Files

- `package.json` - Added speakeasy and qrcode, bumped version to 0.1.4
- `persistence.js` - Added 2FA columns and methods
- `server.js` - Added 2FA routes and AWS origination endpoint
- `views/login.ejs` - Added conditional 2FA input field
- `views/config.ejs` - Fixed 2FA variable name

## Upgrade Instructions

### UNRAID

1. Go to Docker tab
2. Stop AWS EUM X container
3. Click "Force Update" to pull latest image
4. Start container
5. Navigate to WebUI
6. Everything works as before!
7. (Optional) Setup 2FA in config page

### Docker CLI

```bash
docker stop aws-eum-x
docker pull ghcr.io/n85uk/aws-eum-x:v0.1.4
docker start aws-eum-x
```

No data loss, no configuration changes needed!

## Support

If you encounter any issues:

1. Check container logs: `docker logs aws-eum-x`
2. Verify AWS credentials are configured
3. Try disabling/re-enabling 2FA if issues with TOTP
4. Report bugs on [GitHub Issues](https://github.com/N85UK/UNRAID_Apps/issues)

## Authenticator App Recommendations

### Recommended Apps

1. **Google Authenticator** (Free)
   - iOS: [App Store](https://apps.apple.com/app/google-authenticator/id388497605)
   - Android: [Play Store](https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2)

2. **Authy** (Free, Multi-device sync)
   - iOS: [App Store](https://apps.apple.com/app/authy/id494168017)
   - Android: [Play Store](https://play.google.com/store/apps/details?id=com.authy.authy)

3. **Microsoft Authenticator** (Free)
   - iOS: [App Store](https://apps.apple.com/app/microsoft-authenticator/id983156458)
   - Android: [Play Store](https://play.google.com/store/apps/details?id=com.azure.authenticator)

4. **1Password** (Paid, Premium features)
   - iOS: [App Store](https://apps.apple.com/app/1password/id568903335)
   - Android: [Play Store](https://play.google.com/store/apps/details?id=com.agilebits.onepassword)

All apps support standard TOTP and will work with AWS EUM X.

## Credits

Built with:

- speakeasy (TOTP generation/verification)
- qrcode (QR code generation)
- AWS SDK for JavaScript v3 (Pinpoint API)

---

[Full Changelog](https://github.com/N85UK/UNRAID_Apps/compare/aws-eum-x-v0.1.3...aws-eum-x-v0.1.4)
