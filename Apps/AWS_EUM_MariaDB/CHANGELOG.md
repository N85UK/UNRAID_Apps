# AWS End User Messaging (EUM) - Changelog

All notable changes to AWS EUM will be documented in this file.

## [2.1.3] - 2025-10-13

### ✨ New Features

- **Auto Database Initialization**: Database and all tables now created automatically on first start
  - No manual SQL setup required anymore
  - Creates database if it doesn't exist
  - Creates all 7 required tables (users, messages, originators, settings, analytics, sessions, api_keys)
  - Inserts default settings automatically
  - Creates default admin user if no users exist

### 🚀 Improvements

- Enhanced server startup with clear status messages
- Better error handling with helpful troubleshooting tips
- Automatic database health check on startup
- Beautiful formatted console output with clear sections
- Default admin user: `admin` / `admin123` (change immediately!)

### 🔧 Technical Details

- **New Module**: `lib/db-init.js` - Automatic database initialization
- **Enhanced**: `server.js` - Async startup with database check and creation
- **Database**: Automatically creates `aws_eum` database with utf8mb4 charset
- **Tables**: All 7 tables created with proper indexes and foreign keys
- **Settings**: 10 default settings inserted automatically
- **Admin**: Default admin user created on first run (if ADMIN_USERNAME/ADMIN_PASSWORD not set)

### 📝 User Experience

- **Zero Configuration**: Just provide DB credentials and the app handles the rest
- **Instant Setup**: No need to run migrations or create database manually
- **Clear Feedback**: Detailed console logs show exactly what's happening
- **Error Guidance**: Helpful error messages with troubleshooting steps

### ⚠️ Security

- Default admin password `admin123` should be changed immediately
- Set `ADMIN_USERNAME` and `ADMIN_PASSWORD` environment variables for custom credentials
- Application warns when default password is being used

## [2.1.2] - 2025-10-12

### 🐛 Bug Fixes

- **Critical**: Fixed CSS not loading due to hardcoded IP addresses
  - Removed hardcoded `http://10.0.2.11` from views/index.ejs CSS link
  - Changed to relative path `/css/style.css` to work on any IP/hostname
  - Removed hardcoded IPs from CSP headers in server.js
  - Application now works correctly on any network configuration

### 🎨 UI Improvements

- Updated page title from "v2.0" to "v2.1 - MariaDB Enterprise Edition"
- Updated header subtitle to highlight database persistence and multi-user support
- Updated footer to show MariaDB Enterprise branding
- Improved version display to show correct v2.1.2

### 📝 Technical Details

- **Files Changed**: views/index.ejs, server.js
- **Root Cause**: Hardcoded IP prevented CSS loading when deployed at different IPs
- **Solution**: Use relative paths compatible with any deployment
- **Impact**: CSS now loads correctly showing modern gradient UI with proper styling

## [2.1.1] - 2025-10-12

### 🐛 Bug Fixes

- **Critical**: Fixed originator dropdown sending ARN instead of label
  - Users were unable to send SMS messages due to incorrect dropdown value
  - Changed `<option value="<%= originators[label] %>">` to `<option value="<%= label %>">`
  - This fix matches the correction applied to v3.0.10
  - Issue identified in BACKPORT_FIXES.md

### 📝 Documentation

- Updated CHANGELOG.md with v2.1.1 release notes
- Confirmed MariaDB version does not use Chart.js (no aspect ratio issues)
- Validated all files for consistency

### ✅ Validation

- Verified form field names match server endpoints
- Confirmed CSP configuration appropriate for MariaDB version
- Checked version constants across all files (server.js, package.json, Dockerfile)

## [2.0.0] - 2025-10-08

### 🚀 Major Release - Complete Rewrite

#### ✨ New Features

- **Automatic AWS Integration**: Auto-discovery of phone numbers and sender IDs from AWS Pinpoint
- **Long Message Support**: Send messages up to 1600 characters with automatic SMS segmentation
- **Real-time Preview**: Live character counting and SMS segment calculation
- **Message History**: Track sent messages with status, timestamps, and retry capabilities
- **Auto-Update System**: Multiple update methods including Watchtower and UNRAID native
- **Enhanced Security**: Rate limiting, input validation, and security headers
- **Modern UI**: Responsive design with beautiful gradients and animations
- **UNRAID Integration**: Complete Community Applications template with dropdowns

#### 🛠️ Technical Improvements

- **Node.js 20**: Latest LTS with enhanced performance and security
- **AWS SDK v3**: Modern AWS integration with better error handling
- **Docker Multi-stage**: Optimized container with health checks and non-root user
- **GitHub Actions**: Automated CI/CD with container registry publishing
- **REST API**: Comprehensive API for external integration and automation
- **Webhook Support**: GitHub webhook integration for instant update notifications

#### 📱 User Experience

- **One-Click Setup**: Automatic originator detection eliminates manual configuration
- **Smart Segmentation**: Intelligent SMS splitting with cost estimation
- **Visual Feedback**: Toast notifications and loading states for all actions
- **Error Handling**: Graceful error recovery with user-friendly messages
- **Performance**: Optimized caching and efficient API calls

#### 🔧 Configuration Options

- Configurable rate limiting (messages per minute)
- Adjustable message length limits
- Debug mode for troubleshooting
- Multiple auto-update strategies
- Resource limits and health monitoring

#### 📋 AWS Requirements

- Valid AWS account with SMS permissions
- AWS Pinpoint SMS configured in your region
- At least one phone number or sender ID registered
- Appropriate IAM permissions for SMS operations

#### 🐛 Bug Fixes

- Fixed character encoding issues with special characters
- Resolved rate limiting edge cases
- Improved error messages for AWS configuration issues
- Fixed responsive design on mobile devices
- Corrected SMS cost calculations for international messages

#### 🚨 Breaking Changes

- Complete rewrite - not compatible with v1.x configurations
- New environment variable names (see documentation)
- Changed default port from 3000 to 80
- AWS credentials now required (no mock mode)

---

## [1.0.0] - 2024-XX-XX

### Initial Release

- Basic SMS sending functionality
- Simple web interface
- Manual phone number entry
- Basic Docker container

---

## Contributing

For feature requests and bug reports, please visit:

- **Issues**: <https://github.com/N85UK/UNRAID_Apps/issues>
- **Documentation**: <https://github.com/N85UK/UNRAID_Apps/tree/main/Apps/AWS_EUM>
- **Support**: <https://github.com/N85UK/UNRAID_Apps/discussions>

## License

This project is licensed under the MIT License - see the LICENSE file for details.
