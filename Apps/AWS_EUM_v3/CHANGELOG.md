# AWS End User Messaging (EUM) - Changelog

All notable changes to AWS EUM will be documented in this file.

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