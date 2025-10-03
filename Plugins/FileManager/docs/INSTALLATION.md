# Installation Guide

This guide walks you through installing and configuring the UNRAID File Manager Plugin.

## 📦 Installation Methods

### Method 1: Direct URL Installation (Recommended)

This is the easiest method for most users:

1. **Open UNRAID WebGUI**
   - Navigate to your UNRAID server's web interface
   - Default URL: `http://YOUR_SERVER_IP`

2. **Access Plugin Manager**
   - Go to `Plugins` → `Install Plugin`
   - Or navigate to `http://YOUR_SERVER_IP/Settings/Plugins`

3. **Install via URL**
   - In the "URL" field, enter:
     ```
     https://github.com/YOUR_USERNAME/unraid-file-manager/releases/latest/download/file-manager.plg
     ```
   - Click `Install`

4. **Wait for Installation**
   - The plugin will download and install automatically
   - You'll see progress in the installation log

### Method 2: Manual Download and Install

If you prefer to download the plugin file first:

1. **Download Plugin File**
   - Visit the [Releases](https://github.com/YOUR_USERNAME/unraid-file-manager/releases) page
   - Download the latest `file-manager.plg` file

2. **Upload to UNRAID**
   - Copy the file to your UNRAID server (via SSH, web interface, or network share)
   - Recommended location: `/boot/config/plugins/`

3. **Install via Plugin Manager**
   - Go to `Plugins` → `Install Plugin`
   - Click "Browse" and select your downloaded `.plg` file
   - Click `Install`

## ⚙️ Initial Configuration

After installation, configure the plugin:

### 1. Access Main Interface
- Navigate to `Settings` → `File Manager`
- You should see the main plugin interface

### 2. Configure Basic Settings
- **Service Status**: Ensure the service is running (green indicator)
- **Port Configuration**: Default port is 8080 (can be changed in settings)
- **File Browser Path**: Set the root directory for file browsing

### 3. User Permissions
- Configure user access levels (Admin/User)
- Set file operation permissions
- Configure upload/download limits

### 4. Advanced Settings
- Access via `Settings` → `File Manager Settings`
- Configure security options
- Set performance parameters
- Customize UI preferences

## 🔧 Configuration Options

### Basic Settings
| Setting | Description | Default |
|---------|-------------|---------|
| Service Port | Web interface port | 8080 |
| Root Directory | Base directory for browsing | /mnt/user |
| Auto Start | Start service with UNRAID | Enabled |
| Debug Mode | Enable debug logging | Disabled |

### Security Settings
| Setting | Description | Default |
|---------|-------------|---------|
| Authentication | Require login | Enabled |
| Admin Only | Restrict to admin users | Disabled |
| Upload Enabled | Allow file uploads | Enabled |
| Download Enabled | Allow file downloads | Enabled |

### Performance Settings
| Setting | Description | Default |
|---------|-------------|---------|
| Max Upload Size | Maximum file upload size | 100MB |
| Concurrent Users | Maximum simultaneous users | 10 |
| Cache Enabled | Enable file caching | Enabled |
| Rate Limiting | API rate limiting | Enabled |

## 🌐 Accessing the Interface

### Web Interface
Once configured, access the file manager:

1. **Direct Access**
   - `http://YOUR_SERVER_IP:8080` (or your configured port)

2. **Via UNRAID Interface**
   - `Settings` → `File Manager` → "Open Interface" button

3. **Mobile Access**
   - The interface is fully responsive and works on mobile devices
   - Same URLs as desktop access

### API Access
For programmatic access:
- **Base URL**: `http://YOUR_SERVER_IP:8080/api`
- **Documentation**: Available at `/api/docs` (Swagger UI)
- **Authentication**: Required for all operations

## 🚨 Troubleshooting

### Common Issues

#### Plugin Won't Install
- **Check URL**: Ensure the installation URL is correct
- **Network Access**: Verify UNRAID has internet access
- **Disk Space**: Ensure sufficient space on the boot drive
- **Permissions**: Check file system permissions

#### Service Won't Start
1. **Check Logs**:
   ```bash
   tail -f /var/log/syslog | grep file-manager
   ```

2. **Port Conflicts**:
   - Ensure port 8080 (or configured port) isn't in use
   - Check with: `netstat -tulpn | grep :8080`

3. **Dependencies**:
   - Verify Node.js is available
   - Check plugin dependencies in logs

#### Interface Not Loading
1. **Clear Browser Cache**
   - Hard refresh: `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)

2. **Check Network**:
   - Verify UNRAID server is accessible
   - Test with: `ping YOUR_SERVER_IP`

3. **Firewall Settings**:
   - Ensure port is open in firewall
   - Check UNRAID network settings

#### File Operations Failing
1. **Check Permissions**:
   ```bash
   ls -la /mnt/user/
   ```

2. **Disk Space**:
   ```bash
   df -h
   ```

3. **File Locks**:
   - Ensure files aren't in use by other processes
   - Check for corrupted files

### Getting Help

1. **Check Logs First**:
   - UNRAID System Log: `/var/log/syslog`
   - Plugin Log: Check plugin settings page

2. **Gather Information**:
   - UNRAID version
   - Plugin version
   - Browser and version
   - Error messages
   - Steps to reproduce

3. **Support Channels**:
   - [GitHub Issues](https://github.com/YOUR_USERNAME/unraid-file-manager/issues)
   - UNRAID Community Forums
   - Plugin documentation

## 🔄 Updates

### Automatic Updates
- Enable automatic updates in plugin settings
- Plugin will check for updates daily
- Notifications shown in UNRAID interface

### Manual Updates
1. **Check for Updates**:
   - Visit the plugin settings page
   - Look for update notifications

2. **Install Updates**:
   - Click "Update" in plugin manager
   - Or reinstall using the same URL

3. **Backup Settings**:
   - Settings are preserved during updates
   - Manual backup recommended for major versions

## 📱 Mobile Usage

The plugin is optimized for mobile devices:

### Features
- **Responsive Design**: Adapts to screen size
- **Touch Gestures**: Swipe to navigate
- **Mobile Upload**: Camera and file uploads
- **Offline Support**: Basic caching for poor connections

### Tips
- Use landscape mode for better file browsing
- Pinch to zoom in file details
- Long press for context menus

## 🔐 Security Considerations

### Best Practices
1. **Change Default Port**: Use a non-standard port
2. **Enable Authentication**: Always require login
3. **Limit Access**: Restrict to admin users if needed
4. **Regular Updates**: Keep plugin updated
5. **Monitor Logs**: Check for suspicious activity

### Network Security
- Use HTTPS when possible (reverse proxy)
- Consider VPN access for remote usage
- Limit network exposure

## 🎯 Performance Tips

### Optimization
1. **Enable Caching**: Improves response times
2. **Limit File Size**: Set reasonable upload limits
3. **Monitor Resources**: Check CPU and memory usage
4. **Regular Cleanup**: Remove temporary files

### Monitoring
- Check system resource usage
- Monitor file operation performance
- Review access logs regularly

---

Need more help? Check our [FAQ](FAQ.md) or [Contributing Guide](CONTRIBUTING.md)!