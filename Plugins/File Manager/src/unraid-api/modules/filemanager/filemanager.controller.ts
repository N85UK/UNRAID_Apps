import { Controller, All, Req, Res, UseGuards, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { FileManagerService } from './filemanager.service';
import { ConfigService } from '@nestjs/config';
import { CookieAuthGuard } from './auth/cookie-auth.guard';
import { isPathTraversal, sanitizeIncomingPath, isAllowedRealPath, resolveRelativeToAllowedRealPath, resolveRelativeToVirtualRoot, canonicalizePath } from './utils/path-utils';
import { fileManagerDefaultConfig } from './filemanager.config';
import { RateLimiterService } from './proxy/rate-limiter.service';
import { AuditService } from './proxy/audit.service';
import { PermissionService } from './proxy/permission.service';

@Controller('filemanager')
@UseGuards(CookieAuthGuard)
export class FileManagerController {
  private readonly logger = new Logger(FileManagerController.name);
  constructor(
    private readonly fileManagerService: FileManagerService,
    private readonly rateLimiter: RateLimiterService,
    private readonly audit: AuditService,
    private readonly permission: PermissionService,
    private readonly configService: ConfigService,
  ) {}

  @All('*')
  async proxyRequest(@Req() req: Request, @Res() res: Response) {
    // Determine the requested target path. Support query param 'path' used by many UIs.
    const queryPath = (req as any).query?.path as string | undefined;
    const rawPath = queryPath || req.url || '';
    const clean = sanitizeIncomingPath(rawPath);

    if (isPathTraversal(clean)) {
      this.logger.warn(`Rejected traversal attempt: ${clean}`);
      return res.status(400).json({ error: 'Invalid path' });
    }

    // Determine the configured virtualRoots (env override supported)
    let virtualRoots = this.configService.get('FILEMANAGER_VIRTUAL_ROOTS') as any;
    if (!virtualRoots) {
      const jr = this.configService.get('FILEMANAGER_VIRTUAL_ROOTS_JSON') as string | undefined;
      if (jr) {
        try { virtualRoots = JSON.parse(jr); } catch (e) { virtualRoots = null; }
      }
    }
    if (!virtualRoots) virtualRoots = fileManagerDefaultConfig.virtualRoots || [];

    // If the request contains a virtual root selection, resolve against that
    const rootParam = (req as any).query?.root as string | undefined;
    let resolvedRealPath: string | null = null;
    if (rootParam) {
      // Resolve specifically under the virtual root
      resolvedRealPath = await resolveRelativeToVirtualRoot(rootParam, clean, virtualRoots || []);
      if (!resolvedRealPath) {
        this.logger.warn(`Could not resolve relative path to virtual root '${rootParam}': ${clean}`);
        this.audit.logAction((req as any).user, 'proxy.forbidden', clean, { ip: req.ip, root: rootParam });
        return res.status(403).json({ error: 'Forbidden' });
      }
    } else if (!clean.startsWith('/')) {
      // No root param: resolve against any configured roots
      resolvedRealPath = await resolveRelativeToAllowedRealPath(clean, fileManagerDefaultConfig.roots);
      if (!resolvedRealPath) {
        this.logger.warn(`Could not resolve relative path to allowed root: ${clean}`);
        this.audit.logAction((req as any).user, 'proxy.forbidden', clean, { ip: req.ip });
        return res.status(403).json({ error: 'Forbidden' });
      }
    } else {
      // For absolute paths, validate canonical real-path belongs to a root
      const allowed = await isAllowedRealPath(clean, fileManagerDefaultConfig.roots);
      if (!allowed) {
        this.logger.warn(`Rejected path outside allowed roots: ${clean}`);
        this.audit.logAction((req as any).user, 'proxy.forbidden', clean, { ip: req.ip });
        return res.status(403).json({ error: 'Forbidden' });
      }
      resolvedRealPath = await canonicalizePath(clean);
    }

    const targetForAudit = resolvedRealPath || clean;

    const user = (req as any).user;

    // Permission enforcement: map request to a granular action (preview, thumbnail, archive, copy, move, etc.)
    const action = this.permission.requestToAction(req.method, (req as any).url);
    if (!this.permission.canPerform(user?.roles, action)) {
      this.audit.logAction(user, 'proxy.unauthorized', targetForAudit, { method: req.method, ip: req.ip });
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // Rate limit per user
    const rateKey = user?.username || req.ip;
    if (!this.rateLimiter.isAllowed(rateKey)) {
      this.audit.logAction(user, 'proxy.rate_limited', targetForAudit, { ip: req.ip });
      return res.status(429).json({ error: 'Too many requests' });
    }

    this.audit.logAction(user, 'proxy.request', targetForAudit, { method: req.method, ip: req.ip });
    this.logger.log(`Proxying ${req.method} ${targetForAudit} for user=${user?.username || 'anonymous'}`);

    // Rewrite the proxied request path to the resolved real path if we resolved one
    if (resolvedRealPath) {
      // Attach helpful headers for the backend file manager
      (req as any).headers = (req as any).headers || {};
      (req as any).headers['x-unraid-path'] = resolvedRealPath;
      if (rootParam) (req as any).headers['x-unraid-root'] = rootParam;
      // Overwrite req.url so the proxied FileBrowser sees the correct path
      (req as any).url = resolvedRealPath;
    }

    const proxy = this.fileManagerService.createApiProxy();
    proxy(req as any, res as any, (err: any) => {
      if (err) {
        this.audit.logAction(user, 'proxy.error', targetForAudit, { error: err?.message || err });
        res.status(500).json({ error: 'Proxy error', details: err?.message || err });
      }
    });
  }
}
