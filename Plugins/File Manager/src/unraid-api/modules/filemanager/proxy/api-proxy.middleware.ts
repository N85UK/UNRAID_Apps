import { createProxyMiddleware } from 'http-proxy-middleware';
import type { Request } from 'express';
import type { ClientRequest } from 'http';

export function createFileManagerProxy(targetUrl: string, tokenBridge: any) {
  return createProxyMiddleware({
    target: targetUrl,
    changeOrigin: true,
    ws: true,
    pathRewrite: (path: string) => path.replace(/^\/filemanager/, ''),
    onProxyReq: (proxyReq: ClientRequest, req: Request) => {
      const user = (req as any).user || tokenBridge.getUserFromRequest(req as any);
      if (user) {
        proxyReq.setHeader('X-Unraid-User', user.username);
        proxyReq.setHeader('X-Unraid-Roles', (user.roles || []).join(','));
      }
    },
  });
}
