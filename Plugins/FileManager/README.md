# File Manager Plugin for UNRAID v1.6

A powerful, modern file manager plugin for UNRAID servers, providing an intuitive web-based interface for file management operations. **Production ready with FileBrowser integration!**

## Features

- **UNRAID 7.2+ Native Integration**: Built for UNRAID's native API system
- **Modern Web Interface**: Clean, responsive FileBrowser-based design with dark/light theme support
- **Secure File Operations**: Upload, download, move, copy, and delete files safely
- **API Authentication**: Seamless integration with UNRAID's native authentication system
- **Real-time Updates**: Live file system monitoring and status updates via WebSocket
- **Mobile Responsive**: Works seamlessly on desktop, tablet, and mobile devices
- **GraphQL API Ready**: Compatible with UNRAID's native GraphQL API

## 📋 Requirements

- **UNRAID 7.0 or higher** (Optimized for 7.2+ native API features)
- **64-bit architecture** (x86_64, ARM64, ARMv7 supported)
- **FileBrowser binary** (automatically installed)
- **Network access** for initial setup and FileBrowser download

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
6. Access via **Settings** → **File Manager**

### Initial Setup
After installation:
1. **Install FileBrowser Binary**: Click "Install FileBrowser Binary" button
2. **Setup Admin User**: Click "Setup Admin" to create login credentials
3. **Start Service**: Click "Start Service" to begin file management
4. **Access Interface**: Use the provided URL (typically http://server:8080)

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

## �️ Plugin Structure

The plugin consists of:

```
Plugins/FileManager/
├── webgui/                 # UNRAID web interface files
│   ├── FileManager.php     # Main interface page  
│   ├── FileManager.page    # UNRAID page definition
│   ├── FileManagerSettings.php # Configuration page
│   ├── setup_admin.php     # Admin user setup
│   ├── install_binary.php  # FileBrowser installation
│   ├── start_service.php   # Service management
│   ├── file-explorer.png   # Plugin icon
│   └── styles/             # CSS styling
├── scripts/                # Installation/removal scripts
│   ├── install.sh          # Plugin installation
│   ├── remove.sh           # Plugin removal
│   └── file-manager-service.sh # Service management
├── file-manager.plg        # Plugin manifest
└── README.md               # This documentation
```

## 🎯 Current Features

- **FileBrowser v2.44.0**: Modern web-based file manager
- **Easy Setup**: One-click installation and admin setup
- **Service Management**: Start/stop FileBrowser service from UNRAID
- **Cross-Server Compatible**: Works on any UNRAID server (IP/hostname agnostic)
- **Error Handling**: Comprehensive error reporting and debugging
- **Mobile Responsive**: Works on desktop, tablet, and mobile devices

## 📸 Screenshots

| Feature | Preview |
|---------|---------|
| Main Interface | Modern file manager with responsive design |
| File Browser | Advanced file operations and navigation |
| Settings Panel | Configuration options and preferences |
| Mobile View | Optimized mobile interface |

## 🆘 Troubleshooting

### Common Issues

#### "Installation error. Check logs for details."
- Check debug log: `/tmp/filebrowser_install.log`
- Ensure internet connectivity for FileBrowser download
- Verify architecture compatibility (x86_64, ARM64, ARMv7)

#### "Service management error. Check logs for details."
- Try "Setup Admin" to initialize FileBrowser database
- Check if port 8080 is available or configure different port
- Verify FileBrowser binary is installed at `/usr/local/bin/filebrowser`

#### "XML file doesn't exist or xml parse error"
- Clear UNRAID plugin cache
- Try reinstalling the plugin
- Check internet connectivity

#### FileBrowser login issues
- Use "Setup Admin" button to create initial user credentials
- Default credentials: admin/admin (change after first login)
- Check FileBrowser is running on the correct port

### Getting Help
1. Check the [Issues](https://github.com/N85UK/UnRiaid_Apps/issues) page
2. Include in your report:
   - UNRAID version
   - Plugin version
   - Error messages
   - Debug log contents (`/tmp/filebrowser_install.log`)
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