export const fileManagerDefaultConfig = {
  service: 'filebrowser',
  port: Number(process.env.FILEMANAGER_PORT || 8080),
  binary: process.env.FILEMANAGER_BINARY || '/usr/local/bin/filebrowser',
  database: process.env.FILEMANAGER_DB || '/boot/config/plugins/file-manager/filebrowser.db',
  configFile: process.env.FILEMANAGER_CONFIG || '/boot/config/plugins/file-manager/config/filebrowser.json',
  logFile: process.env.FILEMANAGER_LOG || '/var/log/file-manager/filebrowser.log',
  auth: {
    method: 'proxy',
    header: 'X-Unraid-User',
    rolesHeader: 'X-Unraid-Roles',
  },
  bridge: {
    // URL to Unraid API for authentication validation
    validateUrl: process.env.UNRAID_API_URL || process.env.FILEMANAGER_BRIDGE_VALIDATE_URL || 'http://localhost:80',
    cacheTtlSeconds: Number(process.env.FILEMANAGER_BRIDGE_CACHE_TTL || 300),
    timeout: Number(process.env.FILEMANAGER_BRIDGE_TIMEOUT || 10000),
  },
  security: {
    rateLimitRequests: Number(process.env.FILEMANAGER_RATE_LIMIT || 120),
    rateLimitWindow: Number(process.env.FILEMANAGER_RATE_WINDOW_MS || 60000),
    auditEnabled: process.env.FILEMANAGER_AUDIT_ENABLED !== 'false',
    allowedExtensions: process.env.FILEMANAGER_ALLOWED_EXTENSIONS?.split(',') || [],
    blockedExtensions: (process.env.FILEMANAGER_BLOCKED_EXTENSIONS || 'exe,bat,cmd,scr,vbs,ps1').split(','),
    maxFileSize: Number(process.env.FILEMANAGER_MAX_FILE_SIZE || 1024 * 1024 * 1024), // 1GB default
  },
  // Virtual roots provide a friendly id/name to map UI roots to actual filesystem paths
  virtualRoots: [
    { id: 'user-shares', name: 'User Shares', path: '/mnt/user', writable: true, description: 'UNRAID User Shares' },
    { id: 'cache', name: 'Cache Drive', path: '/mnt/cache', writable: true, description: 'Cache Drive Storage' },
    { id: 'disk1', name: 'Disk 1', path: '/mnt/disk1', writable: true, description: 'Array Disk 1' },
    { id: 'disk2', name: 'Disk 2', path: '/mnt/disk2', writable: true, description: 'Array Disk 2' },
    { id: 'disk3', name: 'Disk 3', path: '/mnt/disk3', writable: true, description: 'Array Disk 3' },
    { id: 'appdata', name: 'Appdata', path: '/mnt/user/appdata', writable: true, description: 'Application Data' },
    { id: 'domains', name: 'Domains', path: '/mnt/user/domains', writable: true, description: 'VM Storage' },
    { id: 'isos', name: 'ISOs', path: '/mnt/user/isos', writable: true, description: 'ISO Images' },
    { id: 'system', name: 'System', path: '/mnt/user/system', writable: true, description: 'System Files' },
    { id: 'downloads', name: 'Downloads', path: '/mnt/user/downloads', writable: true, description: 'Downloads' },
  ],
  roots: [
    { name: 'User Shares', path: '/mnt/user', writable: true, icon: 'fa-share-alt' },
    { name: 'Cache Drive', path: '/mnt/cache', writable: true, icon: 'fa-hdd-o' },
    { name: 'Array Disks', path: '/mnt/disk*', writable: true, icon: 'fa-server' },
    { name: 'Boot Drive', path: '/boot', writable: false, icon: 'fa-usb' },
    { name: 'Flash Drive Config', path: '/boot/config', writable: true, icon: 'fa-cog' },
    { name: 'Log Files', path: '/var/log', writable: false, icon: 'fa-file-text-o' },
    { name: 'Temporary Files', path: '/tmp', writable: true, icon: 'fa-clock-o' },
  ],
  ui: {
    title: 'UNRAID File Manager',
    branding: {
      name: 'UNRAID',
      disableExternal: false,
    },
    theme: process.env.FILEMANAGER_THEME || 'auto',
    locale: process.env.FILEMANAGER_LOCALE || 'en',
    dateFormat: process.env.FILEMANAGER_DATE_FORMAT || 'relative',
  },
};
