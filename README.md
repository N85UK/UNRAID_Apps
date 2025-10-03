# UNRAID Apps Repository

A collection of applications and plugins for UNRAID systems, providing enhanced functionality and user experience.

## 🚀 **Available Projects**

### 📁 **File Manager Plugin** (Ready to Install)
**Modern web-based file management for UNRAID**

- **Location**: [`File_Manager_Plugin/`](File_Manager_Plugin/)
- **Status**: ✅ **Ready for Production Use - v2025.10.03.19**
- **Installation**: `https://github.com/N85UK/UnRiaid_Apps/raw/main/File_Manager_Plugin/file-manager.plg`

**Key Features:**
- 🌐 Modern responsive web interface
- 📱 Mobile-friendly design
- 🔧 **Enhanced Installation**: Network checks, multiple download sources, comprehensive error handling
- 🔒 Secure user authentication
- 📂 Access to all UNRAID shares and drives
- ⬆️⬇️ Upload/download with drag-and-drop
- 🗜️ Archive creation and extraction
- 🔄 Real-time service monitoring
- 🛠️ **Improved Reliability**: Fallback URLs, retry logic, detailed diagnostics

**Quick Setup:**
1. Install plugin via URL above
2. Click "Install FileBrowser Binary" (now with enhanced error handling)
3. Click "Setup Admin User"
4. Click "Start Service"
5. Access at `http://your-server:8080`

**Latest Improvements (v2025.10.03.19):**
- ✅ Network connectivity verification before download
- ✅ Multiple download sources (GitHub, JSDeliver, Raw GitHub)
- ✅ Comprehensive error diagnostics and logging
- ✅ Binary testing before and after installation
- ✅ Automatic fallback and retry mechanisms
- ✅ Enhanced security and input validation

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

### 📧 **AWS End User Messaging**
**SMS messaging via AWS Pinpoint**

- **Location**: [`AWS_EUM/`](AWS_EUM/)
- **Status**: ✅ Production Ready
- **Installation**: `https://github.com/N85UK/UnRiaid_Apps/raw/main/AWS_EUM/template.cfg`

## 📦 **Installation Methods**

### For File Manager Plugin

**Option 1: Direct Installation (Recommended)**
```
1. Go to Plugins → Install Plugin
2. Enter: https://github.com/N85UK/UnRiaid_Apps/raw/main/File_Manager_Plugin/file-manager.plg
3. Click Install
4. Follow 3-step setup process
```

**Option 2: Community Applications**
```
1. Install Community Applications if needed
2. Search for "File Manager" in Apps tab
3. Click Install
```

### For UNRAID API Integration

The bounty submission requires integration by the UNRAID team:
```typescript
// Add to UNRAID API codebase
import { FileManagerModule } from './modules/filemanager/filemanager.module';
```

## 🛠️ **Development & Architecture**

### Repository Structure
```
UnRiaid_Apps/
├── File_Manager_Plugin/        # Ready-to-install UNRAID plugin v2025.10.03.19
│   ├── file-manager.plg        # Plugin manifest (XML validated)
│   ├── webgui/                 # PHP-based interface with enhanced error handling
│   ├── scripts/                # Installation/removal scripts
│   └── README.md               # Installation guide
├── Bounty_Submission/          # UNRAID API integration (complete)
│   ├── api/src/unraid-api/modules/filemanager/  # NestJS module
│   ├── web/pages/              # Vue.js WebGUI
│   └── README.md               # Integration guide
├── AWS_EUM/                    # Docker application
└── Documentation/              # Updated project documentation
    ├── README.md               # This file
    ├── CHANGELOG.md            # Version history
    ├── CONTRIBUTING.md         # Development guidelines
    ├── SECURITY.md             # Security policy
    └── MIGRATION.md            # Migration guides
```

### Key Differences

| Aspect | Plugin Version | API Integration |
|--------|---------------|-----------------|
| **Use Case** | Install now on any UNRAID | Future API integration |
| **Architecture** | Traditional plugin | NestJS module |
| **Authentication** | FileBrowser built-in | UNRAID API proxy |
| **Interface** | PHP + iframe | Vue.js component |
| **Installation** | One-click install | API team integration |

## 📋 **System Requirements**

### For Plugin Version
- **UNRAID**: 6.8.0+ (tested through 7.2+)
- **Architecture**: x86_64, ARM64, ARMv7
- **Memory**: 50MB RAM
- **Storage**: 25MB disk space
- **Network**: **Internet access required** for initial FileBrowser binary download
- **Connectivity**: HTTPS access to GitHub (with automatic fallbacks)

### For API Integration
- **UNRAID API**: Development environment
- **Node.js**: 18+
- **TypeScript**: Latest
- **NestJS**: Framework knowledge

## 🆘 **Support & Documentation**

### Plugin Support
- **Quick Start**: [File_Manager_Plugin/README.md](File_Manager_Plugin/README.md)
- **Installation Issues**: [GitHub Issues](https://github.com/N85UK/UnRiaid_Apps/issues)
- **User Guide**: Built into plugin interface

### API Integration Support  
- **Bounty Spec**: [UNRAID API Issue #1599](https://github.com/unraid/api/issues/1599)
- **Implementation**: [Bounty_Submission/README.md](Bounty_Submission/README.md)
- **Architecture**: [MIGRATION.md](MIGRATION.md)

## 🔄 **Version Status**

### Current Active Projects
- ✅ **File Manager Plugin v2025.10.03.19**: Production ready with enhanced installation
- ✅ **Bounty Submission**: Complete, ready for UNRAID API integration
- ✅ **AWS EUM**: Stable, minimal maintenance

### Discontinued Projects
- ❌ **Legacy Plugin**: Archived, replaced by v2.0

## 🤝 **Contributing**

We welcome contributions for both projects:

**For Plugin Development:**
- PHP and JavaScript knowledge
- UNRAID plugin architecture understanding
- FileBrowser integration experience

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

### Want File Management Now?
→ Install the **File Manager Plugin**: [Installation Guide](File_Manager_Plugin/README.md)

### Building UNRAID API Features?
→ Check the **Bounty Submission**: [Integration Guide](Bounty_Submission/README.md)

**Made with ❤️ for the UNRAID community**

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