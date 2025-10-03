# UNRAID Apps Repository

A collection of applications and plugins for UNRAID systems, providing enhanced functionality and user experience.

## ⚠️ **IMPORTANT UPDATE**

This repository has been restructured to provide the correct implementation for the UNRAID API File Manager bounty. See [`MIGRATION.md`](MIGRATION.md) for details.

## 🚀 Current Projects

### 📁 UNRAID API File Manager Integration (NEW)
**Correct NestJS implementation for UNRAID API bounty**

- **Location**: [`UNRAID_API_Integration/`](UNRAID_API_Integration/)
- **Status**: ✅ Ready for UNRAID API Integration
- **Architecture**: NestJS module + Vue.js WebGUI
- **Authentication**: UNRAID API proxy headers

**Key Features:**
- FileBrowser integration as NestJS subprocess
- Proxy authentication via UNRAID API sessions
- Vue.js WebGUI following LogViewer pattern
- Real-time WebSocket updates
- Virtual root configuration for UNRAID paths

**Implementation Details:**
- See [`UNRAID_API_Integration/README.md`](UNRAID_API_Integration/README.md)
- Follows [UNRAID API Issue #1599](https://github.com/unraid/api/issues/1599) requirements
- Ready for bounty submission

### 📁 File Manager Plugin (ARCHIVED)
**Legacy plugin implementation - no longer maintained**

- **Location**: [`Plugins/FileManager/`](Plugins/FileManager/)
- **Status**: ❌ Archived (wrong architecture)
- **Note**: Does not meet UNRAID API bounty requirements

### 📧 AWS End User Messaging (EUM)
**Send SMS messages via AWS Pinpoint**

- **Location**: [`AWS_EUM/`](AWS_EUM/)
- **Author**: N85UK
- **License**: MIT
- **Status**: ✅ Production Ready

**Features:**
- Send SMS via AWS Pinpoint service
- Web interface for message composition
- Docker container deployment
- Environment-based configuration
- Rate limiting and security features

**Installation:**
```
https://github.com/N85UK/UnRiaid_Apps/raw/main/AWS_EUM/template.cfg
```

## 📋 Requirements

### For UNRAID API Integration
- UNRAID API development environment
- Node.js 18+
- TypeScript support
- NestJS framework knowledge

### For Docker Applications
- **UNRAID Version**: 6.8+
- **Architecture**: x86_64 (Intel/AMD)
- **Docker**: Community Applications plugin

## 🛠️ Development

### Repository Structure
```
UnRiaid_Apps/
├── UNRAID_API_Integration/     # NEW: Correct API implementation
│   ├── api/src/unraid-api/modules/filemanager/  # NestJS module
│   ├── web/pages/              # Vue.js WebGUI
│   └── README.md               # Integration guide
├── Plugins/FileManager/        # ARCHIVED: Legacy plugin
├── AWS_EUM/                    # Docker application
├── MIGRATION.md                # Migration guide
└── README.md                   # This file
```

### Contributing to API Integration

For the UNRAID API File Manager:

1. **Study the Requirements**: Read [UNRAID API Issue #1599](https://github.com/unraid/api/issues/1599)
2. **Review Implementation**: Check [`UNRAID_API_Integration/`](UNRAID_API_Integration/)
3. **Follow Patterns**: Use NestJS + Vue.js approach
4. **Test Integration**: Ensure proper UNRAID API compatibility

### Development Guidelines
- Follow UNRAID API patterns and conventions
- Use TypeScript for type safety
- Include comprehensive tests
- Update documentation
- Ensure security best practices

## 📖 Migration Guide

If you were using the previous plugin version, please read [`MIGRATION.md`](MIGRATION.md) for:
- Architecture changes explanation
- Migration steps
- Configuration differences
- API endpoint changes

## 🆘 Support

### For UNRAID API Integration
- **Documentation**: [`UNRAID_API_Integration/README.md`](UNRAID_API_Integration/README.md)
- **Bounty Reference**: [UNRAID API Issue #1599](https://github.com/unraid/api/issues/1599)
- **Architecture Questions**: GitHub Issues with "api-integration" label

### For Other Applications
- **GitHub Issues**: [Create an Issue](https://github.com/N85UK/UnRiaid_Apps/issues)
- **Documentation**: Check individual application folders

## 📄 License

This repository and its applications are licensed under the MIT License unless otherwise specified.

## 🤝 Contact & Support

### 💬 General Questions & Support
- **Email**: hello@git.n85.uk
- **GitHub Issues**: [Create an Issue](https://github.com/N85UK/UnRiaid_Apps/issues)

### 🔒 Security Issues
- **Email**: security@git.n85.uk
- **GitHub Security**: [Report a Vulnerability](https://github.com/N85UK/UnRiaid_Apps/security/advisories)

---

## ✅ **Ready for UNRAID API Bounty**

The `UNRAID_API_Integration/` implementation provides everything required for the UNRAID API File Manager bounty:

1. ✅ **NestJS Module Integration**
2. ✅ **FileBrowser Subprocess Management**
3. ✅ **Proxy Authentication Bridge**
4. ✅ **Vue.js WebGUI (LogViewer pattern)**
5. ✅ **HTTP/WebSocket Proxy**
6. ✅ **Virtual Root Configuration**
7. ✅ **Service Lifecycle Management**
8. ✅ **Security & Permission Integration**
9. ✅ **JSON Configuration**
10. ✅ **Comprehensive Documentation**

**Made with ❤️ for the UNRAID community**