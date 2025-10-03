// Try to load reflect-metadata from nearby api node_modules first, otherwise fall back to package name
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('../api/node_modules/reflect-metadata');
} catch (e) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('reflect-metadata');
}

// NOTE: we defer registering ts-node until after trying to load compiled JS artifacts
// so that ts-node's require hooks do not interfere with normal Node resolution for compiled modules.

async function main() {
  try {
    // Prefer running against compiled JS in api/dist when present (avoids ts-node/ESM resolution quirks)
    let tmod: any;
    const path = require('path');
    const workspaceRoot = path.resolve(__dirname, '..', '..');
    try {
      const compiledPath = path.join(workspaceRoot, 'api', 'dist', 'auth', 'token-bridge.service.js');
      tmod = require(compiledPath);
      console.log('Loaded TokenBridgeService from api/dist JS:', compiledPath);
    } catch (err: any) {
      console.error('Failed to require compiled token-bridge from api/dist:', err && err.message);
      // Register ts-node so requiring TS files works during this script (only when needed)
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require('ts-node').register({ transpileOnly: true, compilerOptions: { experimentalDecorators: true, emitDecoratorMetadata: true } });
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      tmod = require(path.join(workspaceRoot, 'file-manager', 'src', 'unraid-api', 'modules', 'filemanager', 'token-bridge.service.ts'));
      console.log('Loaded TokenBridgeService from TS source via ts-node');
    }
    const TokenBridgeService = tmod.TokenBridgeService || tmod.TokenBridgeService;
    console.log('TokenBridgeService loaded:', !!TokenBridgeService);
    const fakeConfig: any = { get: (k: string) => null };
    const svc = new TokenBridgeService(fakeConfig);
    const user = await svc.getUserFromRequest({ headers: {} });
    console.log('getUserFromRequest returned:', user);

    // Require controller and inspect metadata
    let cmod: any;
    try {
      const compiledAdminPath = path.join(workspaceRoot, 'api', 'dist', 'admin-diagnostics.controller.js');
      cmod = require(compiledAdminPath);
      console.log('Loaded AdminDiag from api/dist JS:', compiledAdminPath);
    } catch (er: any) {
      // If we get here, ensure ts-node is registered (it may already be) and load TS source
      try { require('ts-node'); } catch (e) {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        require('ts-node').register({ transpileOnly: true, compilerOptions: { experimentalDecorators: true, emitDecoratorMetadata: true } });
      }
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      cmod = require(path.join(workspaceRoot, 'file-manager', 'src', 'unraid-api', 'modules', 'filemanager', 'admin-diagnostics.controller.ts'));
      console.log('Loaded AdminDiag from TS source via ts-node');
    }
    const AdminDiag = cmod.FileManagerAdminDiagnosticsController;
    console.log('AdminDiag ctor present:', !!AdminDiag);
    const paramTypes = Reflect.getMetadata('design:paramtypes', AdminDiag);
    console.log('AdminDiag design:paramtypes:', (paramTypes || []).map((t: any) => (t && t.name) || String(t)));

    // Try to instantiate controller with simple mocks for all constructor dependencies
    const fileManagerServiceMock = { startService: async () => true, stopService: async () => true, getStatus: async () => ({ running: false }) };
    const rateLimiterMock = { isAllowed: (_: string) => true };
    const auditMock = { log: (entry: any) => console.log('AUDIT:', entry) };
    const admin = new AdminDiag(svc, fileManagerServiceMock, rateLimiterMock, auditMock);
    const startRes = await admin.startFileManager({ user: { username: 'inspector' }, ip: '127.0.0.1' } as any);
    console.log('admin.startFileManager() ->', startRes);
  } catch (err) {
    console.error('INSPECT ERROR', err);
    process.exitCode = 2;
  }
}

main();
