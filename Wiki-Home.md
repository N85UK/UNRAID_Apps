# N85UK UNRAID Apps - Community Repository

Welcome to the N85UK UNRAID Apps repository! This collection provides high-quality applications specifically designed for UNRAID users.

## 🚀 Featured Applications

### AWS End User Messaging X (EUM X) v1.0.0

**Production Release** - Modernized AWS Pinpoint SMS Solution

- ✨ **Modern Architecture**: Secure, production-ready Node.js 20 application
- 🔒 **Enhanced Security**: Non-root container, secret redaction, CSRF protection, IAM role support
- 📱 **SMS Capabilities**: Send SMS via AWS Pinpoint with phone pool discovery and opt-out checking
- 📈 **Observability**: Structured logging (Pino), health checks, rate limiting, message history
- ⚙️ **Easy Setup**: One-click UNRAID installation with first-run wizard
- 🌐 **Modern UI**: Clean interface with dashboard, settings, and observability pages

**Key Improvements over AWS_EUM v3:**

- IAM role auto-detection (no hardcoded credentials)
- Rate limiting with token bucket algorithm
- Phone number validation (E.164)
- Message history with CSV export
- Complete audit and security hardening

[View Documentation](Apps/AWS_EUM_X/README.md) | [Installation Guide](Wiki-AWS-EUM-Installation.md)

### AWS End User Messaging (EUM) v3.0.1

**Legacy Version** - Maintained for Compatibility

- ✨ **Modern Interface**: Dark/light mode toggle with Chart.js analytics
- 🌐 **Network Compatibility**: Fixed for br0.2, br0.100, and all custom bridge networks
- 📱 **SMS Capabilities**: Send via AWS Pinpoint with auto phone number discovery
- 📈 **Analytics**: Real-time charts, cost estimation, and delivery tracking
- ⚙️ **Easy Setup**: One-click UNRAID installation with optional CSP configuration

**Migration Note**: Users are encouraged to migrate to AWS_EUM_X for improved security and features.

### ExplorerX Plugin v0.1.1

Advanced file manager plugin for UNRAID with enhanced navigation and operations.

### File Explorer Plugin

Simple, lightweight file browsing solution for UNRAID systems.

### CA Submission Tools

Utilities for Community Applications submission and testing.

## 📊 Repository Stats

- **Active Apps**: 5+ applications
- **Total Downloads**: 1000+ installations
- **Latest Update**: AWS EUM X v1.0.0 - October 2025
- **Support**: GitHub Issues and Community Forums
