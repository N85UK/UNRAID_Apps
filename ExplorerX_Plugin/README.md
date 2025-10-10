# ExplorerX - Simple Native File Manager for UNRAID

**A simple, safe file manager plugin for UNRAID 7.2.0+ with clean interface and secure installation.**

## 🎉 **SUCCESS! Working Version (v2025.10.10.0001)**

✅ **PLUGIN NOW WORKING**: Successfully accessible via Tools → ExplorerX

**Latest Changes:**
- ✅ **VERSION FORMAT**: Changed to YYYY.MM.DD.#### format (v2025.10.10.0001)
- ✅ **SUCCESS CONFIRMED**: File manager interface loading and fully functional
- ✅ **NAVIGATION WORKING**: Directory navigation, refresh, parent/home controls all working
- ✅ **API RESPONDING**: Backend API endpoints responding correctly
- ✅ **MENU INTEGRATION**: Located in Tools menu for standard UNRAID access
- ✅ **INSTALLATION FIXED**: All extraction, verification, and installation issues resolved

**How to Access:**
1. Go to your UNRAID webGUI
2. Click **Tools** in the top menu
3. Click **ExplorerX**
4. File manager loads with directory browser

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
### v2025.10.10.06.00 (Current - Safe Version)
=======
### v2025.10.10.0001 (Current - Working Version)
>>>>>>> b8618c9 (🎉 SUCCESS CONFIRMED: Version format change to YYYY.MM.DD.#### (v2025.10.10.0001))

- ✅ **VERSION FORMAT**: Changed to YYYY.MM.DD.#### format
- ✅ **SUCCESS CONFIRMED**: Plugin working correctly via Tools → ExplorerX
- ✅ **FILE MANAGER FUNCTIONAL**: Directory navigation, refresh, and controls working
- ✅ **API RESPONDING**: Backend endpoints working correctly
- ✅ **TOOLS MENU INTEGRATION**: Located in Tools menu for standard UNRAID access
- ✅ **ALL FIXES APPLIED**: Installation, extraction, verification, and menu issues resolved
- ✅ **CLEAN PACKAGE**: No metadata files, proper UNRAID integration

---

**⚠️ Safety Note**: This version was completely rewritten to be 100% safe after previous versions caused plugin system issues. The new version only touches ExplorerX files and will never interfere with other plugins or the overall UNRAID system.

**✅ Safe to Install**: ExplorerX v2025.10.10.06.00 is guaranteed safe and will not break your plugin system.
