import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { spawn, ChildProcess } from 'child_process';
import { createProxyMiddleware } from 'http-proxy-middleware';
import type { Request, Response } from 'express';
import { TokenBridgeService } from './auth/token-bridge.service';
import type { ClientRequest } from 'http';
import httpProxy from 'http-proxy';
import fs from 'fs';
import fetch from 'node-fetch';
import { FileBrowserConfigService } from './filebrowser-config.service';

@Injectable()
export class FileManagerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(FileManagerService.name);
  private fileManagerProcess: ChildProcess | null = null;
  private fileManagerPort: number;
  private fileManagerUrl: string;
  // lifecycle diagnostics
  private lastStartTime: number | null = null;
  private lastStopTime: number | null = null;
  private lastError: string | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly tokenBridge: TokenBridgeService,
    private readonly fbConfig: FileBrowserConfigService,
  ) {
    this.fileManagerPort = Number(this.configService.get('FILEMANAGER_PORT') || 8080);
    this.fileManagerUrl = `http://127.0.0.1:${this.fileManagerPort}`;
  }

  async onModuleInit() {
    try {
      const started = await this.startFileBrowser();
      if (started) {
        await this.waitForService(15_000);
        this.logger.log(`File manager proxy ready at ${this.fileManagerUrl}`);
      } else {
        this.logger.warn('FileManager binary not started; expecting external sidecar or manual start');
      }
    } catch (err) {
      this.logger.error('Failed to start file manager', err as any);
    }
  }

  // Public start/stop helpers for admin control endpoints
  async startService() {
    if (this.fileManagerProcess) {
      this.logger.log('FileManager already running');
      return true;
    }
    return await this.startFileBrowser();
  }

  async stopService() {
    if (!this.fileManagerProcess) {
      this.logger.log('FileManager not running');
      return false;
    }
    try {
      this.fileManagerProcess.kill('SIGINT');
      await new Promise((res) => setTimeout(res, 2000));
      if (this.fileManagerProcess && !this.fileManagerProcess.killed) {
        this.fileManagerProcess.kill('SIGTERM');
        await new Promise((res) => setTimeout(res, 1000));
      }
      if (this.fileManagerProcess && !this.fileManagerProcess.killed) {
        this.fileManagerProcess.kill('SIGKILL');
      }
      this.fileManagerProcess = null;
      this.lastStopTime = Date.now();
      return true;
    } catch (err) {
      this.logger.error('Error stopping FileManager', err as any);
      this.lastError = String(err || 'unknown');
      return false;
    }
  }

  async onModuleDestroy() {
    if (this.fileManagerProcess) {
      this.logger.log('Stopping file manager process gracefully');
      try {
        this.fileManagerProcess.kill('SIGINT');
        // wait a bit for graceful shutdown
        await new Promise((res) => setTimeout(res, 2500));
        if (this.fileManagerProcess && !this.fileManagerProcess.killed) {
          this.logger.log('FileManager did not exit after SIGINT; sending SIGTERM');
          this.fileManagerProcess.kill('SIGTERM');
          await new Promise((res) => setTimeout(res, 1000));
        }
        if (this.fileManagerProcess && !this.fileManagerProcess.killed) {
          this.logger.warn('FileManager still running; sending SIGKILL');
          this.fileManagerProcess.kill('SIGKILL');
        }
      } catch (err) {
        this.logger.error('Error while stopping file manager', err as any);
      }
      this.fileManagerProcess = null;
    }
  }

  private async startFileBrowser(): Promise<boolean> {
    const binary = this.configService.get('FILEMANAGER_BINARY') || '/usr/local/bin/filebrowser';
    
    // Initialize database and configuration
    try {
      await this.fbConfig.initializeDatabase();
      
      const virtualRoots = this.configService.get('FILEMANAGER_VIRTUAL_ROOTS') || 
                          this.configService.get('virtualRoots') || 
                          [];
                          
      const configObj = this.fbConfig.buildConfig({ 
        port: this.fileManagerPort, 
        virtualRoots 
      });
      
      const cfgPath = await this.fbConfig.writeConfigToDisk(configObj);
      
      // Check if binary exists
      if (!fs.existsSync(binary)) {
        this.logger.warn(`FileBrowser binary not found at ${binary}`);
        this.lastError = `Binary not found: ${binary}`;
        return false;
      }

      this.logger.log(`Starting FileBrowser binary: ${binary} with config ${cfgPath}`);

      // Get optimized arguments for FileBrowser
      const args = this.fbConfig.getFileBrowserArgs(cfgPath);
      
      this.fileManagerProcess = spawn(binary, args, { 
        stdio: ['ignore', 'pipe', 'pipe'],
        env: {
          ...process.env,
          // Ensure FileBrowser uses correct locale
          LC_ALL: 'en_US.UTF-8',
          LANG: 'en_US.UTF-8',
        },
      });

      this.fileManagerProcess.stdout?.on('data', (d: Buffer) => {
        const output = d.toString().trim();
        if (output) {
          this.logger.debug(`filebrowser: ${output}`);
        }
      });
      
      this.fileManagerProcess.stderr?.on('data', (d: Buffer) => {
        const output = d.toString().trim();
        if (output) {
          this.logger.warn(`filebrowser-err: ${output}`);
        }
      });

      this.fileManagerProcess.on('exit', (code: number | null, signal: NodeJS.Signals | null) => {
        this.logger.warn(`FileBrowser exited code=${code} signal=${String(signal)}`);
        this.fileManagerProcess = null;
        this.lastStopTime = Date.now();
        if (code !== 0 && code !== null) {
          this.lastError = `Process exited with code ${code}`;
        }
      });

      this.fileManagerProcess.on('error', (err: Error) => {
        this.logger.error(`FileBrowser process error: ${err.message}`);
        this.lastError = `Process error: ${err.message}`;
        this.fileManagerProcess = null;
      });

      // Mark start time and clear previous error
      this.lastStartTime = Date.now();
      this.lastError = null;
      
      return true;
    } catch (err) {
      this.logger.error('Error while generating or writing FileBrowser config', err);
      this.lastError = String(err || 'unknown config error');
      return false;
    }
  }

  private async waitForService(timeout = 5000) {
    const probePath = this.fileManagerUrl.replace(/\/$/, '') + '/api/ping';
    const start = Date.now();
    while (Date.now() - start < timeout) {
      try {
        const resp = await fetch(probePath, { method: 'GET' });
        if (resp.ok) return true;
      } catch (err) {
        // ignore
      }
      await new Promise((res) => setTimeout(res, 500));
    }
    this.logger.warn('Timed out waiting for FileBrowser service readiness');
    return false;
  }

  // Create proxy middleware to be used by a controller or express adapter
  createApiProxy() {
    const self = this;
    return createProxyMiddleware({
      target: this.fileManagerUrl,
      changeOrigin: true,
      ws: true,
      pathRewrite: (path: string, req: Request) => path.replace(/^\/filemanager/, ''),
      onProxyReq: (proxyReq: ClientRequest, req: Request, res: Response) => {
        // Attach bridged user headers
        // tokenBridge expects cookies in req.headers
        const user = (req as any).user || this.tokenBridge.getUserFromRequest(req as any);
        if (user) {
          proxyReq.setHeader('X-Unraid-User', user.username);
          proxyReq.setHeader('X-Unraid-Roles', (user.roles || []).join(','));
        }
      },
      onProxyRes: (proxyRes: any, req: Request, res: Response) => {
        // Ensure cookies can flow
        proxyRes.headers['access-control-allow-credentials'] = 'true';
      },
      onError: (err: any, req: Request, res: Response) => {
        self.logger.error('Proxy error', err);
      },
    });
  }

  // Expose file manager URL for callers who need it (e.g. websocket upgrade handler)
  getFileManagerUrl() {
    return this.fileManagerUrl;
  }

  // Allow external code to retrieve a ws-capable proxy instance
  getWebsocketProxy() {
    const proxy = httpProxy.createProxyServer({ target: this.fileManagerUrl, ws: true });
    proxy.on('error', (err: any) => this.logger.error('WebSocket proxy error', err));
    return proxy;
  }

  // Allow external code to resolve user for a request via the token bridge
  async getUserForRequest(req: any) {
    return await this.tokenBridge.getUserFromRequest(req);
  }

  // Public status helper for admin endpoints
  async getStatus() {
    const running = !!this.fileManagerProcess;
    const pid = this.fileManagerProcess ? (this.fileManagerProcess.pid ?? null) : null;
    const url = this.fileManagerUrl;
    let healthy = false;
    try {
      const probe = `${url.replace(/\/$/, '')}/api/ping`;
      const resp = await fetch(probe, { method: 'GET', timeout: 1500 as any });
      healthy = resp && resp.ok;
    } catch (err) {
      // ignore - return healthy=false
    }
    return { running, pid, url, healthy, lastStartTime: this.lastStartTime, lastStopTime: this.lastStopTime, lastError: this.lastError };
  }
}
