# UNRAID Schema Review & Recommendations

## 🔍 **Analysis Summary**

After reviewing the UNRAID Introspection Schema against your ExplorerX Plugin and Bounty Submission implementations, I've identified several areas for improvement to ensure proper alignment with the UNRAID API system.

## ✅ **What's Correct**

### ExplorerX Plugin
- ✅ Correctly designed as traditional UNRAID plugin
- ✅ Uses appropriate session-based authentication
- ✅ Follows UNRAID plugin architecture patterns
- ✅ Proper CSRF protection implementation

### Bounty Submission  
- ✅ NestJS module structure follows API patterns
- ✅ Service lifecycle management is correct
- ✅ Vue.js component follows LogViewer pattern

## ⚠️ **Critical Issues to Address**

### 1. **Permission System Misalignment**

**Issue**: Bounty Submission uses generic auth, but UNRAID API has sophisticated permission system.

**From Schema**:
```typescript
enum Resource {
  SHARE       # For user shares (/mnt/user/*)
  DISK        # For disk operations 
  ARRAY       # For array operations
  FLASH       # For flash drive access
  CONFIG      # For configuration
}

enum AuthAction {
  READ_ANY, READ_OWN, UPDATE_ANY, UPDATE_OWN,
  CREATE_ANY, CREATE_OWN, DELETE_ANY, DELETE_OWN
}
```

**Required Fix**: Update `CookieAuthGuard` to use proper permission decorators:

```typescript
// Add to filemanager.controller.ts
import { UsePermissions } from '@/decorators/permissions.decorator';

@Controller('filemanager')
export class FileManagerController {
  
  @Get('status')
  @UsePermissions({ resource: 'CONFIG', action: 'READ_ANY' })
  async getStatus() {
    return this.fileManagerService.getServiceStatus();
  }

  @All('api/resources')
  @UsePermissions({ resource: 'SHARE', action: 'READ_ANY' })
  async proxyFileOperations(@Req() req: Request, @Res() res: Response) {
    // Proxy with proper permission checks
  }
}
```

### 2. **Missing Share Integration**

**Issue**: Not leveraging existing Share queries from schema.

**Available from Schema**:
```graphql
type Query {
  shares: [Share!]!  # Get all user shares
}

type Share {
  id: PrefixedID!
  name: String
  free: BigInt
  used: BigInt  
  size: BigInt
  include: [String!]  # Included disks
  exclude: [String!]  # Excluded disks
  cache: Boolean
}
```

**Recommendation**: Integrate with existing share data:

```typescript
// In filemanager.service.ts
async getAvailableShares() {
  // Query existing UNRAID shares via GraphQL
  const shares = await this.graphqlClient.query(`
    query GetShares {
      shares {
        id
        name
        size
        free
        used
        cache
      }
    }
  `);
  
  return shares.data.shares;
}
```

### 3. **Disk Access Permissions**

**Issue**: File manager should respect disk-level permissions.

**From Schema**:
```typescript
type ArrayDisk {
  id: PrefixedID!
  name: String
  device: String
  status: ArrayDiskStatus
  type: ArrayDiskType!  # DATA, PARITY, FLASH, CACHE
}
```

**Required Fix**: Add disk-specific permission checks:

```typescript
// In filemanager.service.ts
async validateDiskAccess(path: string, user: any): Promise<boolean> {
  // Check if path is on a disk user has access to
  const diskInfo = await this.getDiskInfoForPath(path);
  
  if (diskInfo.type === 'PARITY') {
    return user.permissions.ARRAY?.includes('READ_ANY');
  }
  
  if (diskInfo.type === 'FLASH') {
    return user.permissions.FLASH?.includes('READ_ANY');
  }
  
  return user.permissions.SHARE?.includes('READ_ANY');
}
```

### 4. **API Key Integration Missing**

**Issue**: Should support API key authentication for programmatic access.

**From Schema**:
```typescript
type ApiKey {
  id: PrefixedID!
  key: String!
  name: String!
  roles: [Role!]!
  permissions: [Permission!]!
}
```

**Required Addition**: Add API key support to auth guard:

```typescript
// In cookie-auth.guard.ts
private extractUserFromRequest(request: Request): any {
  // Check for API key first
  const apiKey = request.headers['x-api-key'];
  if (apiKey) {
    return this.validateApiKey(apiKey);
  }
  
  // Fall back to session cookie
  const sessionCookie = request.cookies?.['unraid-session'];
  if (sessionCookie) {
    return this.validateSession(sessionCookie);
  }
  
  return null;
}
```

### 5. **Missing Notification Integration**

**Issue**: File operations should create notifications.

**From Schema**:
```typescript
type Mutation {
  createNotification(input: NotificationData!): Notification!
}

input NotificationData {
  title: String!
  subject: String! 
  description: String!
  importance: NotificationImportance!
}
```

**Recommendation**: Add notification support:

```typescript
// In filemanager.service.ts
async notifyFileOperation(operation: string, path: string, success: boolean) {
  await this.notificationService.createNotification({
    title: `File Operation: ${operation}`,
    subject: success ? 'Success' : 'Failed',
    description: `${operation} operation on ${path}`,
    importance: success ? 'INFO' : 'WARNING'
  });
}
```

## 🔧 **Required Updates**

### 1. Update Bounty Submission Controller

```typescript
// filemanager.controller.ts
import { UsePermissions } from '@/decorators/permissions.decorator';

@Controller('filemanager')
export class FileManagerController {
  
  @Get('status')
  @UsePermissions({ resource: 'CONFIG', action: 'READ_ANY' })
  async getStatus() {
    // Implementation
  }

  @All('api/resources*')
  @UsePermissions({ resource: 'SHARE', action: 'READ_ANY' })
  async proxyFileRead(@Req() req: Request, @Res() res: Response) {
    // Read operations
  }

  @Post('api/resources*')
  @UsePermissions({ resource: 'SHARE', action: 'CREATE_ANY' })
  async proxyFileCreate(@Req() req: Request, @Res() res: Response) {
    // Create operations
  }

  @Put('api/resources*')
  @UsePermissions({ resource: 'SHARE', action: 'UPDATE_ANY' })
  async proxyFileUpdate(@Req() req: Request, @Res() res: Response) {
    // Update operations
  }

  @Delete('api/resources*')
  @UsePermissions({ resource: 'SHARE', action: 'DELETE_ANY' })
  async proxyFileDelete(@Req() req: Request, @Res() res: Response) {
    // Delete operations
  }
}
```

### 2. Update Configuration to Match Schema

```json
// filemanager.json
{
  "service": "filebrowser",
  "enabled": true,
  "port": 8080,
  "auth": {
    "method": "proxy",
    "headers": {
      "user": "X-Unraid-User",
      "roles": "X-Unraid-Roles", 
      "permissions": "X-Unraid-Permissions"
    }
  },
  "roots": [
    {
      "name": "User Shares",
      "path": "/mnt/user",
      "writable": true,
      "requiredPermission": {
        "resource": "SHARE",
        "action": "READ_ANY"
      }
    },
    {
      "name": "Cache Drive", 
      "path": "/mnt/cache",
      "writable": true,
      "requiredPermission": {
        "resource": "DISK",
        "action": "READ_ANY"
      }
    },
    {
      "name": "Flash Drive",
      "path": "/boot",
      "writable": false,
      "requiredPermission": {
        "resource": "FLASH", 
        "action": "READ_ANY"
      }
    }
  ],
  "notifications": {
    "enabled": true,
    "events": ["upload", "delete", "move", "copy"]
  }
}
```

### 3. Add GraphQL Integration

```typescript
// In filemanager.module.ts
import { GraphQLModule } from '@nestjs/graphql';

@Module({
  imports: [
    GraphQLModule.forFeature([
      // Add resolvers for file manager specific queries
    ])
  ],
  // ...
})
export class FileManagerModule {}
```

## 📋 **Action Items**

### High Priority
1. ✅ Update permission system to use schema-defined Resources and AuthActions
2. ✅ Add API key authentication support
3. ✅ Integrate with existing Share queries
4. ✅ Add proper disk access validation

### Medium Priority  
1. ✅ Add notification integration for file operations
2. ✅ Update configuration format to match schema patterns
3. ✅ Add GraphQL resolvers for file manager queries

### Low Priority
1. ✅ Add metrics collection for file operations
2. ✅ Integrate with UPS monitoring for safe operations
3. ✅ Add backup/restore integration with RClone

## 🎯 **Validation Checklist**

- [ ] Controller uses `@UsePermissions` decorators correctly
- [ ] Auth guard validates against schema-defined permissions
- [ ] API key authentication works alongside session auth
- [ ] Share integration queries work correctly  
- [ ] Disk access permissions are enforced
- [ ] Notifications are created for file operations
- [ ] Configuration follows schema patterns
- [ ] GraphQL integration is functional

## 📚 **Next Steps**

1. **Update Bounty Submission** with permission system alignment
2. **Test Integration** with actual UNRAID API instance  
3. **Validate Permissions** against real user roles
4. **Document Changes** in README files
5. **Submit for Review** to UNRAID team

---

This review ensures your implementations will integrate seamlessly with the UNRAID API system and follow the established patterns from the GraphQL schema.