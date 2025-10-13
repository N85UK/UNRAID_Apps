# UNRAID Apps Repository

A curated collection of UNRAID applications and plugins that extend UNRAID's functionality and improve user experience.

## 🚀 Available Projects

### 📁 ExplorerX Plugin (Native UNRAID Plugin)
**Simple, native file manager for UNRAID with clean interface and safe installation**

- **Location**: [`ExplorerX_Plugin/`](ExplorerX_Plugin/)
- **Status**: 🔧 Debug v2025.10.10.0002 - Investigating interface rendering issues
- **Installation**: `https://raw.githubusercontent.com/N85UK/UNRAID_Apps/main/ExplorerX_Plugin/explorerx.plg`

**Key Features:**
- 🌐 Simple directory navigation and file listing
- 📱 Responsive design for mobile and desktop
- 🔧 **Native Integration**: No Docker required, pure UNRAID plugin
- 🔒 Safe installation that won't break other plugins
- 📂 Access to all UNRAID shares and drives
- 🛡️ **Enhanced Security**: Safe permission handling, no global modifications
- 🎯 **Tools Menu Access**: Available via Tools → ExplorerX

### 🏆 UNRAID API Integration (Bounty Submission)
**Complete NestJS implementation for UNRAID API bounty**

- **Location**: [`Bounty_Submission/`](Bounty_Submission/)
- **Status**: ✅ Ready for UNRAID API Integration
- **Reference**: [UNRAID API Issue #1599](https://github.com/unraid/api/issues/1599)

**Implementation Highlights:**
- 🏗️ NestJS module architecture
- � UNRAID session proxy authentication
- 🖥️ Vue.js WebGUI following LogViewer pattern
- 🔄 Real-time WebSocket updates
- 📊 Service lifecycle management
- 🛡️ Security and permission inheritance

### 📧 AWS End User Messaging (Multi-Version Suite)
**Professional SMS messaging via AWS Pinpoint with modern UI and enterprise features**

🚀 **All versions now building successfully with GitHub Actions CI/CD!**

#### Version 2.0 (Current Stable)
- **Location**: [`Apps/AWS_EUM/`](Apps/AWS_EUM/)
- **Status**: ✅ Production Ready - Auto-deployed
- **Installation**: `https://github.com/N85UK/UNRAID_Apps/raw/main/Apps/AWS_EUM/template.cfg`
- **Docker Image**: `ghcr.io/n85uk/aws-eum:latest`

**Features:**
- ✅ Reliable SMS delivery via AWS Pinpoint
- ✅ Simple, clean interface
- ✅ Message history and tracking
- ✅ Cost estimation
- ✅ Multiple originator support

#### Version 3.0 (Enhanced UI Edition) 🎨
- **Location**: [`Apps/AWS_EUM_v3/`](Apps/AWS_EUM_v3/)
- **Status**: ✅ Production Ready - Auto-deployed
- **Installation**: `https://github.com/N85UK/UNRAID_Apps/raw/main/Apps/AWS_EUM_v3/template.cfg`
- **Docker Image**: `ghcr.io/n85uk/aws-eum-v3:latest`

**Enhanced Features:**
- 🌙 Modern dark mode with automatic theme switching
- 🎨 Clean, responsive design with Google Fonts
- 📊 Chart.js analytics and message statistics
- 🛡️ Enhanced security with CSP and rate limiting
- 🔄 Auto-updates with configurable intervals

#### MariaDB Enterprise Edition 🏢
- **Location**: [`Apps/AWS_EUM_MariaDB/`](Apps/AWS_EUM_MariaDB/)
- **Status**: ✅ Production Ready - Multi-user authentication
- **Installation**: `https://github.com/N85UK/UNRAID_Apps/raw/main/Apps/AWS_EUM_MariaDB/template.cfg`
- **Docker Image**: `ghcr.io/n85uk/aws-eum-mariadb:latest`

**Enterprise Features:**
- 👥 Multi-user authentication with session management
- 🗄️ MariaDB/MySQL database persistence
- 🔐 JWT-based authentication system
- 📈 Advanced analytics and reporting
- 🛡️ Enterprise-grade security features

## 🛠️ Installation

### ExplorerX Plugin (Recommended)
1. Go to UNRAID Web UI → Plugins → Install Plugin
2. Paste: `https://raw.githubusercontent.com/N85UK/UNRAID_Apps/main/ExplorerX_Plugin/explorerx.plg`
3. Click Install and go to Tools → ExplorerX

### Docker-based Apps (AWS EUM)
1. Pull the desired image from GHCR or use the provided `template.cfg` in the app folder
2. Configure environment variables and mount `/app/data` for persistence
3. Start container and check logs for startup messages

**Example (docker run minimal):**
```bash
docker run -d \
    -e AWS_ACCESS_KEY_ID=AKIA... \
    -e AWS_SECRET_ACCESS_KEY=... \
    -e AWS_REGION=eu-west-2 \
    -p 8080:80 \
    --name aws-eum-v3 \
    ghcr.io/n85uk/aws-eum-v3:latest
```

## � Development & Contributing

See `CONTRIBUTING.md` for full contribution guidelines. Quick tips:

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
- `ghcr.io/n85uk/aws-eum:latest` (v2.0)
- `ghcr.io/n85uk/aws-eum-v3:latest` (v3.0)
- `ghcr.io/n85uk/aws-eum-mariadb:latest` (Enterprise)

## 🤝 Contributing

We welcome contributions! See `CONTRIBUTING.md` for details.

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
- **Responsible Disclosure**: Email security@git.n85.uk
- **Security Updates**: Regular dependency updates and patches

## 📞 Support

- **General Questions**: hello@git.n85.uk
- **Bug Reports**: [GitHub Issues](https://github.com/N85UK/UNRAID_Apps/issues)
- **Security Issues**: security@git.n85.uk

## 📋 System Requirements

- **Minimum UNRAID**: 7.2.0+
- **Node.js Apps**: Node.js 18+
- **ExplorerX Plugin**: PHP 8.x (included in UNRAID)
- **Typical Resources**: 50-200 MB RAM idle, depends on usage

## 📈 Project Stats

![GitHub stars](https://img.shields.io/github/stars/N85UK/UnRiaid_Apps)
![GitHub issues](https://img.shields.io/github/issues/N85UK/UnRiaid_Apps)
![GitHub license](https://img.shields.io/github/license/N85UK/UnRiaid_Apps)

## 🙏 Acknowledgments

- **UNRAID Team**: For the excellent platform and bounty opportunities
- **Community**: For testing, feedback, and contributions
- **FileBrowser Project**: For outstanding file management software

## 📄 License

This repository and included projects are licensed under the MIT License. See [`LICENSE`](LICENSE) for details.

---

**Made with ❤️ for the UNRAID community**

### 🏆 **UNRAID API Integration** (Bounty Submission)
**Complete NestJS implementation for UNRAID API bounty**

- **Location**: [`Bounty_Submission/`](Bounty_Submission/)
- **Status**: ✅ **Ready for UNRAID API Integration**
- **Reference**: [UNRAID API Issue #1599](https://github.com/unraid/api/issues/1599)

**Implementation Highlights:**
- 🏗️ NestJS module architecture
- 🔐 UNRAID session proxy authentication
- 🖥️ Vue.js WebGUI following LogViewer pattern
- 🔄 Real-time WebSocket updates
- 📊 Service lifecycle management
- 🛡️ Security and permission inheritance

### 📧 **AWS End User Messaging (Multi-Version Suite)**
**Professional SMS messaging via AWS Pinpoint with modern UI and enterprise features**

🚀 **All versions now building successfully with GitHub Actions CI/CD!**

#### **Version 2.0** (Current Stable)
- **Location**: [`Apps/AWS_EUM/`](Apps/AWS_EUM/)
- **Status**: ✅ Production Ready - Auto-deployed
- **Installation**: `https://github.com/N85UK/UNRAID_Apps/raw/main/Apps/AWS_EUM/template.cfg`
- **Docker Image**: `ghcr.io/n85uk/aws-eum:latest`

**Features:**
- ✅ Reliable SMS delivery via AWS Pinpoint
- ✅ Simple, clean interface
- ✅ Message history and tracking
- ✅ Cost estimation
- ✅ Multiple originator support

#### **Version 3.0** (Enhanced UI Edition) 🎨
- **Location**: [`Apps/AWS_EUM_v3/`](Apps/AWS_EUM_v3/)
- **Status**: ✅ Production Ready - Auto-deployed
- **Installation**: `https://github.com/N85UK/UNRAID_Apps/raw/main/Apps/AWS_EUM_v3/template.cfg`
- **Docker Image**: `ghcr.io/n85uk/aws-eum-v3:latest`

**Enhanced Features:**
# UNRAID Apps

A curated collection of UNRAID applications and plugins that extend UNRAID's functionality and improve user experience.

Keywords: UNRAID plugin, UNRAID app, file manager, SMS messaging, Docker template, MariaDB, API integration

---

## Quick links

- ExplorerX Plugin (native UNRAID plugin): `ExplorerX_Plugin/`
- UNRAID API Integration (bounty submission): `Bounty_Submission/`
- AWS End User Messaging (EUM) suite: `Apps/AWS_EUM`, `Apps/AWS_EUM_v3`, `Apps/AWS_EUM_MariaDB`
- CONTRIBUTING.md: `./CONTRIBUTING.md`
- SECURITY.md: `./SECURITY.md`
- CHANGELOG.md: `./CHANGELOG.md`
- Issues (all projects): https://github.com/N85UK/UNRAID_Apps/issues

---

## Projects included

### ExplorerX Plugin (native UNRAID plugin)

A lightweight, native UNRAID plugin that provides a safe, responsive file manager interface for browsing shares and performing file operations.

- Location: `ExplorerX_Plugin/`
- Status: Debug (see `ExplorerX_Plugin/README.md` and release notes)
- Install (plugin manifest): `https://raw.githubusercontent.com/N85UK/UNRAID_Apps/main/ExplorerX_Plugin/explorerx.plg`
- Report issues: https://github.com/N85UK/UNRAID_Apps/issues

Key features

- Native UNRAID integration (Tools → ExplorerX)
- Responsive UI for desktop and mobile
- Safe permission handling and no global system changes
- File operations: view, edit, move, copy, delete, streaming downloads

Notes & known issues

- Debug builds may display diagnostic output instead of the normal browser UI when active. Toggle debug mode off for normal behavior.
- If you encounter rendering or permission issues, open an issue with console logs and a screenshot.

---

### UNRAID API Integration (Bounty Submission)

NestJS-based implementation intended for integration with the official UNRAID API. This is a developer-focused project and requires UNRAID team coordination to include in the upstream API.

- Location: `Bounty_Submission/`
- Status: Ready for upstream integration (see `Bounty_Submission/README.md`)
- UNRAID API reference: https://github.com/unraid/api

What this contains

- NestJS module implementing a file-manager API
- Vue.js WebGUI sample pages
- Session proxy approach for UNRAID authentication

High-level integration checklist for UNRAID maintainers

1. Review `Bounty_Submission/api/` modules and confirm route compatibility.
2. Validate session proxy approach and security model with UNRAID maintainers.
3. Upstream the module via a PR in the UNRAID API repository and follow the maintainers' guidance.

---

### AWS End User Messaging (EUM) Suite

Professional SMS messaging applications using AWS Pinpoint. Select the edition that fits your needs:

- Stable v2 (simple): `Apps/AWS_EUM/` (file-based storage)
- Enhanced UI v3: `Apps/AWS_EUM_v3/` (modern UI, charts, dark mode)
- MariaDB Enterprise: `Apps/AWS_EUM_MariaDB/` (multi-user, database persistence)

General notes

- Docker images are built via GitHub Actions and published to GitHub Container Registry (ghcr.io/n85uk)
- Templates for Community Applications are provided in each app folder
- All EUM apps require AWS credentials with Pinpoint SMS permissions

Docker image pull commands

```bash
docker pull ghcr.io/n85uk/aws-eum:latest
docker pull ghcr.io/n85uk/aws-eum-v3:latest
docker pull ghcr.io/n85uk/aws-eum-mariadb:latest
```

Environment variables (common)

- AWS_ACCESS_KEY_ID — AWS access key (required)
- AWS_SECRET_ACCESS_KEY — AWS secret key (required)
- AWS_REGION — AWS region (default: eu-west-2)
- DISABLE_CSP — Set to `true` on bridged networks (default: `false`)
- PORT — Port to run server on (default: `80`)

See each application's `template.cfg` or `.env.example` for full lists and defaults.

Security considerations (MariaDB edition)

- Change default admin passwords after first boot
- Use strong secrets for `DB_PASSWORD` and JWT keys
- Restrict database access to trusted hosts/networks and enable TLS for DB connections

---

## Installation

Pick the installation method per project below.

ExplorerX Plugin (recommended)

1. Go to UNRAID Web UI → Plugins → Install Plugin
2. Paste: `https://raw.githubusercontent.com/N85UK/UNRAID_Apps/main/ExplorerX_Plugin/explorerx.plg`
3. Click Install and go to Tools → ExplorerX

Docker-based apps (EUM)

1. Pull the desired image from GHCR or use the provided `template.cfg` in the app folder
2. Configure environment variables and mount `/app/data` for persistence
3. Start container and check logs for startup messages

Example (docker run minimal):
```bash
docker run -d \
    -e AWS_ACCESS_KEY_ID=AKIA... \
    -e AWS_SECRET_ACCESS_KEY=... \
    -e AWS_REGION=eu-west-2 \
    -p 8080:80 \
    --name aws-eum-v3 \
    ghcr.io/n85uk/aws-eum-v3:latest
```

---

## Development & Contributing

See `CONTRIBUTING.md` for full contribution guidelines. Quick tips:

- Fork the repo and open small focused PRs
- Run `npm install` inside `Apps/*` Node projects before development
- Include tests for non-trivial changes and update `CHANGELOG.md` for releases
- Follow consistent commit message style (semver-inspired prefixes)

Code style & linters

- Use recommended linters per project (ESLint/Prettier where applicable)

---

## CI / CD

- GitHub Actions for build and publish are defined in `.github/workflows/`.
- Docker image builds run on push to `main`, `develop` or tags like `v*.*.*`.
- Tags are used to release versioned Docker images to GHCR.

---

## Support & Documentation

- Central issues tracker: https://github.com/N85UK/UNRAID_Apps/issues
- Security disclosures: follow `SECURITY.md` and email `security@git.n85.uk`
- For ExplorerX debug mode, include console logs, a screenshot, and steps to reproduce

Suggested improvements (manual steps)

1. Create a DISCUSSIONS or dedicated Support repository for community help and FAQs
2. Add issue templates for bug reports, feature requests, and security disclosures

---

## System Requirements

- Minimum UNRAID recommended: 7.2.0 (test on latest stable release)
- Node.js: 18+ for Node-based apps
- Typical resource usage: small web apps — 50-200 MB RAM idle; depends on traffic and features

---

## Contributing

- Link to `CONTRIBUTING.md` and follow PR/issue process

---

## License

This repository and included projects are licensed under the MIT License. See `LICENSE` for details.

---

## Manual actions required

The following actions require repository owner or maintainers to perform:

1. Create a GitHub Discussions page (or Support repo) for user-facing support and FAQs
2. Add issue templates for bugs, feature requests, and security reports
3. Optionally add a SECURITY contact email in GitHub settings if not already set
4. Verify Community Applications listing for ExplorerX and update `my-aws-eum-v3.xml` if needed

---

Thank you for using and contributing to the UNRAID Apps collection — maintained with care for the UNRAID community.
### For API Integration
- **UNRAID API**: Development environment
- **Node.js**: 18+
- **TypeScript**: Latest
- **NestJS**: Framework knowledge

## 🆘 **Support & Documentation**

### ExplorerX Plugin Support
- **Quick Start**: [ExplorerX_Plugin/README.md](ExplorerX_Plugin/README.md)
- **Installation Issues**: [GitHub Issues](https://github.com/N85UK/UNRAID_Apps/issues)
- **User Guide**: Built into plugin interface
- **Advanced Features**: Multi-pane navigation and bulk operations guide

### API Integration Support  
- **Bounty Spec**: [UNRAID API Issue #1599](https://github.com/unraid/api/issues/1599)
- **Implementation**: [Bounty_Submission/README.md](Bounty_Submission/README.md)
- **Architecture**: [MIGRATION.md](MIGRATION.md)

## 🔄 **Version Status**

### Current Active Projects
- ✅ **ExplorerX Plugin v0.1.1**: Production ready with advanced file management
- ✅ **Bounty Submission**: Complete, ready for UNRAID API integration
- ✅ **AWS EUM v2.0**: Stable production version, minimal maintenance
- ✅ **AWS EUM v3.0**: Enhanced UI with dark mode, charts, and modern design
- ✅ **AWS EUM MariaDB**: Enterprise edition with multi-user and database integration
- ✅ **CA Submission Tools**: Community Applications integration

### Deployment Status
- ✅ **Build Status**: All GitHub Actions workflows passing
- 🚀 **All AWS EUM versions**: Auto-deployed via GitHub Actions
- 📦 **Docker Images**: Available on GitHub Container Registry  
- 🔄 **CI/CD**: Automated builds with Alpine Linux optimization
- 🧹 **Clean Dependencies**: npm install with fresh package-lock.json generation
- 📊 **Monitoring**: Build status and health checks active

## 🤝 **Contributing**

We welcome contributions for both projects:

**For ExplorerX Plugin Development:**
- PHP and JavaScript knowledge
- UNRAID plugin architecture understanding
- Native file management implementation
- Multi-pane UI development experience

**For API Integration:**
- TypeScript and NestJS expertise
- Vue.js component development
- UNRAID API architecture knowledge

## 📄 **License**

MIT License - see individual project folders for specific details.

## 🙏 **Acknowledgments**

- **UNRAID Team**: For excellent platform and bounty opportunity
- **FileBrowser Project**: For outstanding file management software
- **Community**: For testing, feedback, and support

## 📊 **Quick Stats**

![GitHub stars](https://img.shields.io/github/stars/N85UK/UnRiaid_Apps)
![GitHub issues](https://img.shields.io/github/issues/N85UK/UnRiaid_Apps)
![GitHub license](https://img.shields.io/github/license/N85UK/UnRiaid_Apps)

---

## ✨ **Get Started Today**

### Want Advanced File Management Now?
→ Install **ExplorerX Plugin**: [Installation Guide](ExplorerX_Plugin/README.md)

### Building UNRAID API Features?
→ Check the **Bounty Submission**: [Integration Guide](Bounty_Submission/README.md)

**Made with ❤️ for the UNRAID community**

##  License

This repository and its applications are licensed under the MIT License unless otherwise specified.

## 🤝 Contact & Support

### 💬 General Questions & Support
- **Email**: hello@git.n85.uk
- **GitHub Issues**: [Create an Issue](https://github.com/N85UK/UNRAID_Apps/issues)

### 🔒 Security Issues
- **Email**: security@git.n85.uk
- **GitHub Security**: [Report a Vulnerability](https://github.com/N85UK/UNRAID_Apps/security/advisories)

**Made with ❤️ for the UNRAID community**