# Migration Guide: Legacy Plugins → ExplorerX Plugin

## ⚠️ **IMPORTANT CHANGE**

The file management solution has been **redesigned and implemented as ExplorerX Plugin** - a native UNRAID plugin with advanced multi-pane navigation and bulk operations.

## Current Implementation

### ✅ **ExplorerX Plugin (Current)**
```
ExplorerX_Plugin/
├── explorerx.plg              # Plugin manifest
├── source/                    # Native plugin implementation
│   └── usr/local/emhttp/plugins/explorerx/
│       ├── explorerx.page     # Main webGUI page
│       ├── include/           # PHP backend logic
│       ├── js/                # JavaScript frontend
│       ├── styles/            # CSS styles
│       └── scripts/           # Utility scripts
└── packages/                  # Built plugin packages
```

## Key Features

| Aspect | ExplorerX Plugin |
|--------|------------------|
| **Architecture** | Native UNRAID plugin |
| **Authentication** | UNRAID session integration |
| **UI Framework** | Vanilla JavaScript + PHP |
| **Performance** | No Docker overhead |
| **Features** | Multi-pane, bulk operations, background tasks |
| **Security** | Path guards, CSRF protection, operation logging |
| **Installation** | Single .plg file installation |

## Why ExplorerX?

ExplorerX was designed specifically for UNRAID users who need:

1. **Advanced Navigation**: Multi-pane interface for power users
2. **Bulk Operations**: Handle multiple files efficiently
3. **Background Processing**: Large operations don't block the UI
4. **Native Performance**: No container overhead
5. **Enhanced Security**: Comprehensive path validation and CSRF protection
6. **Mobile Support**: Responsive design for all devices

## Installation

### New Users

1. **Install ExplorerX Plugin**:
   ```
   Go to Plugins → Install Plugin
   Enter: https://raw.githubusercontent.com/N85UK/UNRAID_Apps/main/ExplorerX_Plugin/explorerx.plg
   Click Install
   ```

2. **Access the Plugin**:
   - Navigate to Tools → ExplorerX
   - Start using the multi-pane file manager

### Configuration

ExplorerX uses a simple configuration file at `/boot/config/plugins/explorerx/settings.cfg`:

```ini
# ExplorerX Configuration
ROOT_PATH=/mnt
ENABLE_ZIP=true
ENABLE_CHECKSUMS=true
ENABLE_PREVIEWS=true
ENABLE_BULK_OPS=true
MAX_CONCURRENT_TASKS=3
TASK_TIMEOUT=3600
DEFAULT_VIEW=list
SHOW_HIDDEN_FILES=false
DUAL_PANE_DEFAULT=false
LOG_LEVEL=info
LOG_RETENTION_DAYS=7
```

## API and Endpoints

ExplorerX provides a JSON API for file operations:

```
GET  /plugins/explorerx/include/api.php?action=list&path=/mnt/user
POST /plugins/explorerx/include/api.php (with action parameter)
```

All operations require CSRF tokens and proper session authentication.

## Security Features

### ✅ **Security Advantages**

1. **Path Validation**: All paths validated with realpath()
2. **CSRF Protection**: Token-based protection on all operations
3. **Session Integration**: Uses UNRAID's built-in authentication
4. **Operation Logging**: Comprehensive audit trail
5. **Input Sanitization**: All user inputs validated and sanitized
6. **Background Security**: Secure handling of queued operations

## Getting Started

### For Users
1. **Install**: Use the plugin URL in UNRAID's plugin installer
2. **Access**: Go to Tools → ExplorerX
3. **Explore**: Use dual-pane mode for advanced operations

### For Developers
1. **Study Implementation**: Review `ExplorerX_Plugin/source/`
2. **Understand Architecture**: Native PHP + JavaScript approach
3. **Follow Patterns**: UNRAID plugin best practices
4. **Contribute**: Help improve the plugin

## Features Overview

### Core Capabilities
- Multi-pane file browser
- Bulk file operations (copy, move, delete)
- Background task queue
- Quick file previews
- ZIP/unzip support
- Checksum generation
- Keyboard shortcuts
- Responsive mobile interface

### Advanced Features
- CSRF-protected operations
- Path traversal prevention
- Real-time progress monitoring
- Configurable root paths
- Operation audit logging

## Support

- **Documentation**: [ExplorerX_Plugin/README.md](ExplorerX_Plugin/README.md)
- **Issues**: [GitHub Issues](https://github.com/N85UK/UNRAID_Apps/issues)
- **Community**: UNRAID community forums

---

## Summary

ExplorerX Plugin provides a modern, secure, and feature-rich file management solution specifically designed for UNRAID. It offers advanced capabilities while maintaining native performance and security.