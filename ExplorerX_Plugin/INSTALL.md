# ExplorerX Plugin Installation Guide

## Quick Installation

### Method 1: Direct Plugin Installation (Recommended)

1. **Open UNRAID WebGUI**
2. **Navigate to Plugins**
   - Go to `Plugins` → `Install Plugin`
3. **Install Plugin**
   - Paste this URL:
   ```
   https://raw.githubusercontent.com/N85UK/UNRAID_Apps/main/ExplorerX_Plugin/explorerx.plg
   ```
   - Click `Install`
4. **Access ExplorerX**
   - Navigate to `ExplorerX` tab (standalone tab, not in Tools menu)

### Method 2: Community Applications

1. **Install Community Applications** (if not already installed)
   - Search for "Community Applications" in Plugins
2. **Search for ExplorerX**
   - Go to `Apps` tab
   - Search for "ExplorerX"
   - Click `Install`

## Manual Installation

If you prefer manual installation:

```bash
# Download the package
VERSION="2025.10.05.03.00"
PACKAGE="explorerx-${VERSION}-x86_64-1.txz"
wget "https://github.com/N85UK/UNRAID_Apps/releases/download/v${VERSION}/${PACKAGE}"

# Extract to plugins directory
cd /usr/local/emhttp/plugins
tar -xf "/path/to/${PACKAGE}"

# Set permissions
chmod -R 755 /usr/local/emhttp/plugins/explorerx
chown -R root:root /usr/local/emhttp/plugins/explorerx
```

## System Requirements

- **UNRAID Version**: 7.2.0-rc.1 or later
- **Architecture**: x86_64
- **Memory**: 20MB RAM minimum
- **Storage**: 10MB disk space
- **Dependencies**: PHP 8.x (included in UNRAID)

## First Launch

1. **Navigate to ExplorerX tab**
2. **Review default settings**
   - Default root path: `/mnt`
   - All features enabled by default
3. **Start exploring!**
   - Use dual-pane mode for advanced operations
   - Try keyboard shortcuts for faster navigation

## Configuration

Configuration file location: `/boot/config/plugins/explorerx/settings.cfg`

```ini
# Security: Default root path (modify with caution)
ROOT_PATH=/mnt

# Features
ENABLE_ZIP=true
ENABLE_CHECKSUMS=true
ENABLE_PREVIEWS=true
ENABLE_BULK_OPS=true

# Background task limits
MAX_CONCURRENT_TASKS=3
TASK_TIMEOUT=3600

# UI preferences
DEFAULT_VIEW=list
SHOW_HIDDEN_FILES=false
DUAL_PANE_DEFAULT=false
```

## Troubleshooting

### Plugin Not Appearing in Tools Menu

1. **Check installation**:
   ```bash
   ls -la /usr/local/emhttp/plugins/explorerx/
   ```

2. **Restart web server**:
   ```bash
   nginx -s reload
   ```

### Permission Issues

1. **Fix file permissions**:
   ```bash
   chmod -R 755 /usr/local/emhttp/plugins/explorerx
   chown -R root:root /usr/local/emhttp/plugins/explorerx
   ```

2. **Check PHP logs**:
   ```bash
   tail -f /var/log/nginx/error.log
   ```

### Background Tasks Stuck

1. **Check task queue**:
   ```bash
   cat /boot/config/plugins/explorerx/queue.json
   ```

2. **Clear stuck tasks**:
   ```bash
   echo '{"tasks":[],"version":"2025.10.05.03.00"}' > /boot/config/plugins/explorerx/queue.json
   ```

## Uninstallation

### Via UNRAID WebGUI

1. Go to `Plugins` page
2. Find `ExplorerX` in installed plugins
3. Click `Remove`

### Manual Uninstallation

```bash
# Remove plugin files
rm -rf /usr/local/emhttp/plugins/explorerx

# Remove configuration (optional)
rm -rf /boot/config/plugins/explorerx

# Remove logs (optional)
rm -rf /var/log/explorerx
```

## Support

- **Issues**: [GitHub Issues](https://github.com/N85UK/UNRAID_Apps/issues)
- **Forum**: [UNRAID Community Forums](https://forums.unraid.net)
- **Documentation**: [Project Wiki](https://github.com/N85UK/UNRAID_Apps/wiki)

---

**Version**: 2025.10.05.03.00  
**Author**: N85UK  
**Updated**: $(date '+%Y-%m-%d')
