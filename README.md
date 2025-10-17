# UNRAID Apps Repository

A curated collection of UNRAID applications and plugins that extend UNRAID's functionality and improve user experience.

## 🚀 Available Projects

### 📧 AWS End User Messaging (Multi-Version Suite)

#### Professional SMS messaging via AWS Pinpoint with modern UI and enterprise features

🚀 **All versions now building successfully with GitHub Actions CI/CD!**

#### Version 3.0 (Enhanced UI Edition) 🎨

- **Location**: [`Apps/AWS_EUM/`](Apps/AWS_EUM/)
- **Version**: v3.0.9
- **Status**: ✅ Production Ready - Auto-deployed
- **Installation**: `https://github.com/N85UK/UNRAID_Apps/raw/main/Apps/AWS_EUM/my-aws-eum-v3.xml`
- **Docker Image**: `ghcr.io/n85uk/aws-eum:latest`

**Enhanced Features:**

- 🌙 Modern dark mode with automatic theme switching
- 🎨 Clean, responsive design with Google Fonts
- 📊 Simplified UI with improved message history (v3.0.9)
- 🛡️ Enhanced security with CSP and rate limiting
- 🔄 Auto-discovery of AWS phone numbers
- 📱 Long message support up to 1,600 characters

#### MariaDB Enterprise Edition 🏢

- **Location**: [`Apps/AWS_EUM_MariaDB/`](Apps/AWS_EUM_MariaDB/)
- **Status**: ✅ Production Ready - Multi-user authentication
- **Installation**: `https://github.com/N85UK/UNRAID_Apps/raw/main/Apps/AWS_EUM_MariaDB/my-aws-eum-mariadb.xml`
- **Docker Image**: `ghcr.io/n85uk/aws-eum-mariadb:latest`

**Enterprise Features:**

- 👥 Multi-user authentication with session management
- 🗄️ MariaDB/MySQL database persistence
- 🔐 JWT-based authentication system
- 📈 Advanced analytics and reporting
- 🛡️ Enterprise-grade security features

#### AWS EUM X (Next Generation) 🚀

- **Location**: [`Apps/AWS_EUM_X/`](Apps/AWS_EUM_X/)
- **Version**: v0.1.0
- **Status**: ✅ Production Ready - Security Hardened
- **Installation**: `https://github.com/N85UK/UNRAID_Apps/raw/main/Apps/AWS_EUM_X/my-aws-eum-x.xml`
- **Docker Image**: `ghcr.io/n85uk/aws-eum-x:latest`

**Next-Gen Features:**

- 🔒 **Security First**: Comprehensive security documentation and vulnerability management
- 🏗️ **Modern Architecture**: Built with latest Node.js 20 LTS and Alpine Linux
- 🎯 **First-Run Wizard**: 5-step guided setup for new users
- 📊 **Observability**: Structured logging, health endpoints, and message history
- ⚡ **Rate Limiting**: Built-in token bucket with configurable limits
- 🛡️ **Non-Root Container**: Runs as unprivileged user (UID 1001) on port 8080
- 📈 **SQLite Persistence**: better-sqlite3 for reliable message tracking

### AWS 2-Way SMS 💬

- **Location**: [`Apps/AWS_2WAY/`](Apps/AWS_2WAY/)
- **Status**: ✅ Production Ready
- **Installation**: `https://github.com/N85UK/UNRAID_Apps/raw/main/Apps/AWS_2WAY/my-aws-2way-sms.xml`
- **Docker Image**: `ghcr.io/n85uk/aws-2way-sms:latest`

**Bi-Directional Messaging:**

- 📱 Send and receive SMS messages
- 🔄 Two-way conversation management
- 📊 Message history and threading
- 🔔 Real-time notifications

## 🛠️ Installation

### Docker-based Apps (AWS EUM)

1. Pull the desired image from GHCR or use the provided XML template in the app folder
2. Configure environment variables and mount `/app/data` for persistence
3. Start container and check logs for startup messages

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
