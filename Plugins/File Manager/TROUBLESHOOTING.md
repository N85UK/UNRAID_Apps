# File Manager Installation Guide

## 🚨 Current Issues with the Plugin

Your File Manager plugin has several issues preventing it from working:

### 1. Missing Release Assets
- The plugin expects `file-manager-2025.10.03.tar.xz` but it doesn't exist
- Need to create a proper release with the required files

### 2. Complex Structure
- Current plugin is very complex with NestJS backend
- Requires Node.js, FileBrowser binary, and many dependencies
- Too advanced for a basic UNRAID plugin

## ✅ Solutions

### Option A: Use the Simple Plugin (Immediate Fix)
1. **Install the simplified version:**
   ```
   https://github.com/N85UK/UnRiaid_Apps/raw/main/Plugins/File%20Manager/file-manager-simple.plg
   ```

2. **What it provides:**
   - Basic UNRAID integration
   - Links to existing UNRAID file browser
   - Placeholder for future development
   - Will appear in Tools > File Manager

### Option B: Build Proper Release (Advanced)
1. **Run the build script:**
   ```bash
   cd "Plugins/File Manager"
   ./dev/build-plg.sh --vendor --version 2025.10.03
   ```

2. **Create GitHub release:**
   - Upload the generated `.tar.xz` file
   - Tag as `v2025.10.03`
   - Update MD5 hash in the `.plg` file

### Option C: Use Existing Tools
UNRAID already has file management capabilities:
- **Web Terminal:** For command-line file operations
- **Krusader:** Full-featured file manager (available in Community Applications)
- **File Browser:** Simple web-based file browser plugin
- **MC (Midnight Commander):** Terminal-based file manager

## 🔧 Quick Fix Steps

1. **Try the simple plugin first:**
   - Go to Plugins → Install Plugin
   - Use URL: `https://github.com/N85UK/UnRiaid_Apps/raw/main/Plugins/File%20Manager/file-manager-simple.plg`

2. **Check if it appears:**
   - Look in Tools → File Manager
   - Should show a basic interface with links

3. **For full functionality:**
   - Consider using Krusader from Community Applications
   - Or develop the complex plugin further with proper releases

## 📋 Why Your Plugin Wasn't Visible

1. **Installation likely failed** due to missing files
2. **No menu entry** because the plugin structure wasn't created
3. **Silent failure** - UNRAID doesn't always show plugin installation errors clearly

The simple plugin I created should at least appear in your Tools menu and give you a foundation to build upon!