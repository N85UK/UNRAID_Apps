# ExplorerX Quick Start Guide

## 🚀 For End Users (Installation)

### Install in 3 Steps

1. **Open Unraid WebGUI**
   - Navigate to **Plugins** tab
   - Click **Install Plugin**

2. **Enter Plugin URL**

   ```text
   https://raw.githubusercontent.com/N85UK/UNRAID_Apps/main/ExplorerX_Plugin/explorerx.plg
   ```

3. **Access ExplorerX**
   - Go to **Tools → ExplorerX**
   - Start browsing your files!

### First Use

- **Default Root:** `/mnt` (all your Unraid shares)
- **Quick Links:** Click to jump to user shares, disks, cache
- **Multi-Select:** Hold Ctrl/Cmd and click files
- **Dual Pane:** Click ⚌ button to enable split view

---

## 🛠️ For Developers (Building & Testing)

### Prerequisites

```bash
# On your Unraid system
mkdir -p /tmp/explorerx-dev
cd /tmp/explorerx-dev
git clone https://github.com/N85UK/UNRAID_Apps.git
cd UNRAID_Apps/ExplorerX_Plugin
```

### Build Package

```bash
# Make build script executable
chmod +x createpackage.sh

# Build the package
./createpackage.sh

# Output will be in packages/ directory
ls -lh packages/
```

### Test Installation

```bash
# Copy package to boot config
cp packages/explorerx-0.1.0-x86_64-1.txz /boot/config/plugins/explorerx/

# Extract to plugins directory
cd /usr/local/emhttp/plugins
tar -xf /boot/config/plugins/explorerx/explorerx-0.1.0-x86_64-1.txz

# Set permissions
chmod -R 755 explorerx
chmod +x explorerx/scripts/*.sh

# Run installation
bash explorerx/scripts/install.sh
```

### Verify Installation

```bash
# Check files exist
ls -la /usr/local/emhttp/plugins/explorerx/

# Check configuration
cat /boot/config/plugins/explorerx/settings.cfg

# Check logs
tail -f /var/log/explorerx/explorerx.log

# Access via browser
# http://your-tower/Tools/ExplorerX
```

### Development Workflow

```bash
# 1. Make changes in source/
nano source/usr/local/emhttp/plugins/explorerx/explorerx.page

# 2. Test locally (copy to plugin dir)
cp -r source/usr/local/emhttp/plugins/explorerx/* \
     /usr/local/emhttp/plugins/explorerx/

# 3. Refresh browser to test changes

# 4. When ready, rebuild package
./createpackage.sh
```

---

## 🧪 Quick Test Scenarios

### Test 1: Basic Navigation

```bash
# Access plugin
# Navigate to /mnt/user
# Click into a share folder
# Use breadcrumb to go back
```

### Test 2: Create & Delete

```bash
# Click "New Folder" button
# Enter name: "test_folder"
# Select the folder
# Click Delete button
# Confirm deletion
```

### Test 3: Copy & Paste

```bash
# Select a file
# Click Copy button
# Navigate to different directory
# Click Paste button
# Verify file copied
```

### Test 4: Upload & Download

```bash
# Click Upload button
# Select a file from your computer
# Wait for upload to complete
# Select the uploaded file
# Click Download button
# Verify download starts
```

---

## 🔧 Configuration

### Edit Settings

```bash
nano /boot/config/plugins/explorerx/settings.cfg
```

### Common Settings

```ini
# Change root path (advanced users only)
ROOT_PATH=/mnt

# Disable features
ENABLE_ZIP=false
ENABLE_CHECKSUMS=false

# Adjust task limits
MAX_CONCURRENT_TASKS=5
TASK_TIMEOUT=7200

# UI preferences
SHOW_HIDDEN_FILES=true
DUAL_PANE_DEFAULT=true
```

### Apply Changes

Refresh the browser page after changing settings.

---

## 📝 Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+A` | Select all files |
| `Ctrl+C` | Copy selected |
| `Ctrl+X` | Cut selected |
| `Ctrl+V` | Paste |
| `Delete` | Delete selected |
| `Ctrl+N` | New folder |
| `F2` | Rename |
| `Ctrl+F` | Focus search |
| `Backspace` | Parent directory |
| `Ctrl+P` | Toggle dual pane |
| `F5` | Refresh |

---

## 🐛 Troubleshooting

### Plugin Not Appearing

```bash
# Check if installed
ls -la /usr/local/emhttp/plugins/explorerx/

# Check permissions
chmod -R 755 /usr/local/emhttp/plugins/explorerx/

# Restart nginx
nginx -s reload
```

### Operations Fail

```bash
# Check logs
tail -f /var/log/explorerx/explorerx.log

# Check PHP errors
tail -f /var/log/nginx/error.log

# Verify permissions
ls -la /boot/config/plugins/explorerx/
```

### Cannot Access /mnt

```bash
# Verify root path
grep ROOT_PATH /boot/config/plugins/explorerx/settings.cfg

# Check directory exists
ls -la /mnt/
```

---

## 📚 More Information

- **Full Documentation:** [README.md](README.md)
- **Testing Guide:** [TESTING.md](TESTING.md)
- **Implementation Details:** [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)
- **Version History:** [CHANGELOG.md](CHANGELOG.md)

---

## 🆘 Getting Help

- **GitHub Issues:** [Report Issues](https://github.com/N85UK/UNRAID_Apps/issues)
- **Unraid Forums:** [Community Support](https://forums.unraid.net)

---

## ⚡ Quick Commands Reference

```bash
# Build package
./createpackage.sh

# Install locally
tar -xf packages/explorerx-*.txz -C /usr/local/emhttp/plugins/

# View logs
tail -f /var/log/explorerx/explorerx.log

# Uninstall
rm -rf /usr/local/emhttp/plugins/explorerx
rm -rf /boot/config/plugins/explorerx

# Restart nginx
nginx -s reload
```

---

**That's it! You're ready to use ExplorerX.** 🎉

For advanced usage and customization, see the full [README.md](README.md).
