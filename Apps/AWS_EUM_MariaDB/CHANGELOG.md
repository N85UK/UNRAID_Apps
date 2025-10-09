# AWS End User Messaging (EUM) - Changelog

All notable changes to AWS EUM will be documented in this file.

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
- **Issues**: https://github.com/N85UK/UNRAID_Apps/issues
- **Documentation**: https://github.com/N85UK/UNRAID_Apps/tree/main/Apps/AWS_EUM
- **Support**: https://github.com/N85UK/UNRAID_Apps/discussions

## License

This project is licensed under the MIT License - see the LICENSE file for details.