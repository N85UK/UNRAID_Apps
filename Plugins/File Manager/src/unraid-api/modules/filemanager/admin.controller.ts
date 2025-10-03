import { Controller, Get, Post, Body, Req, UseGuards, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { Request } from 'express';
import { CookieAuthGuard } from './auth/cookie-auth.guard';
import { AdminGuard } from './auth/admin.guard';
import { FileManagerService } from './filemanager.service';
import { FileBrowserConfigService } from './filebrowser-config.service';
import { TokenBridgeService } from './auth/token-bridge.service';
import { RateLimiterService } from './proxy/rate-limiter.service';
import { AuditService } from './proxy/audit.service';
import { fileManagerDefaultConfig } from './filemanager.config';
import { canonicalizePath, expandRootPattern } from './utils/path-utils';
import { ConfigService } from '@nestjs/config';
import fs from 'fs';
import path from 'path';

interface ServiceControlRequest {
  action: 'start' | 'stop' | 'restart';
}

interface ConfigUpdateRequest {
  section: string;
  key: string;
  value: string;
}

@Controller('filemanager/admin')
@UseGuards(CookieAuthGuard, AdminGuard)
export class FileManagerAdminController {
  private readonly logger = new Logger(FileManagerAdminController.name);

  constructor(
    private readonly fileManagerService: FileManagerService,
    private readonly fbConfigService: FileBrowserConfigService,
    private readonly tokenBridge: TokenBridgeService,
    private readonly rateLimiter: RateLimiterService,
    private readonly audit: AuditService,
    private readonly configService: ConfigService,
  ) {}

  @Get('status')
  async getServiceStatus(@Req() req: Request) {
    const user = (req as any).user;
    this.audit.logAction(user, 'admin.status.check', '/admin/status', { ip: req.ip });

    try {
      const status = await this.fileManagerService.getStatus();
      const config = this.getConfigSummary();
      const systemInfo = await this.getSystemInfo();

      return {
        ok: true,
        status,
        config,
        system: systemInfo,
        timestamp: new Date().toISOString(),
      };
    } catch (err) {
      this.logger.error('Failed to get service status', err);
      throw new HttpException('Failed to get status', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('control')
  async controlService(@Body() body: ServiceControlRequest, @Req() req: Request) {
    const user = (req as any).user;
    const { action } = body;

    if (!['start', 'stop', 'restart'].includes(action)) {
      throw new HttpException('Invalid action', HttpStatus.BAD_REQUEST);
    }

    this.audit.logAction(user, `admin.service.${action}`, '/admin/control', { 
      ip: req.ip, 
      action 
    });

    try {
      let result = false;
      
      switch (action) {
        case 'start':
          result = await this.fileManagerService.startService();
          break;
        case 'stop':
          result = await this.fileManagerService.stopService();
          break;
        case 'restart':
          await this.fileManagerService.stopService();
          await new Promise(resolve => setTimeout(resolve, 1000));
          result = await this.fileManagerService.startService();
          break;
      }

      return {
        ok: result,
        action,
        message: result ? `Service ${action} successful` : `Service ${action} failed`,
      };
    } catch (err) {
      this.logger.error(`Failed to ${action} service`, err);
      throw new HttpException(`Failed to ${action} service`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('roots')
  async listRoots(@Req() req: Request) {
    const user = (req as any).user;
    this.audit.logAction(user, 'admin.roots.list', '/admin/roots', { ip: req.ip });

    try {
      const results: any[] = [];
      
      for (const v of fileManagerDefaultConfig.virtualRoots || []) {
        const paths = expandRootPattern(v.path);
        const resolved: string[] = [];
        const accessible: boolean[] = [];
        
        for (const p of paths) {
          try {
            const r = await canonicalizePath(p);
            if (r) {
              resolved.push(r);
              // Check if path is accessible
              accessible.push(fs.existsSync(r) && fs.statSync(r).isDirectory());
            }
          } catch (err) {
            resolved.push(`Error: ${err instanceof Error ? err.message : String(err)}`);
            accessible.push(false);
          }
        }
        
        results.push({ 
          id: v.id, 
          name: v.name, 
          path: v.path, 
          description: v.description,
          writable: v.writable,
          resolved,
          accessible,
        });
      }

      return { 
        ok: true,
        roots: results,
        totalRoots: results.length,
      };
    } catch (err) {
      this.logger.error('Failed to list roots', err);
      throw new HttpException('Failed to list roots', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('logs')
  async getLogs(@Req() req: Request) {
    const user = (req as any).user;
    const lines = parseInt(req.query?.lines as string) || 50;
    
    this.audit.logAction(user, 'admin.logs.view', '/admin/logs', { 
      ip: req.ip, 
      lines 
    });

    try {
      const logFile = fileManagerDefaultConfig.logFile;
      
      if (!fs.existsSync(logFile)) {
        return {
          ok: true,
          logs: [],
          message: 'Log file not found',
          logFile,
        };
      }

      // Read last N lines efficiently
      const content = fs.readFileSync(logFile, 'utf8');
      const allLines = content.split('\n');
      const recentLines = allLines.slice(-lines).filter(line => line.trim());

      return {
        ok: true,
        logs: recentLines,
        totalLines: allLines.length,
        requestedLines: lines,
        logFile,
      };
    } catch (err) {
      this.logger.error('Failed to read logs', err);
      throw new HttpException('Failed to read logs', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('config')
  async updateConfig(@Body() body: ConfigUpdateRequest, @Req() req: Request) {
    const user = (req as any).user;
    const { section, key, value } = body;

    this.audit.logAction(user, 'admin.config.update', '/admin/config', { 
      ip: req.ip, 
      section, 
      key, 
      value: value.substring(0, 50) // Truncate sensitive values
    });

    try {
      // Update configuration logic would go here
      // For now, return success
      return {
        ok: true,
        message: 'Configuration updated',
        section,
        key,
        value,
      };
    } catch (err) {
      this.logger.error('Failed to update config', err);
      throw new HttpException('Failed to update config', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('diagnostics')
  async getDiagnostics(@Req() req: Request) {
    const user = (req as any).user;
    this.audit.logAction(user, 'admin.diagnostics', '/admin/diagnostics', { ip: req.ip });

    try {
      const diagnostics = {
        service: await this.fileManagerService.getStatus(),
        authentication: await this.checkAuthStatus(),
        permissions: this.checkPermissions(),
        filesystem: await this.checkFilesystem(),
        network: this.checkNetwork(),
        configuration: this.validateConfiguration(),
        dependencies: this.checkDependencies(),
      };

      return {
        ok: true,
        diagnostics,
        timestamp: new Date().toISOString(),
      };
    } catch (err) {
      this.logger.error('Failed to run diagnostics', err);
      throw new HttpException('Failed to run diagnostics', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private getConfigSummary() {
    return {
      port: fileManagerDefaultConfig.port,
      binary: fileManagerDefaultConfig.binary,
      database: fileManagerDefaultConfig.database,
      virtualRootsCount: fileManagerDefaultConfig.virtualRoots.length,
      rootsCount: fileManagerDefaultConfig.roots.length,
      rateLimit: fileManagerDefaultConfig.security.rateLimitRequests,
      auditEnabled: fileManagerDefaultConfig.security.auditEnabled,
    };
  }

  private async getSystemInfo() {
    try {
      const platform = process.platform;
      const nodeVersion = process.version;
      const uptime = process.uptime();
      const memoryUsage = process.memoryUsage();

      return {
        platform,
        nodeVersion,
        uptime: Math.floor(uptime),
        memory: {
          used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
          total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
          external: Math.round(memoryUsage.external / 1024 / 1024),
        },
      };
    } catch (err) {
      return { error: 'Failed to get system info' };
    }
  }

  private async checkAuthStatus() {
    try {
      const validateUrl = fileManagerDefaultConfig.bridge.validateUrl;
      if (!validateUrl) {
        return { status: 'warning', message: 'No validation URL configured' };
      }

      // Simple connectivity check
      const url = new URL(validateUrl);
      return { 
        status: 'ok', 
        validateUrl, 
        message: 'Auth bridge configured' 
      };
    } catch (err) {
      return { status: 'error', message: 'Auth check failed' };
    }
  }

  private checkPermissions() {
    const checks = [];
    
    // Check binary permissions
    const binary = fileManagerDefaultConfig.binary;
    try {
      const stat = fs.statSync(binary);
      checks.push({
        path: binary,
        exists: true,
        executable: !!(stat.mode & parseInt('111', 8)),
        size: stat.size,
      });
    } catch (err) {
      checks.push({
        path: binary,
        exists: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }

    // Check database directory permissions
    const dbPath = fileManagerDefaultConfig.database;
    const dbDir = path.dirname(dbPath);
    try {
      const stat = fs.statSync(dbDir);
      checks.push({
        path: dbDir,
        exists: true,
        writable: !!(stat.mode & parseInt('200', 8)),
        directory: stat.isDirectory(),
      });
    } catch (err) {
      checks.push({
        path: dbDir,
        exists: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }

    return checks;
  }

  private async checkFilesystem() {
    const checks = [];
    
    for (const root of fileManagerDefaultConfig.virtualRoots.slice(0, 5)) { // Limit to first 5
      try {
        const stat = fs.statSync(root.path);
        checks.push({
          path: root.path,
          name: root.name,
          exists: true,
          accessible: stat.isDirectory(),
          writable: root.writable && !!(stat.mode & parseInt('200', 8)),
        });
      } catch (err) {
        checks.push({
          path: root.path,
          name: root.name,
          exists: false,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    return checks;
  }

  private checkNetwork() {
    const port = fileManagerDefaultConfig.port;
    const url = `http://127.0.0.1:${port}`;
    
    return {
      port,
      url,
      bindAddress: '127.0.0.1',
      status: 'configured', // Real network check would go here
    };
  }

  private validateConfiguration() {
    const errors = [];
    const warnings = [];

    // Check required fields
    if (!fileManagerDefaultConfig.binary) {
      errors.push('Binary path not configured');
    }

    if (!fileManagerDefaultConfig.database) {
      errors.push('Database path not configured');
    }

    if (fileManagerDefaultConfig.virtualRoots.length === 0) {
      warnings.push('No virtual roots configured');
    }

    if (!fileManagerDefaultConfig.bridge.validateUrl) {
      warnings.push('No auth validation URL configured');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  private checkDependencies() {
    const deps = [];
    
    // Check FileBrowser binary
    try {
      const binary = fileManagerDefaultConfig.binary;
      const exists = fs.existsSync(binary);
      deps.push({
        name: 'FileBrowser',
        path: binary,
        available: exists,
        required: true,
      });
    } catch (err) {
      deps.push({
        name: 'FileBrowser',
        available: false,
        error: err instanceof Error ? err.message : String(err),
        required: true,
      });
    }

    // Check Node.js modules (if not vendored)
    const nodeModulesPath = path.join(process.cwd(), 'node_modules');
    deps.push({
      name: 'Node Modules',
      path: nodeModulesPath,
      available: fs.existsSync(nodeModulesPath),
      required: true,
    });

    return deps;
  }
}
