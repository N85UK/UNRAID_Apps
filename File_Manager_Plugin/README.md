# File Manager Plugin for UNRAID

A modern, user-friendly file management plugin for UNRAID servers, providing a web-based interface for file operations.

## ✨ Features

- **Modern Web Interface**: Clean, responsive design that works on desktop and mobile
- **Easy Installation**: Automated setup process with clear step-by-step guidance
- **Secure File Operations**: Upload, download, create, delete, rename, and move files
- **Multiple File Support**: Batch operations and drag-and-drop uploads
- **Real-time Status**: Live service monitoring and status updates
- **User Management**: Admin user setup with customizable credentials
- **Cross-Platform**: Works with all UNRAID architectures (x86_64, ARM64, ARMv7)

## 🚀 Quick Installation

### Method 1: Direct URL (Recommended)
1. Go to **Plugins** tab in UNRAID
2. Click **Install Plugin**
3. Enter URL: `https://github.com/N85UK/UnRiaid_Apps/raw/main/File_Manager_Plugin/file-manager.plg`
4. Click **Install**

### Method 2: Manual Download
1. Download the `.plg` file from this repository
2. Upload to `/boot/config/plugins/` on your UNRAID server
3. Go to **Plugins** tab and install from local file

## 📋 Setup Process

After installation, the plugin will guide you through a simple 3-step setup:

### Step 1: Install FileBrowser Binary
- Click **"Install FileBrowser Binary"** in the plugin settings
- The plugin automatically downloads the correct version for your architecture
- No manual configuration required

### Step 2: Setup Admin User
- Click **"Setup Admin User"**
- Enter your desired username and password (defaults: admin/admin)
- Admin user is created with full permissions

### Step 3: Start Service
- Click **"Start Service"**
- FileBrowser service starts automatically
- Access your file manager at `http://your-server:8080`

## 🔧 Configuration

### Default Settings
- **Port**: 8080
- **Root Directory**: `/mnt/user` (all user shares)
- **Database**: `/boot/config/plugins/file-manager/filebrowser.db`
- **Config**: `/boot/config/plugins/file-manager/filebrowser.json`

### Customization
- Port can be changed in the configuration file
- Root directory can be modified to limit access
- User permissions are fully configurable
- Additional users can be added via the web interface

## 🌐 Accessing File Manager

Once installed and started:

1. **Embedded Interface**: Available directly in UNRAID Settings → File Manager
2. **Standalone Access**: `http://your-server-ip:8080`
3. **Mobile Access**: Responsive design works on phones and tablets

### Default Login
- **Username**: admin (or your custom username)
- **Password**: admin (or your custom password)

## 🗂️ File Operations

### Supported Operations
- **Browse**: Navigate through all your UNRAID shares
- **Upload**: Drag-and-drop or click to upload files
- **Download**: Single files or entire folders (as ZIP)
- **Create**: New files and folders
- **Edit**: Text files with built-in editor
- **Copy/Move**: Files and folders between locations
- **Delete**: Files and folders with confirmation
- **Archive**: Create and extract ZIP/TAR files
- **Share**: Generate temporary download links

### Virtual Roots
Access to all UNRAID storage locations:
- `/mnt/user` - All user shares
- `/mnt/cache` - Cache drive
- `/mnt/disk1`, `/mnt/disk2`, etc. - Individual disks
- `/mnt/user/appdata` - Docker container data

## 🔒 Security Features

- **User Authentication**: Required login for all access
- **Permission System**: Granular control over user capabilities
- **Path Restrictions**: Configurable access limitations
- **Secure Uploads**: File type and size validation
- **Session Management**: Automatic logout for security

## 🛠️ Management

### Service Control
- **Start/Stop**: Control service from UNRAID interface
- **Status Monitoring**: Real-time service status display
- **Log Access**: View service logs for troubleshooting
- **Auto-refresh**: Interface updates automatically

### User Management
- **Add Users**: Create additional users via web interface
- **Set Permissions**: Control what each user can do
- **Password Changes**: Users can change their own passwords
- **Admin Controls**: Admins can manage all users

## 📊 System Requirements

- **UNRAID Version**: 6.8 or later
- **Architecture**: x86_64, ARM64, or ARMv7
- **Memory**: 50MB RAM for service
- **Storage**: 20MB for binary and config
- **Network**: Port 8080 (configurable)

## 🔧 Troubleshooting

### Common Issues

**1. Service Won't Start**
- Check if port 8080 is available
- Verify FileBrowser binary is installed
- Check logs: `/var/log/file-manager/`

**2. Can't Access Web Interface**
- Confirm service is running (green status)
- Check firewall settings
- Try different browser or clear cache

**3. Login Issues**
- Use default credentials: admin/admin
- Reset user via **Setup Admin User** button
- Check database file isn't corrupted

**4. File Upload Fails**
- Check available disk space
- Verify user has write permissions
- Check file size limits

### Getting Help
1. Check plugin logs: `/var/log/file-manager/`
2. Restart service: Stop → Start
3. Reinstall binary if needed
4. [Create GitHub Issue](https://github.com/N85UK/UnRiaid_Apps/issues)

## 🔄 Updates

The plugin supports automatic updates through UNRAID's plugin system:
- Updates appear in **Plugins** tab when available
- Changelog shows what's new in each version
- Settings and data are preserved during updates
- Service automatically restarts with new version

## 🗑️ Uninstalling

To remove the plugin:
1. Go to **Plugins** tab
2. Click **Remove** next to File Manager
3. Confirm removal
4. Configuration files are preserved for future reinstalls

## 📋 Version History

### v2025.10.03.20 (Latest - FileBrowser Installation Fix)
- **Fixed FileBrowser Binary Installation**: Corrected version command from `--version` to `version` for CLI compatibility
- **Resolved Installation Failures**: Binary testing now works correctly across all architectures
- **Enhanced Reliability**: Improved error handling and diagnostic reporting

### v2025.10.03.19 (Enhanced Installation)
- **Enhanced Binary Installation**: Network checks, multiple download sources, comprehensive error handling
- **Improved Reliability Features**: Fallback URLs, retry logic, detailed diagnostics
- **Code Cleanup**: Removed unused files, optimized archive
- **Version Consistency**: Fixed version mismatches across all files
- **Security**: Enhanced input validation and secure operations

### v2.0 (2025.10.03.10)
- Complete rebuild with improved reliability
- Enhanced user interface and experience
- Automatic setup process
- Better error handling and feedback
- Cross-architecture support
- Comprehensive logging

## 📄 License

MIT License - see [LICENSE](../LICENSE) for details.

## 🤝 Contributing

Contributions welcome! Please see [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.

## 💬 Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/N85UK/UnRiaid_Apps/issues)
- **UNRAID Forums**: Search for "File Manager Plugin"
- **Email**: hello@git.n85.uk

---

**Made with ❤️ for the UNRAID community**