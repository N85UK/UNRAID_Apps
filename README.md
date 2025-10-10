# UNRAID Apps Repository

A collection of applications and plugins for UNRAID systems, providing enhanced functionality and user experience.

## 🚀 **Available Projects**

### 📁 **ExplorerX Plugin** (Safe & Stable)
**Simple, native file manager for UNRAID with clean interface and safe installation**

- **Location**: [`ExplorerX_Plugin/`](ExplorerX_Plugin/)
- **Status**: ✅ **Safe & Ready - v2025.10.10.02.00**
- **Installation**: `https://raw.githubusercontent.com/N85UK/UNRAID_Apps/main/ExplorerX_Plugin/explorerx.plg`

**Key Features:**
- 🌐 Simple directory navigation and file listing
- 📱 Responsive design for mobile and desktop  
- 🔧 **Native Integration**: No Docker required, pure UNRAID plugin
- 🔒 Safe installation that won't break other plugins
- 📂 Access to all UNRAID shares and drives
- 🛡️ **Enhanced Security**: Safe permission handling, no global modifications
- 🎯 **Standalone Tab**: Clean interface not buried in Tools menu

**Quick Setup:**
1. Install plugin via URL above
2. Navigate to ExplorerX tab (standalone)
3. Browse your files with simple, safe interface

**Latest Features (v2025.10.10.02.00):**
- 🔍 PACKAGE VERIFICATION: Detects and corrects wrong cached packages during download
- 🔄 CACHE REFRESH: Forces UNRAID to download latest fixed package (prevents old cached versions)
-  CRITICAL FIX: Resolved installation extraction failure that prevented plugin from working
- ✅ Fixed tar extraction directory (plugins/ → root/) for proper UNRAID path handling
- ✅ Automatic re-download if wrong version detected during installation
- ✅ MD5 verification with retry mechanism for package integrity
- ✅ Installation now works correctly on all UNRAID systems
- ✅ Resolved blank page issue when navigating to /ExplorerX
- ✅ Completely safe installation (won't break plugin system)

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
- 🌙 **Dark Mode Toggle** with persistent storage
- 📊 **Real-time Analytics Charts** with Chart.js integration
- 🎨 **Modern Material Design** with smooth animations
- 📱 **Fully Responsive** mobile-first design
- ⚡ **Enhanced JavaScript** with modular ES6+ architecture
- 🎯 **Advanced Message Preview** with live cost estimation
- 🔄 **WebSocket Support** for real-time updates

#### **MariaDB Enterprise Edition** 🏢
- **Location**: [`Apps/AWS_EUM_MariaDB/`](Apps/AWS_EUM_MariaDB/)
- **Status**: ✅ Production Ready - Auto-deployed
- **Installation**: `https://github.com/N85UK/UNRAID_Apps/raw/main/Apps/AWS_EUM_MariaDB/template.cfg`
- **Docker Image**: `ghcr.io/n85uk/aws-eum-mariadb:latest`

**Enterprise Features:**
- 🗄️ **External Database Integration** (MariaDB/MySQL)
- 👥 **Multi-User Authentication** with role-based access control
- 🔐 **JWT Authentication** with bcrypt password hashing
- 📊 **Advanced Analytics Dashboard** with historical data
- ⚡ **Connection Pooling** and optimized database operations
- 🔧 **Automated Migrations** and database seeding
- 📈 **Comprehensive Audit Trails** and reporting
- 🛡️ **Enterprise Security** with session management
- 👤 **User Roles**: Admin, User, ReadOnly access levels
- 📋 **API Key Management** for programmatic access

**Role Capabilities:**
- **Admin**: Full system access, user management, all features
- **User**: Send messages, view own history, basic analytics
- **ReadOnly**: View messages and analytics, no sending

**Database Schema:**
- Advanced 7-table structure with foreign keys and indexing
- User management with secure password storage
- Message tracking with status and analytics
- Settings management with environment variables
- Session handling for web authentication

## 📦 **Installation Methods**

### For ExplorerX Plugin

**Option 1: Direct Installation (Recommended)**
```
1. Go to Plugins → Install Plugin
2. Enter: https://raw.githubusercontent.com/N85UK/UNRAID_Apps/main/ExplorerX_Plugin/explorerx.plg
3. Click Install
4. Navigate to ExplorerX tab to start using
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
│   ├── AWS_EUM/               # v2.0 - Stable SMS messaging
│   ├── AWS_EUM_v3/            # v3.0 - Enhanced UI with dark mode & charts
│   ├── AWS_EUM_MariaDB/       # Enterprise - Multi-user with database
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

### AWS EUM Version Comparison

| Feature | v2.0 (Stable) | v3.0 (Enhanced UI) | MariaDB (Enterprise) |
|---------|---------------|-------------------|---------------------|
| **SMS Delivery** | ✅ AWS Pinpoint | ✅ AWS Pinpoint | ✅ AWS Pinpoint |
| **Interface** | Clean & Simple | Modern Material Design | Enterprise Dashboard |
| **Dark Mode** | ❌ | ✅ Persistent Toggle | ✅ User Preferences |
| **Real-time Charts** | ❌ | ✅ Chart.js Integration | ✅ Advanced Analytics |
| **Multi-User** | ❌ Single User | ❌ Single User | ✅ Role-Based Access |
| **Database** | File Storage | File Storage | MariaDB/MySQL |
| **Authentication** | None | None | JWT + bcrypt |
| **User Roles** | N/A | N/A | Admin/User/ReadOnly |
| **API Keys** | ❌ | ❌ | ✅ Management |
| **Audit Trails** | Basic Logs | Enhanced Logs | Comprehensive |
| **WebSocket** | ❌ | ✅ Real-time Updates | ✅ Live Dashboard |
| **Mobile Design** | Basic Responsive | Fully Responsive | Enterprise Mobile |
| **Best For** | Simple Setup | Modern UI Needs | Enterprise/Teams |

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