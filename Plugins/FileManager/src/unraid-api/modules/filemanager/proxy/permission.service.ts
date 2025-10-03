import { Injectable, Logger } from '@nestjs/common';

export type FileAction = 'read' | 'list' | 'preview' | 'thumbnail' | 'write' | 'delete' | 'rename' | 'share' | 'archive' | 'copy' | 'move';

@Injectable()
export class PermissionService {
  private readonly logger = new Logger(PermissionService.name);
  private readonly roleMap: Record<string, FileAction[]> = {
    admin: ['read', 'write', 'delete', 'rename', 'share', 'archive'],
    connect: ['read', 'write'],
    guest: ['read'],
  };

  canPerform(roles: string[] | undefined, action: FileAction) {
    if (!roles || roles.length === 0) return false;
    for (const r of roles) {
      const mapped = this.roleMap[r];
      if (mapped && mapped.includes(action)) return true;
    }
    return false;
  }

  // Simple mapping from HTTP methods to actions
  methodToAction(method: string): FileAction {
    const m = method.toUpperCase();
    if (m === 'GET' || m === 'HEAD') return 'read';
    if (m === 'POST' || m === 'PUT' || m === 'PATCH') return 'write';
    if (m === 'DELETE') return 'delete';
    return 'read';
  }

  // New: map request URL to more granular actions
  requestToAction(method: string, url: string): FileAction {
    const path = (url || '').toLowerCase();
    if (path.includes('/thumbnail') || path.includes('/thumb')) return 'thumbnail';
    if (path.includes('/preview')) return 'preview';
    if (path.includes('/search') || path.includes('/find')) return 'list';
    if (path.includes('/archive') || path.includes('/zip')) return 'archive';
    if (path.includes('/copy')) return 'copy';
    if (path.includes('/move')) return 'move';
    if (path.includes('/share')) return 'share';
    return this.methodToAction(method);
  }
}
