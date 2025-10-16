# ExplorerX - Simple Native File Manager for UNRAID

**A simple, safe file manager plugin for UNRAID 7.2.0+ with clean interface and secure installation.**

## 🔧 DEBUG VERSION ACTIVE (v2025.10.10.0002)

⚠️ **CURRENTLY DEBUGGING**: Debug version deployed to resolve interface rendering issues

**Debug Status:**
- 📝 **VERSION**: v2025.10.10.0002 (DEBUG) with enhanced API logging
- 🔍 **PURPOSE**: Resolve interface showing HTML code instead of file browser
- 📊 **DEBUG FEATURES**: Enhanced error reporting and detailed API response logging
- 🛠️ **ACCESS**: Via Tools → ExplorerX in UNRAID webGUI
- ⏳ **STATUS**: Investigating root cause of interface rendering issues

**How to Access:**
1. Go to your UNRAID webGUI
2. Click **Tools** in the top menu
3. Click **ExplorerX**
4. Debug information will be displayed to help identify issues

## 🎯 Overview

ExplorerX is a **native UNRAID plugin** (no Docker required) that provides basic file management capabilities directly integrated into the UNRAID webGUI. It offers a clean, simple interface for browsing and managing your files safely.

## ✨ Key Features

### Core Capabilities
- ✅ **Simple directory navigation** - Browse your UNRAID shares easily
- ✅ **Clean interface** - Accessible via Tools menu
- ✅ **Safe installation** - Won't break your plugin system
- ✅ **Responsive design** - Works on mobile and desktop
- ✅ **Zero Docker overhead** - Pure native implementation
- ✅ **Secure by design** - Only touches ExplorerX files

### Operations
- 📂 Browse directories and files
- 🔧 Basic file and folder operations
- 🔍 Simple directory listing
- 📊 File size and modification date display

### Security & Safety
- 🛡️ **Safe Installation**: Only modifies ExplorerX files, never touches other plugins
- 🔒 Proper path validation
- 🚫 Operations restricted to safe directories
- 🔑 Respects UNRAID session model
- ✅ **System Stability**: Guaranteed not to break plugin system

## 📋 Requirements

- **UNRAID Version**: 7.2.0-rc.1 or later
- **Architecture**: x86_64
- **Dependencies**: PHP 8.x (included in UNRAID)

## 🚀 Installation

### Safe Installation Steps

1. **Backup First (Recommended)**:
   ```bash
   # Create backup on UNRAID
   mkdir -p /boot/backups/$(date +%Y%m%d_%H%M%S)
   cd /boot/backups/$(date +%Y%m%d_%H%M%S)
   tar -czf plugins_backup.tar.gz -C /usr/local/emhttp plugins/
   ```

2. **Install Plugin**:
   - Go to **Plugins → Install Plugin** in UNRAID webGUI
   - Enter URL: `https://raw.githubusercontent.com/N85UK/UNRAID_Apps/main/ExplorerX_Plugin/explorerx.plg`
   - Click **Install**

3. **Access Plugin**:
   - Navigate to **Tools → ExplorerX** in UNRAID webGUI
   - Debug interface will load with enhanced logging

## 📖 Usage

### Basic Navigation
1. Open **Tools → ExplorerX** from the UNRAID navigation
2. The default view shows `/mnt` directory structure
3. Click folders to navigate into them
4. Use breadcrumb navigation to go back to parent directories
5. View file details including size and modification date

### Debug Information
The current debug version provides:
- 🔍 **Enhanced Error Logging**: Detailed error messages and stack traces
- 📊 **API Response Logging**: Complete API response information
- 🛠️ **Debug Console Output**: Browser console debugging information
- 📝 **Detailed Status Messages**: Step-by-step operation logging

### Interface Elements
- **Breadcrumb Bar**: Shows current path and allows quick navigation
- **Toolbar**: Refresh, Parent, and Home buttons
- **File List**: Clean table view with file/folder information
- **Debug Panel**: Enhanced error reporting and system information
- **Responsive**: Adapts to mobile and desktop screens

## 🛡️ Safety Features

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

## 📜 Version History

### v2025.10.10.0002 (Current - Debug Version)
- 🔧 **DEBUG DEPLOYMENT**: Enhanced API debugging to resolve interface rendering issues
- 📊 **ENHANCED LOGGING**: Detailed error reporting and API response logging
- 🛠️ **TROUBLESHOOTING**: Investigating HTML code display instead of file browser
- 📝 **DEBUG FEATURES**: Browser console debugging and detailed status messages
- 🔍 **ROOT CAUSE ANALYSIS**: Comprehensive debugging to identify interface issues
- ✅ **TOOLS MENU**: Accessible via Tools → ExplorerX
- 📋 **VERSION FORMAT**: YYYY.MM.DD.#### format maintained

### v2025.10.10.0002 (Previous - Working Interface)
- ✅ **VERSION FORMAT**: Changed to YYYY.MM.DD.#### format
- ✅ **SUCCESS CONFIRMED**: Plugin working correctly via Tools → ExplorerX
- ✅ **FILE MANAGER FUNCTIONAL**: Directory navigation, refresh, and controls working
- ✅ **API RESPONDING**: Backend endpoints working correctly
- ✅ **TOOLS MENU INTEGRATION**: Located in Tools menu for standard UNRAID access
- ✅ **ALL FIXES APPLIED**: Installation, extraction, verification, and menu issues resolved
- ✅ **CLEAN PACKAGE**: No metadata files, proper UNRAID integration

## 🐛 Troubleshooting

### Current Debug Issues
**Interface Rendering Problem:**
- **Issue**: Plugin may show HTML code instead of file browser interface
- **Debug Version**: v2025.10.10.0002 deployed with enhanced logging
- **Investigation**: API endpoints respond correctly, investigating frontend rendering
- **Workaround**: Debug information provides insight into system status

**Common Solutions:**
- **Clear Browser Cache**: Force refresh (Ctrl+F5) the ExplorerX page
- **Check Debug Console**: Open browser developer tools for debug information
- **Verify API Status**: Debug version shows API response status
- **Report Issues**: Use enhanced logging to report specific error details

### Installation Issues
If you encounter installation problems:
- **Check UNRAID Version**: Ensure 7.2.0+ compatibility
- **Verify Plugin Directory**: Confirm `/usr/local/emhttp/plugins/explorerx` exists
- **Review Installation Logs**: Check UNRAID system logs for errors
- **Safe Removal**: Plugin can be safely removed without affecting other plugins

### Support
For support with the debug version:
- **GitHub Issues**: Report bugs with debug information included
- **Debug Logs**: Include browser console output and debug panel information
- **System Info**: Provide UNRAID version and browser details

---

**⚠️ Current Status**: Debug version v2025.10.10.0002 is actively being improved to resolve interface rendering issues. The plugin is safe to install and provides enhanced debugging information to help identify and fix problems.

## 🎯 Overview

ExplorerX is a **native UNRAID plugin** (no Docker required) that provides basic file management capabilities directly integrated into the UNRAID webGUI. It offers a clean, simple interface for browsing and managing your files safely.

## ✨ Key Features

### Core Capabilities

- ✅ **Simple directory navigation** - Browse your UNRAID shares easily
- ✅ **Clean interface** - Accessible via Tools menu
- ✅ **Safe installation** - Won't break your plugin system
- ✅ **Responsive design** - Works on mobile and desktop
- ✅ **Zero Docker overhead** - Pure native implementation
- ✅ **Secure by design** - Only touches ExplorerX files

### Operations

- 📂 Browse directories and files
- 🔧 Basic file and folder operations
- 🔍 Simple directory listing
- 📊 File size and modification date display

### Security & Safety

- 🛡️ **Safe Installation**: Only modifies ExplorerX files, never touches other plugins
- 🔒 Proper path validation
- 🚫 Operations restricted to safe directories
- 🔑 Respects UNRAID session model
- ✅ **System Stability**: Guaranteed not to break plugin system

## 📋 Requirements

- **UNRAID Version**: 7.2.0-rc.1 or later
- **Architecture**: x86_64
- **Dependencies**: PHP 8.x (included in UNRAID)

## 🚀 Installation

### Safe Installation Steps

1. **Backup First (Recommended)**:
   ```bash
   # Create backup on UNRAID
   mkdir -p /boot/backups/$(date +%Y%m%d_%H%M%S)
   cd /boot/backups/$(date +%Y%m%d_%H%M%S)
   tar -czf plugins_backup.tar.gz -C /usr/local/emhttp plugins/
   ```

2. **Install Plugin**:
   - Go to **Plugins → Install Plugin** in UNRAID webGUI
   - Enter URL: `https://raw.githubusercontent.com/N85UK/UNRAID_Apps/main/ExplorerX_Plugin/explorerx.plg`
   - Click **Install**

3. **Access Plugin**:
   - Navigate to **Tools → ExplorerX** in UNRAID webGUI
   - Debug interface will load with enhanced logging

## 📖 Usage

### Basic Navigation

1. Open **Tools → ExplorerX** from the UNRAID navigation
2. The default view shows `/mnt` directory structure
3. Click folders to navigate into them
4. Use breadcrumb navigation to go back to parent directories
5. View file details including size and modification date

### Debug Information

The current debug version provides:
- 🔍 **Enhanced Error Logging**: Detailed error messages and stack traces
- 📊 **API Response Logging**: Complete API response information
- 🛠️ **Debug Console Output**: Browser console debugging information
- 📝 **Detailed Status Messages**: Step-by-step operation logging

### Interface Elements

- **Breadcrumb Bar**: Shows current path and allows quick navigation
- **Toolbar**: Refresh, Parent, and Home buttons
- **File List**: Clean table view with file/folder information
- **Debug Panel**: Enhanced error reporting and system information
- **Responsive**: Adapts to mobile and desktop screens

## 🛡️ Safety Features

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

## 📜 Version History

### v2025.10.10.0002 (Current - Debug Version)

- 🔧 **DEBUG DEPLOYMENT**: Enhanced API debugging to resolve interface rendering issues
- 📊 **ENHANCED LOGGING**: Detailed error reporting and API response logging
- 🛠️ **TROUBLESHOOTING**: Investigating HTML code display instead of file browser
- 📝 **DEBUG FEATURES**: Browser console debugging and detailed status messages
- 🔍 **ROOT CAUSE ANALYSIS**: Comprehensive debugging to identify interface issues
- ✅ **TOOLS MENU**: Accessible via Tools → ExplorerX
- 📋 **VERSION FORMAT**: YYYY.MM.DD.#### format maintained

### v2025.10.10.0002 (Previous - Working Interface)

- ✅ **VERSION FORMAT**: Changed to YYYY.MM.DD.#### format
- ✅ **SUCCESS CONFIRMED**: Plugin working correctly via Tools → ExplorerX
- ✅ **FILE MANAGER FUNCTIONAL**: Directory navigation, refresh, and controls working
- ✅ **API RESPONDING**: Backend endpoints working correctly
- ✅ **TOOLS MENU INTEGRATION**: Located in Tools menu for standard UNRAID access
- ✅ **ALL FIXES APPLIED**: Installation, extraction, verification, and menu issues resolved
- ✅ **CLEAN PACKAGE**: No metadata files, proper UNRAID integration

---

**⚠️ Debug Note**: The current v2025.10.10.0002 is a debug version deployed to resolve interface rendering issues. The plugin installs successfully and is accessible via Tools → ExplorerX, but may show debug information instead of the standard file browser interface.

**✅ Safe to Install**: ExplorerX v2025.10.10.0002 is guaranteed safe and will not break your plugin system. The debug version helps identify and resolve interface issues.

## 🎯 Overview

ExplorerX is a **native UNRAID plugin** (no Docker required) that provides basic file management capabilities directly integrated into the UNRAID webGUI. It offers a clean, simple interface for browsing and managing your files safely.

## ✨ Key Features

### Core Capabilities

- ✅ **Simple directory navigation** - Browse your UNRAID shares easily
- ✅ **Clean interface** - Standalone tab (not buried in Tools menu)
- ✅ **Safe installation** - Won't break your plugin system
- ✅ **Responsive design** - Works on mobile and desktop
- ✅ **Zero Docker overhead** - Pure native implementation
- ✅ **Secure by design** - Only touches ExplorerX files

### Operations

- 📂 Browse directories and files
- 🔧 Basic file and folder operations
- 🔍 Simple directory listing
- 📊 File size and modification date display

### Security & Safety

- 🛡️ **Safe Installation**: Only modifies ExplorerX files, never touches other plugins
- 🔒 Proper path validation
- 🚫 Operations restricted to safe directories
- 🔑 Respects UNRAID session model
- ✅ **System Stability**: Guaranteed not to break plugin system

## 📋 Requirements

- **UNRAID Version**: 7.2.0-rc.1 or later
- **Architecture**: x86_64
- **Dependencies**: PHP 8.x (included in UNRAID)

## 🚀 Installation

### Safe Installation Steps

1. **Backup First (Recommended)**:
   ```bash
   # Create backup on UNRAID
   mkdir -p /boot/backups/$(date +%Y%m%d_%H%M%S)
   cd /boot/backups/$(date +%Y%m%d_%H%M%S)
   tar -czf plugins_backup.tar.gz -C /usr/local/emhttp plugins/
   ```

2. **Install Plugin**:
   - Go to **Plugins → Install Plugin** in UNRAID webGUI
   - Enter URL: `https://raw.githubusercontent.com/N85UK/UNRAID_Apps/main/ExplorerX_Plugin/explorerx.plg`
   - Click **Install**

3. **Access Plugin**:
   - Navigate to **Tools → ExplorerX** in UNRAID webGUI
   - File manager interface will load with directory browser

## 📖 Usage

### Basic Navigation

1. Open **ExplorerX** tab from the UNRAID navigation
2. The default view shows `/mnt` directory structure
3. Click folders to navigate into them
4. Use breadcrumb navigation to go back to parent directories
5. View file details including size and modification date

### Interface Elements

- **Breadcrumb Bar**: Shows current path and allows quick navigation
- **Toolbar**: Refresh, Parent, and Home buttons
- **File List**: Clean table view with file/folder information
- **Responsive**: Adapts to mobile and desktop screens

## 🛡️ Safety Features

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

## 📜 Version History

<<<<<<< HEAD
## 🐛 Troubleshooting

### Current Debug Issues

**Interface Rendering Problem:**
- **Issue**: Plugin may show HTML code instead of file browser interface
- **Debug Version**: v2025.10.10.0002 deployed with enhanced logging
- **Investigation**: API endpoints respond correctly, investigating frontend rendering
- **Workaround**: Debug information provides insight into system status

**Common Solutions:**
- **Clear Browser Cache**: Force refresh (Ctrl+F5) the ExplorerX page
- **Check Debug Console**: Open browser developer tools for debug information
- **Verify API Status**: Debug version shows API response status
- **Report Issues**: Use enhanced logging to report specific error details

### Installation Issues

If you encounter installation problems:
- **Check UNRAID Version**: Ensure 7.2.0+ compatibility
- **Verify Plugin Directory**: Confirm `/usr/local/emhttp/plugins/explorerx` exists
- **Review Installation Logs**: Check UNRAID system logs for errors
- **Safe Removal**: Plugin can be safely removed without affecting other plugins

### Support

For support with the debug version:
- **GitHub Issues**: Report bugs with debug information included
- **Debug Logs**: Include browser console output and debug panel information
- **System Info**: Provide UNRAID version and browser details

---

**⚠️ Current Status**: Debug version v2025.10.10.0002 is actively being improved to resolve interface rendering issues. The plugin is safe to install and provides enhanced debugging information to help identify and fix problems.
