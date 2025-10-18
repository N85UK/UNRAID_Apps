# N85UK UNRAID Apps - Community Repository

Welcome to the N85UK UNRAID Apps repository! This collection provides high-quality applications specifically designed for UNRAID users.

## 🚀 Featured Applications

### AWS End User Messaging X (EUM X) v0.1.4

**Production Ready** - Security-Hardened AWS Pinpoint SMS Solution

- 🔐 **Authentication**: Password-based login with bcrypt hashing, optional TOTP 2FA
- 🗄️ **SQLite Persistence**: Configuration, credentials, and message history
- 📱 **SMS Capabilities**: Send SMS via AWS Pinpoint with phone pool discovery
- 📊 **Dashboard**: Real-time monitoring with queue status and AWS health probe
- � **Security**: Non-root container (port 8080), session management, secret redaction
- ⚙️ **Easy Setup**: First-run wizard, dry-run testing, database migrations
- 📈 **Observability**: Structured logging, health checks, per-origin MPS overrides

[View Documentation](Apps/AWS_EUM_X/README.md) | [Installation Guide](Wiki-AWS-EUM-Installation.md)

### AWS End User Messaging (EUM) v3.0.12

**Enhanced UI Edition** - Production Ready

- ✨ **Modern Interface**: Dark/light mode toggle with clean responsive design
- 🌐 **Network Compatibility**: Works with all custom bridge networks
- 📱 **SMS Capabilities**: Send via AWS Pinpoint with auto phone number discovery
- 📈 **Analytics**: Message history and delivery tracking
- ⚙️ **Easy Setup**: One-click UNRAID installation with CSP configuration

### AWS End User Messaging MariaDB Edition v2.1.2

**Enterprise Edition** - Multi-user Authentication & Database Persistence

- 👥 **Multi-user**: JWT-based authentication with session management
- 🗄️ **Database**: MariaDB/MySQL persistence for enterprise deployments
- 📈 **Analytics**: Advanced reporting and tracking
- 🔐 **Security**: Enterprise-grade security features
- 🚀 **Auto-Init**: Automatic database and table creation

### AWS 2-Way SMS v1.0.0

**Bi-Directional Messaging** - Production Ready

- 📱 **Two-Way**: Send and receive SMS messages via AWS Pinpoint
- 🔄 **Conversations**: Thread management and history
- 📊 **Tracking**: Message history and delivery status
- 🔔 **Notifications**: Real-time message alerts
- 🌐 **SNS Integration**: Webhook receiver for incoming messages

### UCG Max Webhook Receiver v1.0.0

**Universal Webhook Receiver** - Production Ready with Modern UI

- 🌐 **Universal**: Accept webhooks from any source (UCG Max, Uptime Robot, GitHub, Prometheus, etc.)
- 🎨 **Modern UI**: Gradient theme (purple → cyan) with auto-refresh dashboard
- 🔐 **Authentication**: HMAC-SHA256, Bearer token, or JWT support
- 🗄️ **Database**: External MariaDB, MySQL, or PostgreSQL support
- 📊 **Dashboard**: Web UI for alert monitoring and metrics with source tracking
- ⚡ **Rate Limiting**: Configurable request throttling (slowapi)
- 🔍 **Search**: Filter alerts by severity, type, device, source, timestamps
- 📤 **Export**: CSV export functionality with gradient-styled buttons
- 🔄 **Migrations**: Automatic database schema updates (Alembic)

## 📊 Repository Stats

- **Active Apps**: 5 applications
- **Total Downloads**: 1000+ installations
- **Latest Update**: UCG Max Webhook Receiver v1.0.0 - October 2025
- **Support**: GitHub Issues and Community Forums
