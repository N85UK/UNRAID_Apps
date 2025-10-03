import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TokenBridgeService {
  private readonly logger = new Logger(TokenBridgeService.name);

  constructor(private readonly configService: ConfigService) {}

  /**
   * Bridge UNRAID API authentication tokens to FileBrowser
   * This service handles the conversion between UNRAID's auth system
   * and FileBrowser's proxy authentication headers
   */
  bridgeAuthentication(unraidUser: any): Record<string, string> {
    const headers: Record<string, string> = {};

    if (!unraidUser) {
      this.logger.warn('No UNRAID user provided for token bridge');
      return headers;
    }

    // Map UNRAID user to FileBrowser headers
    headers['X-Unraid-User'] = unraidUser.username || 'guest';
    headers['X-Unraid-Roles'] = (unraidUser.roles || []).join(',');
    headers['X-Unraid-Permissions'] = JSON.stringify(unraidUser.permissions || {});

    // Map UNRAID permissions to FileBrowser permissions
    const fbPermissions = this.mapUnraidToFileBrowserPermissions(unraidUser.permissions || {});
    headers['X-FileBrowser-Permissions'] = JSON.stringify(fbPermissions);

    this.logger.debug(`Bridged authentication for user: ${unraidUser.username}`);
    return headers;
  }

  /**
   * Map UNRAID permissions to FileBrowser permission structure
   */
  private mapUnraidToFileBrowserPermissions(unraidPermissions: Record<string, boolean>): Record<string, boolean> {
    return {
      admin: unraidPermissions['system.admin'] || false,
      execute: unraidPermissions['share.execute'] || false,
      create: unraidPermissions['share.write'] || false,
      rename: unraidPermissions['share.write'] || false,
      modify: unraidPermissions['share.write'] || false,
      delete: unraidPermissions['share.delete'] || false,
      share: unraidPermissions['share.read'] || false,
      download: unraidPermissions['share.read'] || false,
    };
  }

  /**
   * Validate that a user has the required permissions for file operations
   */
  validatePermissions(user: any, operation: string, path?: string): boolean {
    if (!user || !user.permissions) {
      return false;
    }

    const permissions = user.permissions;

    switch (operation) {
      case 'read':
        return permissions['share.read'] === true;
      case 'write':
        return permissions['share.write'] === true;
      case 'delete':
        return permissions['share.delete'] === true;
      case 'execute':
        return permissions['share.execute'] === true;
      case 'admin':
        return permissions['system.admin'] === true;
      default:
        return false;
    }
  }

  /**
   * Create a session token for FileBrowser based on UNRAID session
   */
  createFileBrowserSession(unraidUser: any): string {
    // This would create a JWT or similar token that FileBrowser can validate
    // For now, we'll use a simple base64 encoded user info
    const sessionData = {
      username: unraidUser.username,
      roles: unraidUser.roles,
      permissions: unraidUser.permissions,
      timestamp: Date.now()
    };

    return Buffer.from(JSON.stringify(sessionData)).toString('base64');
  }

  /**
   * Validate a FileBrowser session token
   */
  validateFileBrowserSession(token: string): any {
    try {
      const sessionData = JSON.parse(Buffer.from(token, 'base64').toString());
      
      // Check if token is not too old (24 hours)
      const tokenAge = Date.now() - sessionData.timestamp;
      if (tokenAge > 24 * 60 * 60 * 1000) {
        return null;
      }

      return sessionData;
    } catch (error) {
      this.logger.error(`Invalid FileBrowser session token: ${error.message}`);
      return null;
    }
  }
}