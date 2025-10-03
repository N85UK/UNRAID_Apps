# Migration Guide: Plugin → UNRAID API Integration

## ⚠️ **IMPORTANT CHANGE**

The File Manager implementation has been **completely redesigned** to match the UNRAID API bounty requirements. The previous plugin approach was incorrect.

## What Changed

### ❌ **Old Approach (Plugin)**
```
Plugins/FileManager/
├── file-manager.plg           # Plugin manifest
├── webgui/FileManager.page    # PHP-based settings page
├── scripts/install.sh         # Manual installation
└── file-manager-*.txz         # Plugin archive
```

### ✅ **New Approach (API Integration)**
```
UNRAID_API_Integration/
├── api/src/unraid-api/modules/filemanager/  # NestJS module
├── web/pages/FileManager.vue                # Vue.js component
└── api/dev/configs/filemanager.json         # JSON configuration
```

## Key Differences

| Aspect | Plugin Version | API Integration |
|--------|---------------|-----------------|
| **Architecture** | Standalone UNRAID plugin | NestJS module in UNRAID API |
| **Authentication** | FileBrowser built-in auth | UNRAID API proxy headers |
| **UI Framework** | PHP + jQuery | Vue.js + TypeScript |
| **Service Management** | Manual scripts | NestJS lifecycle |
| **Configuration** | INI files | JSON configuration |
| **Installation** | .plg manifest | Module integration |

## Why the Change?

The [UNRAID API Issue #1599](https://github.com/unraid/api/issues/1599) specifically requires:

1. **NestJS Integration**: "Integration of an existing, mature file management service that the Unraid API can host"
2. **Proxy Authentication**: "Use proxy auth headers (X-Unraid-User, X-Unraid-Roles)"
3. **WebGUI Pattern**: "Create a WebGUI page for the file browser following the existing log viewer pattern"
4. **Subprocess Management**: "Start FileBrowser as subprocess with `--noauth` flag"

## Migration Steps

### For Plugin Users

If you installed the plugin version:

1. **Remove Plugin**:
   ```bash
   # In UNRAID Plugins tab
   # Click "Remove" next to File Manager plugin
   ```

2. **Wait for API Integration**:
   - The API integration will be included in future UNRAID API releases
   - No manual installation required

### For Developers

If you were working with the plugin code:

1. **Study New Architecture**:
   ```bash
   cd UNRAID_API_Integration/
   # Review the NestJS module structure
   ```

2. **Understand Proxy Pattern**:
   - Review `filemanager.service.ts` for subprocess management
   - Study `cookie-auth.guard.ts` for authentication bridging
   - Examine `api-proxy.middleware.ts` for request proxying

3. **Follow Vue.js Pattern**:
   - Compare `FileManager.vue` with existing UNRAID API pages
   - Note the iframe integration approach
   - Understand the authentication context passing

## Configuration Migration

### Old Plugin Config (`settings.ini`)
```ini
[filemanager]
enabled=yes
port=8080
log_level=info
```

### New API Config (`filemanager.json`)
```json
{
  "service": "filebrowser",
  "enabled": true,
  "port": 8080,
  "auth": {
    "method": "proxy",
    "header": "X-Unraid-User"
  },
  "roots": [
    {
      "name": "User Shares",
      "path": "/mnt/user",
      "writable": true
    }
  ]
}
```

## API Changes

### Old Plugin Endpoints
```
# Plugin had no API - only webGUI
GET /Settings/FileManager  # Settings page
```

### New API Endpoints
```
GET /filemanager/status           # Service status
GET /filemanager/health           # Health check
GET /filemanager/api/resources    # File operations (proxied)
WS  /filemanager/ws              # WebSocket updates
```

## Authentication Changes

### Old Plugin Authentication
- FileBrowser managed its own users
- Separate login required
- No integration with UNRAID users

### New API Authentication
- Uses UNRAID API session cookies
- No separate login required
- Inherits UNRAID user permissions
- Proxy headers bridge authentication

## UI Changes

### Old Plugin UI
- PHP-based settings page
- Separate FileBrowser interface
- Basic iframe embedding

### New API UI
- Vue.js component in UNRAID API
- Follows LogViewer pattern
- Integrated navigation
- Modern responsive design

## Backwards Compatibility

### ⚠️ **Not Backwards Compatible**

The new implementation is **not compatible** with the plugin version because:

1. **Different Architecture**: NestJS vs Plugin
2. **Different Authentication**: Proxy vs Built-in
3. **Different Storage**: API database vs Plugin files
4. **Different Configuration**: JSON vs INI

### Migration Path

Users will need to:
1. Remove old plugin
2. Wait for UNRAID API integration
3. Reconfigure virtual roots (if customized)
4. Update any automation scripts

## Benefits of New Approach

### ✅ **Advantages**

1. **Proper Integration**: Follows UNRAID API patterns
2. **Single Sign-On**: Uses UNRAID authentication
3. **Better Security**: Inherits UNRAID permissions
4. **Modern UI**: Vue.js with Tailwind CSS
5. **Real-time Updates**: WebSocket support
6. **Maintainable**: TypeScript + NestJS
7. **Extensible**: Can add new features easily
8. **Standards Compliant**: Matches bounty requirements

### 📦 **Plugin Version Archived**

The plugin version remains in `Plugins/FileManager/` for reference, but is:
- ❌ No longer maintained
- ❌ Not recommended for use
- ❌ Will not receive updates
- ❌ Does not meet bounty requirements

## Getting Started with New Version

### For Users
1. **Wait for Release**: The API integration will be included in UNRAID API
2. **Access via WebGUI**: Go to Tools → File Manager
3. **No Setup Required**: Uses your existing UNRAID login

### For Developers
1. **Study Implementation**: Review `UNRAID_API_Integration/`
2. **Understand Patterns**: Follow NestJS + Vue.js approach
3. **Contribute**: Help improve the API integration

## Questions?

- **Architecture Questions**: Review [UNRAID API Issue #1599](https://github.com/unraid/api/issues/1599)
- **Implementation Details**: Check `UNRAID_API_Integration/README.md`
- **Migration Help**: See troubleshooting in main README

---

## Summary

The File Manager has been **completely redesigned** to properly integrate with the UNRAID API as required by the bounty. This is a **breaking change** but provides a much better foundation for the future.