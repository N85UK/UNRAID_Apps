import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import fs from 'fs';
import path from 'path';
import { fileManagerDefaultConfig } from './filemanager.config';

interface VirtualRoot {
  id?: string;
  name?: string;
  path: string;
  writable?: boolean;
  description?: string;
  icon?: string;
}

interface FileBrowserConfig {
  server: {
    port: number;
    address: string;
    log: string;
    enableThumbnails: boolean;
    enableExec: boolean;
    resizePreview: boolean;
  };
  database: {
    type: string;
    path: string;
  };
  auth: {
    method: string;
    header: string;
  };
  branding: {
    name: string;
    disableExternal: boolean;
    files: string;
    theme: string;
  };
  commands: Record<string, string[]>;
  shell: string[];
  rules: Array<{
    regex: boolean;
    allow: boolean;
    path: string;
  }>;
}

@Injectable()
export class FileBrowserConfigService {
  private readonly logger = new Logger(FileBrowserConfigService.name);

  constructor(private readonly configService: ConfigService) {}

  getConfigPath(): string {
    return this.configService.get('FILEMANAGER_CONFIG_PATH') || 
           fileManagerDefaultConfig.configFile;
  }

  getDatabasePath(): string {
    return this.configService.get('FILEMANAGER_DB') || 
           fileManagerDefaultConfig.database;
  }

  getLogPath(): string {
    return this.configService.get('FILEMANAGER_LOG') || 
           fileManagerDefaultConfig.logFile;
  }

  // Build a comprehensive FileBrowser-compatible config optimized for UNRAID
  buildConfig(opts: { 
    port?: number; 
    database?: string; 
    virtualRoots?: VirtualRoot[];
    logFile?: string;
  }): FileBrowserConfig {
    const port = opts.port || fileManagerDefaultConfig.port;
    const database = opts.database || this.getDatabasePath();
    const logFile = opts.logFile || this.getLogPath();
    const virtualRoots = opts.virtualRoots || fileManagerDefaultConfig.virtualRoots;

    // Ensure log directory exists
    const logDir = path.dirname(logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    const config: FileBrowserConfig = {
      server: {
        port,
        address: '127.0.0.1', // Bind to localhost only for security
        log: logFile,
        enableThumbnails: true,
        enableExec: false, // Disable exec for security
        resizePreview: true,
      },
      database: {
        type: 'bolt',
        path: database,
      },
      auth: {
        method: 'proxy',
        header: fileManagerDefaultConfig.auth.header,
      },
      branding: {
        name: fileManagerDefaultConfig.ui.title,
        disableExternal: fileManagerDefaultConfig.ui.branding.disableExternal,
        files: '/img/logo.svg',
        theme: fileManagerDefaultConfig.ui.theme,
      },
      commands: {
        before_save: [],
        after_save: [],
        before_publish: [],
        after_publish: [],
      },
      shell: ['/bin/bash'],
      rules: this.buildSecurityRules(virtualRoots),
    };

    return config;
  }

  private buildSecurityRules(virtualRoots: VirtualRoot[]): Array<{regex: boolean; allow: boolean; path: string}> {
    const rules: Array<{regex: boolean; allow: boolean; path: string}> = [];

    // Allow access to configured virtual roots
    virtualRoots.forEach(root => {
      if (root.path) {
        rules.push({
          regex: false,
          allow: true,
          path: root.path,
        });
      }
    });

    // Allow access to standard UNRAID paths
    const allowedPaths = [
      '/mnt/user',
      '/mnt/cache',
      '/mnt/disk*',
      '/boot/config',
      '/tmp',
    ];

    allowedPaths.forEach(allowedPath => {
      rules.push({
        regex: allowedPath.includes('*'),
        allow: true,
        path: allowedPath,
      });
    });

    // Block sensitive system paths
    const blockedPaths = [
      '/etc',
      '/proc',
      '/sys',
      '/dev',
      '/usr/bin',
      '/usr/sbin',
      '/sbin',
      '/bin',
      '/root',
      '/var/lib',
      '/boot/syslinux',
      '/boot/efi',
    ];

    blockedPaths.forEach(blockedPath => {
      rules.push({
        regex: false,
        allow: false,
        path: blockedPath,
      });
    });

    return rules;
  }

  async writeConfigToDisk(configObj: FileBrowserConfig): Promise<string> {
    const cfgPath = this.getConfigPath();
    try {
      const dir = path.dirname(cfgPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Ensure database directory exists
      const dbPath = configObj.database.path;
      const dbDir = path.dirname(dbPath);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      await fs.promises.writeFile(cfgPath, JSON.stringify(configObj, null, 2), { 
        encoding: 'utf8' 
      });
      
      this.logger.log(`Wrote FileBrowser config to ${cfgPath}`);
      
      // Set proper permissions for UNRAID environment
      try {
        fs.chmodSync(cfgPath, 0o644);
        fs.chownSync(cfgPath, 0, 0); // root:root
      } catch (e) {
        // Ignore permission setting errors in non-UNRAID environments
        this.logger.debug('Could not set file permissions (non-UNRAID environment?)');
      }
      
      return cfgPath;
    } catch (err) {
      this.logger.error('Failed to write FileBrowser config', err);
      throw err;
    }
  }

  async initializeDatabase(): Promise<void> {
    const dbPath = this.getDatabasePath();
    const dbDir = path.dirname(dbPath);
    
    try {
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      // Set proper permissions for database directory
      try {
        fs.chmodSync(dbDir, 0o755);
        fs.chownSync(dbDir, 0, 0); // root:root
      } catch (e) {
        this.logger.debug('Could not set directory permissions (non-UNRAID environment?)');
      }

      this.logger.log(`Database directory ready: ${dbDir}`);
    } catch (err) {
      this.logger.error('Failed to initialize database directory', err);
      throw err;
    }
  }

  getFileBrowserArgs(configPath: string): string[] {
    const dbPath = this.getDatabasePath();
    const port = fileManagerDefaultConfig.port;

    return [
      '--config', configPath,
      '--database', dbPath,
      '--port', port.toString(),
      '--address', '127.0.0.1',
      '--no-auth', // We handle auth via proxy
      '--disable-exec', // Security: disable command execution
      '--disable-preview-resize', 'false',
      '--disable-thumbnails', 'false',
    ];
  }
}
