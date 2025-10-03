# UNRAID API File Manager Integration

## ⚠️ **IMPORTANT: Architecture Correction**

After reviewing [UNRAID API Issue #1599](https://github.com/unraid/api/issues/1599), this repository has been restructured to provide the **correct implementation** for the File Manager bounty requirement.

### **Previous Implementation (INCORRECT)**
- ❌ Traditional UNRAID plugin with .plg manifest
- ❌ Standalone FileBrowser service with its own authentication
- ❌ PHP-based webGUI integration
- ❌ Manual service management scripts

### **Current Implementation (CORRECT)**
- ✅ NestJS module integrated into UNRAID API
- ✅ Proxy-based authentication through UNRAID API headers
- ✅ Vue.js WebGUI page following LogViewer pattern
- ✅ Service lifecycle managed by NestJS
- ✅ JSON configuration files matching UNRAID API patterns

## Architecture Overview

This implementation follows the exact requirements from the UNRAID API bounty:

### Integration Strategy
- **FileBrowser as Sidecar**: Run FileBrowser as a subprocess with `--noauth` flag
- **Proxy Authentication**: Use proxy auth headers (X-Unraid-User, X-Unraid-Roles)
- **Route Proxying**: Proxy all `/filemanager/*` routes through NestJS
- **Session Bridge**: Bridge UNRAID API session cookies to FileBrowser

### File Structure

```
UNRAID_API_Integration/
├── api/src/unraid-api/modules/filemanager/
│   ├── filemanager.module.ts          # Main NestJS module
│   ├── filemanager.service.ts         # Service orchestration & binary management
│   ├── filemanager.controller.ts      # HTTP proxy controller
│   ├── auth/
│   │   ├── cookie-auth.guard.ts       # UNRAID session validation
│   │   └── token-bridge.service.ts    # Auth token bridging
│   └── proxy/
│       ├── api-proxy.middleware.ts    # HTTP proxy middleware
│       └── websocket-proxy.service.ts # WebSocket proxy for real-time updates
├── web/pages/
│   └── FileManager.vue                # Vue.js page following LogViewer pattern
└── api/dev/configs/
    └── filemanager.json               # Configuration following UNRAID API pattern
```

## Key Features

### Authentication Integration
- **Cookie Bridge**: Validates UNRAID API session cookies
- **Header Mapping**: Maps UNRAID user/roles to FileBrowser headers
- **Permission Bridge**: Converts UNRAID permissions to FileBrowser permissions
- **No Dual Auth**: FileBrowser runs with `--noauth`, all auth through UNRAID API

### Service Management
- **Lifecycle Integration**: Starts/stops with UNRAID API NestJS application
- **Binary Management**: Downloads FileBrowser binary during module initialization
- **Health Monitoring**: Provides health check endpoints
- **Graceful Shutdown**: Properly terminates FileBrowser on module destroy

### WebGUI Integration
- **Vue.js Component**: FileManager.vue following LogViewer.vue pattern
- **iframe Integration**: Secure iframe with authentication context passing
- **Responsive Design**: Tailwind CSS styling matching UNRAID design
- **Real-time Updates**: WebSocket proxy for live file system changes

### Virtual Root Configuration
- **User Shares**: `/mnt/user` (full access)
- **Cache Drive**: `/mnt/cache` (full access)
- **Array Disks**: `/mnt/disk*` (pattern matching)
- **Docker Appdata**: `/mnt/user/appdata` (container configs)
- **System Access**: `/boot`, `/mnt/disks` (admin only)

## Installation for UNRAID API

### 1. Module Integration

Add to the main UNRAID API module:

```typescript
// In api/src/unraid-api/unraid-api.module.ts
import { FileManagerModule } from './modules/filemanager/filemanager.module';

@Module({
  imports: [
    // ... other modules
    FileManagerModule,
  ],
})
export class UnraidApiModule {}
```

### 2. Navigation Integration

Add to navigation:

```typescript
// In web/composables/use-navigation.ts
{
  label: 'File Manager',
  icon: 'folder-open',
  to: '/file-manager',
  permission: 'share.read',
}
```

### 3. Routing

Add route:

```typescript
// In web/router/index.ts
{
  path: '/file-manager',
  name: 'FileManager',
  component: () => import('@/pages/FileManager.vue'),
  meta: { requiresAuth: true }
}
```

### 4. Environment Configuration

```bash
# .env
FILEMANAGER_ENABLED=true
FILEMANAGER_PORT=8080
FILEMANAGER_BINARY_URL=https://github.com/filebrowser/filebrowser/releases/download/v2.44.0
```

## API Endpoints

### Service Management
- `GET /filemanager/status` - Service status and configuration
- `GET /filemanager/health` - Health check endpoint

### File Operations (Proxied to FileBrowser)
- `GET /filemanager/api/resources` - Browse files/folders
- `POST /filemanager/api/resources` - Create files/folders
- `PUT /filemanager/api/resources` - Update/move files
- `DELETE /filemanager/api/resources` - Delete files/folders
- `POST /filemanager/api/raw` - Upload files
- `GET /filemanager/api/raw` - Download files

### WebSocket (Real-time Updates)
- `WS /filemanager/ws` - Real-time file system events

## Security Features

### Path Validation
- Directory traversal prevention
- Scope limitation to configured virtual roots
- Symlink attack protection

### Permission Integration
- UNRAID user permission inheritance
- Role-based access control
- Path-specific permission enforcement

### Rate Limiting
- API request rate limiting
- Upload/download throttling
- Concurrent operation limits

## Development

### Prerequisites
- Node.js 18+
- UNRAID API development environment
- FileBrowser binary (auto-downloaded)

### Local Development

```bash
# Install dependencies
npm install

# Start UNRAID API with FileManager module
npm run start:dev

# Access File Manager
open http://localhost:3000/file-manager
```

### Testing

```bash
# Unit tests
npm run test

# Integration tests
npm run test:e2e

# Test file operations
curl -X GET http://localhost:3000/filemanager/api/resources
```

## Configuration

The `filemanager.json` configuration file provides comprehensive control:

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

## Troubleshooting

### Common Issues

1. **Service Won't Start**
   - Check FileBrowser binary exists: `/usr/local/emhttp/plugins/unraid-api/filemanager/filebrowser`
   - Verify port 8080 is available
   - Check logs: `/var/log/unraid-api/filemanager.log`

2. **Authentication Failures**
   - Verify UNRAID API session is valid
   - Check cookie-auth.guard implementation
   - Ensure proper header mapping in token-bridge.service

3. **File Access Denied**
   - Verify UNRAID user permissions
   - Check virtual root configuration
   - Ensure proper path mapping

## Migration from Plugin Version

If you previously installed the plugin version:

1. **Remove Old Plugin**:
   ```bash
   # Remove plugin files
   rm -rf /usr/local/emhttp/plugins/file-manager
   rm -rf /boot/config/plugins/file-manager
   ```

2. **Install API Integration**:
   - Follow installation steps above
   - Configuration will be migrated automatically

## Contributing

This implementation is designed for the UNRAID API bounty. Contributions should:

1. Follow NestJS patterns and conventions
2. Maintain compatibility with UNRAID API authentication
3. Ensure proper TypeScript typing
4. Include comprehensive tests
5. Update documentation

## License

This project follows the same license as the UNRAID API project.

## Support

For issues related to:
- **UNRAID API Integration**: Create issue in UNRAID API repository
- **FileBrowser Functionality**: Refer to [FileBrowser documentation](https://filebrowser.org)
- **Implementation Questions**: Reference [UNRAID API Issue #1599](https://github.com/unraid/api/issues/1599)

---

## ✅ **Ready for UNRAID API Integration**

This implementation provides everything required for the UNRAID API File Manager bounty:

1. ✅ **FileBrowser Integration** - Runs as NestJS subprocess
2. ✅ **Authentication Bridge** - UNRAID session → FileBrowser headers
3. ✅ **HTTP/WebSocket Proxy** - All requests proxied through NestJS
4. ✅ **Vue.js WebGUI** - Following LogViewer pattern
5. ✅ **Service Lifecycle** - Managed by NestJS module system
6. ✅ **Virtual Roots** - UNRAID path configuration
7. ✅ **Security Integration** - Inherits UNRAID permissions
8. ✅ **Navigation Menu** - Tools section integration
9. ✅ **Configuration** - JSON config following API patterns
10. ✅ **Documentation** - Complete implementation guide