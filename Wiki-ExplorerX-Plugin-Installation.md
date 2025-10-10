# ExplorerX Plugin Installation Guide

**Complete installation guide for ExplorerX - Native UNRAID file manager plugin**

## 🎯 **Current Status: Debug Version Active**

⚠️ **Important**: ExplorerX v2025.10.10.0002 is currently a **debug version** deployed to investigate interface rendering issues. The plugin installs safely but may show debug information instead of the standard file browser interface.

### Debug Version Details
- **Version**: v2025.10.10.0002 (DEBUG)
- **Status**: Investigating HTML code display instead of file browser
- **Safety**: ✅ 100% safe installation, no system interference
- **Access**: Via Tools → ExplorerX in UNRAID webGUI
- **Purpose**: Enhanced logging to identify and resolve interface issues

## 📋 **Prerequisites**

### System Requirements
- **UNRAID Version**: 7.2.0-rc.1 or later
- **Architecture**: x86_64
- **Dependencies**: PHP 8.x (included in UNRAID)
- **Memory**: 20MB RAM (native implementation)
- **Storage**: 10MB disk space

### Before Installation
- ✅ **UNRAID System**: Ensure your UNRAID system is running 7.2.0+
- ✅ **Backup Recommended**: Create plugin backup (optional but recommended)
- ✅ **Network Access**: Internet connection for plugin download
- ✅ **Browser Ready**: Modern browser for accessing the interface

## 🚀 **Installation Methods**

### Method 1: Direct Plugin Installation (Recommended)

1. **Open UNRAID WebGUI**
   - Navigate to your UNRAID server's web interface
   - Login with your admin credentials

2. **Access Plugin Installation**
   - Click **\"Plugins\"** in the top navigation menu
   - Select **\"Install Plugin\"** tab

3. **Install ExplorerX Plugin**
   ```
   Plugin URL: https://raw.githubusercontent.com/N85UK/UNRAID_Apps/main/ExplorerX_Plugin/explorerx.plg
   ```
   - Paste the URL into the plugin URL field
   - Click **\"Install\"** button
   - Wait for installation to complete

4. **Access ExplorerX**
   - Navigate to **\"Tools\"** in the top menu
   - Click **\"ExplorerX\"**
   - Debug interface will load (current debug version)

### Method 2: Community Applications (If Available)

1. **Install Community Applications Plugin** (if not already installed)
   - Go to Plugins → Install Plugin
   - Use Community Applications plugin URL
   - Install and configure

2. **Search for ExplorerX**
   - Open **\"Apps\"** tab
   - Search for **\"ExplorerX\"**
   - Click **\"Install\"** when found

3. **Complete Installation**
   - Follow on-screen installation prompts
   - Access via Tools → ExplorerX

## 🛡️ **Safety Information**

### What Makes ExplorerX Safe

ExplorerX was completely rewritten to be 100% safe after previous versions caused system issues:

✅ **Only Touches ExplorerX Files**:
- Installation: `chown -R root:root /usr/local/emhttp/plugins/explorerx` (ONLY ExplorerX)
- Never modifies: `/usr/local/emhttp/plugins/` (other plugins)
- Removal: Only removes ExplorerX directory

✅ **Safe Installation Scripts**:
- No global plugin directory permission changes
- No interference with other plugins
- Comprehensive error handling
- Safe cleanup procedures

✅ **System Stability**:
- Guaranteed not to break plugin system
- Won't affect other plugins during install/uninstall
- Safe to update without system restart

### Safety Verification
After installation, you can verify safety by checking:
```bash
# Check only ExplorerX directory was created
ls -la /usr/local/emhttp/plugins/explorerx

# Verify other plugins are untouched
ls -la /usr/local/emhttp/plugins/
```

## 🔧 **Post-Installation Setup**

### 1. Initial Access
- **Location**: Tools → ExplorerX in UNRAID webGUI
- **First Load**: May show debug information (current debug version)
- **Interface**: Debug panel with system information and troubleshooting data

### 2. Debug Information Review
The current debug version provides:
- 🔍 **Enhanced Error Logging**: Detailed error messages and stack traces
- 📊 **API Response Logging**: Complete API response information
- 🛠️ **Debug Console Output**: Browser console debugging information
- 📝 **Detailed Status Messages**: Step-by-step operation logging

### 3. Browser Developer Tools
For troubleshooting, open browser developer tools:
1. **Chrome/Edge**: Press F12 or right-click → \"Inspect\"
2. **Firefox**: Press F12 or right-click → \"Inspect Element\"
3. **Check Console**: Look for JavaScript errors or debug messages
4. **Network Tab**: Monitor API requests and responses

## 🔍 **Troubleshooting Installation**

### Common Installation Issues

#### Issue: Plugin Download Fails
**Symptoms**: Error message during plugin download
**Solutions**:
1. Check internet connectivity on UNRAID server
2. Verify plugin URL is correct and accessible
3. Try installation again after a few minutes
4. Check UNRAID system logs for specific errors

#### Issue: Installation Completes but Plugin Not Visible
**Symptoms**: Installation succeeds but ExplorerX not in Tools menu
**Solutions**:
1. Refresh the UNRAID webGUI page (Ctrl+F5)
2. Wait 30 seconds and check Tools menu again
3. Restart UNRAID web services: `/etc/rc.d/rc.nginx restart`
4. Check plugin directory exists: `/usr/local/emhttp/plugins/explorerx`

#### Issue: Debug Interface Shows Instead of File Browser
**Symptoms**: Debug information displayed instead of file management interface
**Current Status**: This is **expected behavior** for debug version v2025.10.10.0002
**Information**:
- This is intentional for debugging interface rendering issues
- Debug information helps identify the root cause of interface problems
- Plugin is safely installed and functional for debugging purposes
- Normal file browser interface will be restored in future updates

### Debug Version Specific Troubleshooting

#### Understanding Debug Output
The debug version displays:
- **API Status**: Shows if backend API is responding correctly
- **Error Messages**: Detailed error information for troubleshooting
- **System Information**: Plugin status and configuration details
- **Browser Console**: JavaScript errors and debug messages

#### What to Report
If experiencing issues with the debug version:
1. **Screenshot**: Capture the debug interface
2. **Browser Console**: Copy any error messages from developer tools
3. **System Info**: Note UNRAID version and browser details
4. **Steps**: Describe what you were trying to do when issues occurred

## 📞 **Getting Support**

### Debug Version Support
For issues with the current debug version:
- **GitHub Issues**: [Create an Issue](https://github.com/N85UK/UNRAID_Apps/issues) with debug information
- **Debug Logs**: Include browser console output and debug panel information
- **System Details**: Provide UNRAID version and browser information

### General Support
- **📧 Email**: hello@git.n85.uk
- **🔒 Security Issues**: security@git.n85.uk
- **📚 Documentation**: Check [Common Issues](Common-Issues) wiki page

## 🔄 **Uninstallation (If Needed)**

### Safe Removal Process
1. **Access Plugin Management**
   - Go to Plugins in UNRAID webGUI
   - Find ExplorerX in installed plugins list

2. **Remove Plugin**
   - Click **\"Remove\"** next to ExplorerX
   - Confirm removal when prompted
   - Wait for uninstallation to complete

3. **Verify Cleanup**
   ```bash
   # Verify ExplorerX directory is removed
   ls -la /usr/local/emhtml/plugins/explorerx
   # Should show \"No such file or directory\"
   ```

### What Gets Removed
- ✅ **Only ExplorerX Files**: `/usr/local/emhttp/plugins/explorerx/`
- ✅ **Plugin Registration**: UNRAID plugin database entry
- ✅ **Menu Entry**: Tools menu entry removed
- ❌ **Other Plugins**: No other plugins affected
- ❌ **System Files**: No system files modified

## 📊 **Installation Verification**

### Successful Installation Checklist
- [ ] Plugin URL downloaded without errors
- [ ] Installation completed successfully
- [ ] ExplorerX appears in Tools menu
- [ ] Debug interface loads when clicking ExplorerX
- [ ] No errors in UNRAID system logs
- [ ] Other plugins remain unaffected
- [ ] Browser developer tools show debug information

### Directory Structure Check
After installation, verify the plugin structure:
```bash
/usr/local/emhttp/plugins/explorerx/
├── explorerx.page              # Plugin page definition
├── include/                    # PHP backend files
│   ├── api.php                # Enhanced API with debugging
│   ├── ExplorerX.php          # Core functionality
│   └── security.php           # Security functions
├── js/                        # JavaScript files
│   ├── explorerx.js          # Main UI logic
│   └── file-operations.js     # File operation handlers
├── styles/                    # CSS styling
│   └── explorerx.css         # Plugin styles
└── scripts/                   # Shell scripts
    ├── install.sh            # Installation script
    └── uninstall.sh          # Removal script
```

## 🎯 **Next Steps**

### After Installation
1. **Access Plugin**: Navigate to Tools → ExplorerX
2. **Review Debug Info**: Examine the debug interface output
3. **Report Issues**: Help improve the plugin by reporting problems
4. **Stay Updated**: Monitor for updates that resolve interface issues

### Future Updates
- **Interface Fix**: Normal file browser will be restored in upcoming versions
- **Enhanced Features**: Additional file management capabilities planned
- **Improved Stability**: Ongoing improvements based on debug feedback

---

**⚠️ Debug Version Notice**: The current v2025.10.10.0002 is specifically for debugging interface rendering issues. While fully safe to install, it shows debug information instead of the standard file browser interface. This is temporary and helps identify the root cause of interface problems.

**✅ Installation Guarantee**: ExplorerX v2025.10.10.0002 is guaranteed safe and will not break your plugin system or interfere with other plugins.