# UNRAID Apps

A collection of Docker applications packaged for UNRAID Community Applications (CA).

## Applications

### 1. AWS End User Messaging (EUM) v3.0.12

A web-based SMS sending application using AWS Pinpoint SMS services.

**Status**: ✅ Production Ready  
**Docker Image**: `ghcr.io/n85uk/aws-eum:latest`  
**Category**: Utilities  
**Template**: `my-aws-eum-v3.xml`

#### Features

- Modern dark/light mode UI
- AWS Pinpoint SMS integration
- Auto-discovery of phone numbers
- Message history tracking
- Long message support (up to 1,600 characters)

---

### 2. AWS End User Messaging MariaDB Edition v2.1.2

Enterprise SMS application with multi-user authentication and database persistence.

**Status**: ✅ Production Ready  
**Docker Image**: `ghcr.io/n85uk/aws-eum-mariadb:latest`  
**Category**: Utilities  
**Template**: `my-aws-eum-mariadb.xml`

#### Features

- Multi-user authentication with JWT
- MariaDB/MySQL database persistence
- Advanced analytics and reporting
- Session management
- Enterprise-grade security
- Auto database initialization

---

### 3. AWS End User Messaging X (EUM X) v0.1.4

Next-generation AWS Pinpoint SMS solution with enhanced security and TOTP 2FA.

**Status**: ✅ Production Ready - Security Hardened  
**Docker Image**: `ghcr.io/n85uk/aws-eum-x:latest`  
**Category**: Utilities  
**Template**: `my-aws-eum-x.xml`

#### Features

- Password authentication with bcrypt hashing
- Optional TOTP two-factor authentication
- SQLite persistence with auto-migrations
- First-run setup wizard
- Dashboard with queue monitoring
- Non-root container (port 8080)
- Rate limiting and security headers
- Session-based authentication

---

### 4. AWS 2-Way SMS v1.0.0

Bi-directional SMS messaging application for send and receive capabilities.

**Status**: ✅ Production Ready  
**Docker Image**: `ghcr.io/n85uk/aws-2way-sms:latest`  
**Category**: Utilities  
**Template**: `my-aws-2way-sms.xml`

#### Features

- Send and receive SMS messages
- Two-way conversation management
- Message threading and history
- Real-time notifications
- SNS webhook integration

---

### 5. X_Webhook-Receiver v1.0.0

Universal webhook receiver and alert management system with modern gradient UI.

**Status**: ✅ Production Ready  
**Docker Image**: `ghcr.io/n85uk/ucg-max-webhook-receiver:latest`  
**Category**: Network:Management  
**Templates**: `my-ucg-max-webhook.xml`, `my-X_Webhook-Receiver.xml`

#### Features

- **Universal Webhook Support**: Accept JSON from any source with intelligent field mapping
- **Multiple Authentication**: HMAC-SHA256, Bearer token, or JWT
- **Modern Gradient UI**: Purple-to-cyan theme with auto-refresh
- **External Database**: MariaDB/MySQL/PostgreSQL support
- **Advanced Filtering**: Search by severity, type, device, source
- **CSV Export**: Download filtered alerts
- **Rate Limiting**: Configurable request throttling
- **Auto Migrations**: Database schema management
- **Webhook Sources**: Track alerts by origin (UCG Max, Uptime Robot, GitHub, Prometheus, etc.)

---

## Installation

### Via UNRAID Community Applications (Recommended)

Search for the application name in the Apps tab and configure using the template.

### Manual Docker Installation

Each application has its own README with detailed installation instructions in its directory.

---

## Configuration

All applications use environment variables for configuration. See individual app directories for specific variables.

**Security Best Practice**: Always generate secure random keys:

```bash
# Generate secrets
openssl rand -hex 32  # For SECRET_KEY, JWT_SECRET, HMAC_SECRET
openssl rand -base64 32  # For SESSION_SECRET
```

**Never use default passwords in production!**

---

## Development

### Prerequisites

- Node.js 20+ (for AWS apps)
- Python 3.11+ (for UCG Webhook Receiver)
- Docker
- AWS Account (for AWS apps)

### Building

Each application has its own build process. Check the individual app's `README.md` for instructions.

---

## Publishing

GitHub Actions workflows automatically build and publish Docker images to GHCR on pushes to main branch.

---

## Community Applications Submission

This repository contains properly formatted templates for UNRAID Community Applications.

### Files Included

- `my-*.xml` - UNRAID CA template configurations
- `doc.md` - Application documentation (where applicable)
- Docker images published to GHCR
- Security compliance (no hardcoded secrets)

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## License

MIT License - see [LICENSE](../LICENSE) file for details.

---

## Support

For issues with specific applications, please check their respective documentation or create an issue in this repository.

---

**Copyright © 2025 N85UK**
