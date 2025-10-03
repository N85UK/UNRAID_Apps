import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { spawn, ChildProcess } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import { createProxyMiddleware } from 'http-proxy-middleware';

@Injectable()
export class FileManagerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(FileManagerService.name);
  private fileManagerProcess: ChildProcess;
  private fileManagerPort: number = 8080;
  private fileManagerUrl: string;
  private configPath: string;
  private binaryPath: string;

  constructor(private readonly configService: ConfigService) {
    this.fileManagerPort = this.configService.get<number>('FILEMANAGER_PORT', 8080);
    this.fileManagerUrl = `http://localhost:${this.fileManagerPort}`;
    this.configPath = '/boot/config/plugins/unraid-api/filemanager.json';
    this.binaryPath = '/usr/local/emhttp/plugins/unraid-api/filemanager/filebrowser';
  }

  async onModuleInit() {
    this.logger.log('Initializing File Manager service...');
    await this.downloadFileBrowserBinary();
    await this.createConfiguration();
    await this.startFileManager();
  }

  async onModuleDestroy() {
    this.logger.log('Shutting down File Manager service...');
    await this.stopFileManager();
  }

  async startFileManager(): Promise<void> {
    if (this.fileManagerProcess) {
      this.logger.warn('File Manager process already running');
      return;
    }

    // Ensure binary exists
    if (!fs.existsSync(this.binaryPath)) {
      throw new Error('FileBrowser binary not found. Run downloadFileBrowserBinary() first.');
    }

    // Start FileBrowser with proxy auth configuration
    this.fileManagerProcess = spawn(this.binaryPath, [
      '--config', this.configPath,
      '--noauth', // Disable built-in auth, use proxy auth
      '--port', this.fileManagerPort.toString(),
      '--address', '127.0.0.1', // Only listen on localhost
      '--baseurl', '/filemanager', // Serve under /filemanager path
    ]);

    this.fileManagerProcess.stdout?.on('data', (data) => {
      this.logger.debug(`FileBrowser stdout: ${data}`);
    });

    this.fileManagerProcess.stderr?.on('data', (data) => {
      this.logger.error(`FileBrowser stderr: ${data}`);
    });

    this.fileManagerProcess.on('exit', (code, signal) => {
      this.logger.warn(`FileBrowser process exited with code ${code}, signal ${signal}`);
      this.fileManagerProcess = null;
    });

    // Wait for service to be ready
    await this.waitForService();
    this.logger.log(`File Manager started successfully on port ${this.fileManagerPort}`);
  }

  async stopFileManager(): Promise<void> {
    if (this.fileManagerProcess) {
      this.logger.log('Stopping File Manager process...');
      this.fileManagerProcess.kill('SIGTERM');
      
      // Wait for graceful shutdown
      await new Promise<void>((resolve) => {
        this.fileManagerProcess.on('exit', () => {
          this.fileManagerProcess = null;
          resolve();
        });
        
        // Force kill after 5 seconds
        setTimeout(() => {
          if (this.fileManagerProcess) {
            this.fileManagerProcess.kill('SIGKILL');
            this.fileManagerProcess = null;
          }
          resolve();
        }, 5000);
      });
      
      this.logger.log('File Manager stopped');
    }
  }

  private async downloadFileBrowserBinary(): Promise<void> {
    if (fs.existsSync(this.binaryPath)) {
      this.logger.log('FileBrowser binary already exists');
      return;
    }

    this.logger.log('Downloading FileBrowser binary...');
    
    // Determine architecture
    const arch = process.arch;
    let fbArch: string;
    
    switch (arch) {
      case 'x64':
        fbArch = 'amd64';
        break;
      case 'arm64':
        fbArch = 'arm64';
        break;
      case 'arm':
        fbArch = 'armv7';
        break;
      default:
        throw new Error(`Unsupported architecture: ${arch}`);
    }

    const version = 'v2.44.0';
    const downloadUrl = `https://github.com/filebrowser/filebrowser/releases/download/${version}/linux-${fbArch}-filebrowser.tar.gz`;
    
    // Create directory if it doesn't exist
    const binaryDir = path.dirname(this.binaryPath);
    await fs.promises.mkdir(binaryDir, { recursive: true });

    // Download and extract
    const { exec } = require('child_process');
    const execAsync = promisify(exec);

    try {
      await execAsync(`curl -L "${downloadUrl}" | tar -xz -C "${binaryDir}" filebrowser`);
      await execAsync(`chmod +x "${this.binaryPath}"`);
      this.logger.log('FileBrowser binary downloaded successfully');
    } catch (error) {
      throw new Error(`Failed to download FileBrowser binary: ${error.message}`);
    }
  }

  private async createConfiguration(): Promise<void> {
    const config = {
      port: this.fileManagerPort,
      baseURL: '/filemanager',
      address: '127.0.0.1',
      log: 'stdout',
      database: '/boot/config/plugins/unraid-api/filebrowser.db',
      root: '/mnt/user',
      auth: {
        method: 'proxy',
        header: 'X-Unraid-User'
      },
      branding: {
        name: 'UNRAID File Manager',
        disableExternal: true
      },
      commands: [],
      shell: [],
      rules: []
    };

    // Ensure config directory exists
    const configDir = path.dirname(this.configPath);
    await fs.promises.mkdir(configDir, { recursive: true });

    // Write configuration
    await fs.promises.writeFile(this.configPath, JSON.stringify(config, null, 2));
    this.logger.log('FileBrowser configuration created');
  }

  private async waitForService(): Promise<void> {
    const maxAttempts = 30;
    const delay = 1000;

    for (let i = 0; i < maxAttempts; i++) {
      try {
        const response = await fetch(`${this.fileManagerUrl}/health`);
        if (response.ok) {
          return;
        }
      } catch (error) {
        // Service not ready yet
      }

      await new Promise(resolve => setTimeout(resolve, delay));
    }

    throw new Error('FileBrowser service failed to start within timeout');
  }

  createApiProxy() {
    return createProxyMiddleware({
      target: this.fileManagerUrl,
      changeOrigin: true,
      ws: true, // Enable WebSocket proxy
      pathRewrite: {
        '^/filemanager': '', // Remove /filemanager prefix
      },
      
      // Add authentication headers from UNRAID API
      onProxyReq: (proxyReq, req: any) => {
        // Extract user from UNRAID API session
        const user = req.user;
        
        if (user) {
          proxyReq.setHeader('X-Unraid-User', user.username);
          proxyReq.setHeader('X-Unraid-Roles', user.roles?.join(',') || '');
          proxyReq.setHeader('X-Unraid-Permissions', JSON.stringify(user.permissions || {}));
        }
        
        // Forward original IP
        proxyReq.setHeader('X-Forwarded-For', req.ip);
        proxyReq.setHeader('X-Forwarded-Proto', req.protocol);
      },
      
      // Transform responses if needed
      onProxyRes: (proxyRes, req, res) => {
        // Add CORS headers for API endpoints
        proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
        proxyRes.headers['Access-Control-Allow-Origin'] = req.headers.origin || '*';
      },
      
      // Error handling
      onError: (err, req, res) => {
        this.logger.error(`Proxy error: ${err.message}`);
        res.status(500).json({ 
          error: 'File Manager service unavailable',
          message: err.message 
        });
      }
    });
  }

  isRunning(): boolean {
    return this.fileManagerProcess !== null && !this.fileManagerProcess.killed;
  }

  getServiceUrl(): string {
    return this.fileManagerUrl;
  }

  async getServiceStatus() {
    return {
      running: this.isRunning(),
      port: this.fileManagerPort,
      url: this.fileManagerUrl,
      pid: this.fileManagerProcess?.pid,
      configPath: this.configPath,
      binaryPath: this.binaryPath
    };
  }
}