# UNRAID Apps Repository

A curated collection of production-ready UNRAID applications that extend UNRAID's functionality and improve user experience.

## 🚀 Available Applications

### 📧 AWS End User Messaging Suite

Professional SMS messaging applications using AWS Pinpoint with varying feature sets for different use cases.

---

#### 1. AWS EUM v3.0.12 (Enhanced UI Edition) 🎨

- **Location**: [`Apps/AWS_EUM/`](Apps/AWS_EUM/)
- **Status**: ✅ Production Ready - Auto-deployed
- **Template**: `my-aws-eum-v3.xml`
- **Docker Image**: `ghcr.io/n85uk/aws-eum:latest`

**Features:**
- 🌙 Modern dark/light mode with responsive design
- 📊 Simplified message history interface
- 🛡️ Enhanced security with CSP and rate limiting
- 🔄 Auto-discovery of AWS phone numbers
- 📱 Long message support (up to 1,600 characters)

---

#### 2. AWS EUM MariaDB v2.1.2 (Enterprise Edition) 🏢

- **Location**: [`Apps/AWS_EUM_MariaDB/`](Apps/AWS_EUM_MariaDB/)
- **Status**: ✅ Production Ready - Multi-user
- **Template**: `my-aws-eum-mariadb.xml`
- **Docker Image**: `ghcr.io/n85uk/aws-eum-mariadb:latest`

**Features:**
- 👥 Multi-user authentication with JWT
- 🗄️ MariaDB/MySQL database persistence
- � Auto database initialization
- 📈 Advanced analytics and reporting
- � Enterprise-grade security

---

#### 3. AWS EUM X v0.1.4 (Security Hardened) �

- **Location**: [`Apps/AWS_EUM_X/`](Apps/AWS_EUM_X/)
- **Status**: ✅ Production Ready - 2FA Enabled
- **Template**: `my-aws-eum-x.xml`
- **Docker Image**: `ghcr.io/n85uk/aws-eum-x:latest`

**Features:**
- � Password authentication with bcrypt hashing
- 🔑 Optional TOTP two-factor authentication
- 🎯 First-run setup wizard
- 📊 Dashboard with queue monitoring
- 🛡️ Non-root container (port 8080)
- 📈 SQLite persistence with auto-migrations

---

### 💬 AWS 2-Way SMS v1.0.0

- **Location**: [`Apps/AWS_2WAY/`](Apps/AWS_2WAY/)
- **Status**: ✅ Production Ready
- **Template**: `my-aws-2way-sms.xml`
- **Docker Image**: `ghcr.io/n85uk/aws-2way-sms:latest`

**Features:**
- 📱 Send and receive SMS messages
- 🔄 Two-way conversation management
- 📊 Message threading and history
- 🔔 Real-time notifications
- 🌐 SNS webhook integration

---

### 🔔 X_Webhook-Receiver v1.0.0

- **Location**: [`Apps/UCG-Max-Webhook-Receiver/`](Apps/UCG-Max-Webhook-Receiver/)
- **Status**: ✅ Production Ready - Universal Webhook Receiver
- **Templates**: `my-ucg-max-webhook.xml`, `my-X_Webhook-Receiver.xml`
- **Docker Image**: `ghcr.io/n85uk/ucg-max-webhook-receiver:latest`

**Features:**
- 🌐 **Universal**: Accept webhooks from any JSON source
- 🎨 **Modern UI**: Gradient theme (purple → cyan) with auto-refresh
- 🔐 **Authentication**: HMAC-SHA256, Bearer token, or JWT
- 🗄️ **Database**: External MariaDB, MySQL, or PostgreSQL support
- 📊 **Dashboard**: Alert monitoring with source tracking
- ⚡ **Rate Limiting**: Configurable throttling (slowapi)
- 🔍 **Advanced Filtering**: Search by severity, type, device, source
- 📤 **CSV Export**: Download filtered alerts
- 🔄 **Auto-Migrations**: Alembic-based schema management

---

## 🛠️ Installation

### Via UNRAID Community Applications (Recommended)

Search for the application name in the Apps tab and install using the template.

### Manual Installation

1. Pull the Docker image from GHCR
2. Configure environment variables per application README
3. Mount required volumes (typically `/mnt/user/appdata/<app-name>`)
4. Start container and verify logs

**Security Note**: Always generate secure random keys. Never use default passwords in production!

```bash
# Generate secure secrets
openssl rand -hex 32  # For SECRET_KEY, JWT_SECRET, HMAC_SECRET
openssl rand -base64 32  # For SESSION_SECRET
```

**Example (docker run minimal):**

```bash
docker run -d \
    -e AWS_ACCESS_KEY_ID=AKIA... \
    -e AWS_SECRET_ACCESS_KEY=... \
    -e AWS_REGION=eu-west-2 \
    -p 8080:80 \
    --name aws-eum \
    ghcr.io/n85uk/aws-eum:latest
```

## 💻 Development & Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for full contribution guidelines. Quick tips:

- Fork the repo and open small focused PRs
- Run `npm install` inside `Apps/*` Node projects before development
- Include tests for non-trivial changes and update `CHANGELOG.md` for releases
- Follow consistent commit message style (semver-inspired prefixes)

### Code Style & Linters

- Use recommended linters per project (ESLint/Prettier where applicable)

## 📊 CI/CD Status

- ✅ **GitHub Actions**: All workflows passing
- 🐳 **Docker Images**: Auto-published to GHCR on releases
- 🔄 **Multi-platform**: x86_64 and ARM64 support
- 🏷️ **Version Tags**: Automatic tagging with semantic versions

**Docker Images Available:**

- `ghcr.io/n85uk/aws-eum:latest` (v3.0.9)
- `ghcr.io/n85uk/aws-eum-mariadb:latest` (Enterprise)
- `ghcr.io/n85uk/aws-eum-x:latest` (v0.1.0)
- `ghcr.io/n85uk/aws-2way-sms:latest`
- `ghcr.io/n85uk/ucg-max-webhook-receiver:latest` (v1.0.0)

## 🤝 Contributing

We welcome contributions! See [`CONTRIBUTING.md`](CONTRIBUTING.md) for details.

**Quick Start:**

- Fork and clone the repository
- Make changes following our guidelines
- Submit a pull request
- Wait for review and merge

## 📄 Documentation

- **Contributing Guide**: [`CONTRIBUTING.md`](CONTRIBUTING.md)
- **Security Policy**: [`SECURITY.md`](SECURITY.md)
- **Changelog**: [`CHANGELOG.md`](CHANGELOG.md)
- **Migration Guide**: [`MIGRATION.md`](MIGRATION.md)

## 🔒 Security

- **Vulnerability Reports**: Follow [`SECURITY.md`](SECURITY.md)
- **Responsible Disclosure**: Email <security@git.n85.uk>
- **Security Updates**: Regular dependency updates and patches

## 📞 Support

- **General Questions**: <hello@git.n85.uk>
- **Bug Reports**: [GitHub Issues](https://github.com/N85UK/UNRAID_Apps/issues)
- **Security Issues**: <security@git.n85.uk>

## 📋 System Requirements

- **Minimum UNRAID**: 7.2.0+
- **Node.js Apps**: Node.js 20+ (LTS)
- **Typical Resources**: 50-200 MB RAM idle, depends on usage

## 📈 Project Stats

![GitHub stars](https://img.shields.io/github/stars/N85UK/UNRAID_Apps)
![GitHub issues](https://img.shields.io/github/issues/N85UK/UNRAID_Apps)
![GitHub license](https://img.shields.io/github/license/N85UK/UNRAID_Apps)

## 🙏 Acknowledgments

- **UNRAID Team**: For the excellent platform
- **Community**: For testing, feedback, and contributions
- **AWS**: For End User Messaging services

## 📄 License

This repository and included projects are licensed under the MIT License. See [`LICENSE`](LICENSE) for details.

---

### Made with ❤️ for the UNRAID community
