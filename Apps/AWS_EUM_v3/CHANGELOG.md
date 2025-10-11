# AWS End User Messaging (EUM) - Changelog

All notable changes to AWS EUM will be documented in this file.

## [3.0.6] - 2025-10-11

### 🚨 Critical Container Fixes

#### Environment Variable Corrections
- **Fixed RATE_LIMIT_RPM** → **RATE_LIMIT_MESSAGES** mismatch causing startup failures
- **Fixed RETENTION_DAYS** → **HISTORY_RETENTION** mismatch causing 502 errors
- **Corrected static file references** - now checks for style-v3.css and app-v3.js
- **Unified data directory handling** - supports configurable DATA_DIR environment variable

#### Auto-Update Configuration
- **Latest tag support** - Repository now uses :latest for automatic updates
- **Auto-update settings** - Added AUTO_UPDATE_CHECK and UPDATE_CHECK_INTERVAL variables
- **Continuous security** - Always pulls latest security fixes and features
- **Zero-downtime updates** - Seamless container updates with Watchtower compatibility

#### Container Startup Improvements
- **Proper initialization** - Fixed file path checks preventing startup
- **Better error handling** - Clear logging for troubleshooting
- **Network compatibility** - Works on all bridge types (default, br0.x, custom)
- **Resource optimization** - Improved memory and CPU usage

## [3.0.5] - 2025-10-10

### 🐛 Major Fixes & Code Cleanup

#### Critical Infrastructure Fixes
- **Fixed hardcoded IP addresses** in EJS template - now uses relative paths
- **Removed duplicate API endpoints** - consolidated to /api/ prefix only
- **Fixed chart expansion issues** - stable Chart.js with real-time data
- **Enhanced API error handling** - better JSON parsing and fallback data
- **Added favicon route** - prevents 404 errors in browser console

#### Route Optimization
- **Removed redundant /send-sms** - uses /api/send-sms only
- **Removed redundant /history** - uses /api/history only  
- **Cleaned up static file serving** - removed conflicting CSS/JS routes
- **Fixed file path references** - properly targets style-v3.css and app-v3.js

#### Documentation Cleanup
- **Removed 15+ unnecessary docs** - kept only essential files
- **Version consistency** - all files now reference 3.0.5
- **Regenerated package-lock.json** - fixed version mismatch

#### Chart & Frontend Fixes
- **Real-time stats API** - /api/stats provides meaningful data
- **Chart animation controls** - prevents expansion with stable updates
- **Memory leak fixes** - proper chart cleanup on page unload
- **Better error handling** - graceful degradation for API failures

## [3.0.4] - 2025-10-10

### 🔧 Chart Expansion Fixes

#### Fixed Chart Issues
- **Chart expansion resolved** - replaced random data with real API stats
- **Enhanced error handling** - better JSON parsing with fallback data
- **Real-time improvements** - fetch from /api/stats every 60 seconds
- **Animation controls** - proper chart update methods with 'none' mode

## [3.0.3] - 2025-10-10

### 🔧 Logging Improvements

#### Reduced Log Verbosity
- **Fixed excessive CSP logging** - Removed repetitive "CSP headers disabled" messages
- **Cleaner console output** - CSP status only logged during startup
- **Improved debugging experience** - Focused on essential information only
- **Better production logging** - Reduced noise in container logs

## [3.0.2] - 2025-10-10

### 🐛 Critical Bug Fixes

#### API Route Issues Fixed
- **Fixed 404 errors** for `/api/history` and `/api/send-sms` endpoints
- **Added API aliases** for client-side compatibility
- **Resolved JavaScript errors** in message cost calculation
- **Fixed currency formatting** to handle undefined values gracefully

#### HTTP Headers Issues Fixed
- **Disabled problematic HTTP headers** for HTTP-only deployments
- **Removed Cross-Origin-Opener-Policy** warnings
- **Disabled Origin-Agent-Cluster** header conflicts
- **Improved helmet configuration** for local network deployment

#### JavaScript Fixes
- **Fixed formatCurrency function** to handle undefined amounts
- **Enhanced error handling** in client-side API calls
- **Improved message info calculation** fallback logic

#### Network Compatibility
- **Better HTTP support** for local deployments
- **Reduced browser console warnings** for 10.0.2.11 origins
- **Optimized for UNRAID custom networks**

## [3.0.1] - 2025-10-10

### 🔒 Content Security Policy (CSP) Fixes

#### ✨ New Features
- **Configurable CSP**: Environment variables for CSP configuration
- **Custom Bridge Network Support**: Fixed br0.2, br0.100, and custom network compatibility
- **One-line Fix**: `DISABLE_CSP=true` solves all CSP issues

#### 🛠️ Environment Variables
- `DISABLE_CSP`: Disable CSP headers (recommended for custom networks)
- `NETWORK_HOST`: Network host for CSP whitelist
- `CSP_POLICY`: Advanced custom CSP policy (JSON)

#### 🐛 Bug Fixes
- **Fixed Chart.js loading** on custom bridge networks
- **Fixed Font Awesome icons** blocked by CSP
- **Fixed dark mode toggle** when external resources blocked
- **Resolved CDN blocking** (cdn.jsdelivr.net, cdnjs.cloudflare.com)

#### 📊 Network Solutions
| Network Type | Solution | Result |
|-------------|----------|--------|
| br0.2/br0.100 | `DISABLE_CSP=true` | ✅ All features work |
| Custom Bridge | `DISABLE_CSP=true` | ✅ All features work |
| Default Bridge | No changes needed | ✅ Works by default |

#### 📚 Documentation Updates
- Updated README.md with CSP configuration examples
- Enhanced environment variable documentation
- Added docker-compose examples for different network types

## [3.0.0] - 2025-10-10

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
- **Issues**: https://github.com/N85UK/UNRAID_Apps/issues
- **Documentation**: https://github.com/N85UK/UNRAID_Apps/tree/main/Apps/AWS_EUM
- **Support**: https://github.com/N85UK/UNRAID_Apps/discussions

## License

This project is licensed under the MIT License - see the LICENSE file for details.