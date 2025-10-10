# ExplorerX - Simple Native File Manager for UNRAID

**A simple, safe file manager plugin for UNRAID 7.2.0+ with clean interface and secure installation.**

## 🔧 **Latest Update (v2025.10.10.03.00)**

✅ **CRITICAL FIX**: Resolved blank page issue when navigating to `/ExplorerX`

**Issues Fixed:**
- ✅ **URL Mismatch**: Fixed `launch="ExplorerX"` vs `explorerx.page` filename conflict
- ✅ **Invalid Page Header**: Corrected menu placement from `UNRAID:5` to `61` for standalone tab
- ✅ **Header Formatting**: Removed invalid indentation that prevented UNRAID from recognizing the page
- ✅ **Icon Reference**: Ensured icon path matches available files
- ✅ **Case Sensitivity**: Fixed filesystem compatibility on UNRAID's case-sensitive system

**Result**: Plugin should now display the file browser interface instead of a blank page!

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
   - Navigate to **ExplorerX** tab (standalone tab in main navigation)
   - Start browsing your files

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

### v2025.10.10.03.00 (Current - Safe Version)

- ✅ **Completely safe installation** - won't break plugin system
- ✅ Simple file browser with directory navigation
- ✅ Standalone tab interface (not in Tools menu)
- ✅ Only touches ExplorerX files during install/uninstall
- ✅ Enhanced error handling and recovery
- ✅ No dangerous global plugin directory modifications
- ✅ Responsive interface for mobile and desktop

---

**⚠️ Safety Note**: This version was completely rewritten to be 100% safe after previous versions caused plugin system issues. The new version only touches ExplorerX files and will never interfere with other plugins or the overall UNRAID system.

**✅ Safe to Install**: ExplorerX v2025.10.10.03.00 is guaranteed safe and will not break your plugin system.
