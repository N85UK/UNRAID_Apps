# UNRAID File Manager Plugin

A modern, feature-rich file management plugin for UNRAID 7.2+ systems with native API integration and an intuitive web interface.

## 🚀 Features

- **UNRAID 7.2+ Native Integration**: Built for UNRAID's native API system
- **Modern Web Interface**: Clean, responsive FileBrowser-based design with dark/light theme support
- **Secure File Operations**: Upload, download, move, copy, and delete files safely
- **API Authentication**: Seamless integration with UNRAID's native authentication system
- **Real-time Updates**: Live file system monitoring and status updates via WebSocket
- **Mobile Responsive**: Works seamlessly on desktop, tablet, and mobile devices
- **GraphQL API Ready**: Compatible with UNRAID's native GraphQL API

## 📋 Requirements

- **UNRAID 7.2 or higher** (Required for native API integration)
- **64-bit architecture** (x86_64, ARM64 supported)
- **1GB+ available disk space**
- **Network access** for initial setup

## 📦 Installation

### UNRAID Plugin Installation
**Install URL:** 
```
https://github.com/N85UK/UnRiaid_Apps/raw/main/Plugins/FileManager/file-manager.plg
```

**Installation Steps:**
1. Go to UNRAID web interface
2. Navigate to **Plugins** tab
3. Click **Install Plugin**
4. Paste the URL above
5. Click **Install**

**Modern Features:**
- ✅ Native UNRAID 7.2+ API integration
- ✅ GraphQL API compatibility
- ✅ Advanced file operations with FileBrowser v2.44.0
- ✅ UNRAID Connect authentication support
- ✅ Real-time status monitoring via native API
- ✅ Professional web interface with UNRAID theming
- ✅ Mobile responsive design optimized for UNRAID 7.2

## 🛠️ Configuration

After installation, access the plugin via:
- **Main Interface**: `Settings` → `File Manager`
- **Advanced Settings**: `Settings` → `File Manager Settings`

### Initial Setup (Advanced Plugin)
1. Configure file browser settings
2. Set user permissions
3. Customize interface preferences
4. Test file operations

### Service Configuration
The advanced plugin runs a FileBrowser service on port 8080 (configurable):
- **Default Port**: 8080
- **Service**: Automatically started with UNRAID
- **Authentication**: Integrated with UNRAID users
- **Virtual Roots**: Pre-configured for common UNRAID paths

## 📱 Usage

### Web Interface
- **File Browser**: Navigate and manage files through the web interface
- **Uploads**: Drag and drop files or use the upload dialog
- **Downloads**: Single-click download for files
- **Batch Operations**: Select multiple files for bulk actions

### API Access
The plugin provides REST API endpoints for programmatic access:
- File operations: GET, POST, PUT, DELETE
- User management: Authentication and authorization
- System status: Health checks and diagnostics

## 🔧 Development

### Prerequisites
- Node.js 18+
- npm or yarn
- UNRAID 6.8+ for testing

### Build from Source
```bash
# Clone the repository
git clone https://github.com/N85UK/UnRiaid_Apps.git
cd "UnRiaid_Apps/Plugins/FileManager"

# Install dependencies
npm install

# Build the plugin
./dev/build-plg.sh --vendor

# Or use the setup script
./setup-advanced.sh
```

### Development Mode
```bash
# Start development server
npm run dev

# Run tests
npm test

# Type checking
npm run type-check
```

### Plugin Structure
```
Plugins/FileManager/
├── src/                    # TypeScript source code
├── webgui/                 # UNRAID web interface files
├── scripts/                # Installation/removal scripts
├── dev/                    # Build tools and scripts
├── dist/                   # Compiled JavaScript
├── file-manager.plg        # Plugin manifest
└── file-manager-*.tar.xz   # Plugin archive
```

## 📸 Screenshots

| Feature | Preview |
|---------|---------|
| Main Interface | Modern file manager with responsive design |
| File Browser | Advanced file operations and navigation |
| Settings Panel | Configuration options and preferences |
| Mobile View | Optimized mobile interface |

## 🆘 Support

### Common Issues
- **Plugin won't start**: Check UNRAID logs and ensure all dependencies are installed
- **Permission errors**: Verify user permissions and file system access
- **UI not loading**: Clear browser cache and check network connectivity

### Getting Help
1. Check the [Issues](https://github.com/N85UK/UnRiaid_Apps/issues) page
2. Search existing discussions
3. Create a new issue with:
   - UNRAID version
   - Plugin version
   - Error logs
   - Steps to reproduce

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting pull requests.

### Development Process
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📋 Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history and updates.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- UNRAID team for the excellent platform
- FileBrowser project for file management inspiration
- NestJS community for the robust framework
- Contributors and beta testers

## 📊 Stats

![GitHub release (latest by date)](https://img.shields.io/github/v/release/N85UK/UnRiaid_Apps)
![GitHub downloads](https://img.shields.io/github/downloads/N85UK/UnRiaid_Apps/total)
![GitHub issues](https://img.shields.io/github/issues/N85UK/UnRiaid_Apps)
![GitHub stars](https://img.shields.io/github/stars/N85UK/UnRiaid_Apps)

---

**Made with ❤️ for the UNRAID community**