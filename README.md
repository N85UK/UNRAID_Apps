# UNRAID Apps Repository

A collection of applications and plugins for UNRAID systems, providing enhanced functionality and user experience.

## 🚀 **Available Projects**

### 📁 **ExplorerX Plugin** (Production Ready)
**Advanced native file manager for UNRAID with multi-pane navigation and bulk operations**

- **Location**: [`ExplorerX_Plugin/`](ExplorerX_Plugin/)
- **Status**: ✅ **Ready for Production Use - v0.1.1**
- **Installation**: `https://raw.githubusercontent.com/N85UK/UNRAID_Apps/main/ExplorerX_Plugin/explorerx.plg`

**Key Features:**
- 🌐 Multi-pane navigation for power users
- 📱 Responsive design for mobile and desktop
- 🔧 **Native Integration**: No Docker required, pure UNRAID plugin
- 🔒 Secure path validation and CSRF protection
- 📂 Access to all UNRAID shares and drives
- ⬆️⬇️ Bulk operations with background task queue
- 🗜️ ZIP/unzip and checksum support
- 🔄 Real-time progress monitoring
- ⌨️ **Keyboard Shortcuts**: Power-user navigation
- 🛡️ **Advanced Security**: Path guards, operation logging, session integration

**Quick Setup:**
1. Install plugin via URL above
2. Navigate to Tools → ExplorerX
3. Start browsing with enhanced file management
4. Use dual-pane mode for advanced operations

**Latest Features (v0.1.1):**
- ✅ Multi-pane file browser with bulk operations
- ✅ Background task queue for large operations
- ✅ Comprehensive security with path validation
- ✅ ZIP archive creation and extraction
- ✅ Keyboard shortcuts for power users
- ✅ **Mobile-responsive interface**
- ✅ **Fixed webGUI Error 500 during uninstall**

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

### For ExplorerX Plugin

**Option 1: Direct Installation (Recommended)**
```
1. Go to Plugins → Install Plugin
2. Enter: https://raw.githubusercontent.com/N85UK/UNRAID_Apps/main/ExplorerX_Plugin/explorerx.plg
3. Click Install
4. Navigate to Tools → ExplorerX to start using
```

**Option 2: Community Applications**
```
1. Install Community Applications if needed
2. Search for "ExplorerX" in Apps tab
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
UNRAID_Apps/
├── ExplorerX_Plugin/           # Advanced native file manager (current focus)
│   ├── explorerx.plg          # Plugin manifest with enhanced features
│   ├── source/                # Source code for multi-pane interface
│   ├── packages/              # Built plugin packages
│   └── README.md              # Installation and usage guide
├── Bounty_Submission/          # UNRAID API integration (complete)
│   ├── api/src/unraid-api/modules/filemanager/  # NestJS module
│   ├── web/pages/              # Vue.js WebGUI
│   └── README.md               # Integration guide
├── Apps/
│   ├── AWS_EUM/               # Docker application for AWS messaging
│   └── ca-submission/         # Community Applications submission tools
└── Documentation/              # Project documentation
    ├── README.md               # This file
    ├── CHANGELOG.md            # Version history
    ├── CONTRIBUTING.md         # Development guidelines
    ├── SECURITY.md             # Security policy
    └── MIGRATION.md            # Migration guides
```

### Key Differences

| Aspect | ExplorerX Plugin | API Integration |
|--------|------------------|------------------|
| **Use Case** | Install now on any UNRAID | Future API integration |
| **Architecture** | Native UNRAID plugin | NestJS module |
| **Authentication** | UNRAID session integration | UNRAID API proxy |
| **Interface** | Multi-pane native UI | Vue.js component |
| **Installation** | One-click install | API team integration |
| **Performance** | No Docker overhead | Framework overhead |

## 📋 **System Requirements**

### For ExplorerX Plugin
- **UNRAID**: 7.2.0-rc.1+ (optimized for latest versions)
- **Architecture**: x86_64
- **Memory**: 20MB RAM (native implementation)
- **Storage**: 10MB disk space
- **Dependencies**: PHP 8.x (included in UNRAID)
- **Network**: Not required for core functionality

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
- ✅ **AWS EUM**: Stable, minimal maintenance
- ✅ **CA Submission Tools**: Community Applications integration

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