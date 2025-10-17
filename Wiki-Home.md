# N85UK UNRAID Apps - Community Repository

Welcome to the N85UK UNRAID Apps repository! This collection provides high-quality applications specifically designed for UNRAID users.

## 🚀 Featured Applications

### AWS End User Messaging X (EUM X) v0.1.0

**Public Beta** - Modernized AWS Pinpoint SMS Solution with Advanced Features

- ✨ **Modern Architecture**: Secure, production-ready Node.js 20 application with SQLite persistence
- 🔒 **Enhanced Security**: Non-root container (port 8080), secret redaction, CSRF protection, IAM role support
- 📱 **SMS Capabilities**: Send SMS via AWS Pinpoint with phone pool discovery and opt-out checking
- � **Dashboard UI**: Real-time monitoring with queue status, AWS health probe, and per-origin MPS overrides
- 🗄️ **Persistent Queue**: File-backed message queue with worker, automatic retry, and SNS webhook support
- �📈 **Observability**: Structured logging (Pino), health checks, migrations system, comprehensive test coverage
- ⚙️ **Easy Setup**: One-click UNRAID installation with first-run wizard and dry-run testing

**Key Improvements over AWS_EUM v3:**

- SQLite database for configuration and message persistence
- Dashboard with queue monitoring and AWS connectivity status
- Database migrations for seamless upgrades
- Per-origin message-per-second (MPS) rate limit overrides
- Comprehensive test suite (8 test files with Jest)
- Support bundle with sanitized diagnostics
- 512px icon generation for Community Apps

[View Documentation](Apps/AWS_EUM_X/README.md) | [Installation Guide](Wiki-AWS-EUM-Installation.md)

### AWS End User Messaging (EUM) v3.0.1

**Legacy Version** - Maintained for Compatibility

- ✨ **Modern Interface**: Dark/light mode toggle with Chart.js analytics
- 🌐 **Network Compatibility**: Fixed for br0.2, br0.100, and all custom bridge networks
- 📱 **SMS Capabilities**: Send via AWS Pinpoint with auto phone number discovery
- 📈 **Analytics**: Real-time charts, cost estimation, and delivery tracking
- ⚙️ **Easy Setup**: One-click UNRAID installation with optional CSP configuration

**Migration Note**: Users are encouraged to migrate to AWS_EUM_X for improved security and features.

## 📊 Repository Stats

- **Active Apps**: 5+ applications
- **Total Downloads**: 1000+ installations
- **Latest Update**: AWS EUM X v0.1.0 (Beta) - October 2025
- **Support**: GitHub Issues and Community Forums
