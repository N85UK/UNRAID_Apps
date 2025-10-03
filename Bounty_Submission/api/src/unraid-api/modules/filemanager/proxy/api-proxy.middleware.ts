import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { createProxyMiddleware, RequestHandler } from 'http-proxy-middleware';
import { TokenBridgeService } from '../auth/token-bridge.service';

@Injectable()
export class ApiProxyMiddleware implements NestMiddleware {
  private readonly logger = new Logger(ApiProxyMiddleware.name);
  private proxyMiddleware: RequestHandler;

  constructor(private readonly tokenBridge: TokenBridgeService) {
    this.proxyMiddleware = createProxyMiddleware({
      target: 'http://localhost:8080',
      changeOrigin: true,
      ws: true, // Enable WebSocket proxy
      logLevel: 'debug',
      
      pathRewrite: {
        '^/filemanager': '', // Remove /filemanager prefix when forwarding
      },
      
      // Add authentication headers
      onProxyReq: (proxyReq, req: any) => {
        const user = req.user;
        
        if (user) {
          // Bridge UNRAID authentication to FileBrowser
          const authHeaders = this.tokenBridge.bridgeAuthentication(user);
          
          Object.entries(authHeaders).forEach(([key, value]) => {
            proxyReq.setHeader(key, value);
          });
          
          // Forward original request info
          proxyReq.setHeader('X-Forwarded-For', req.ip);
          proxyReq.setHeader('X-Forwarded-Proto', req.protocol);
          proxyReq.setHeader('X-Forwarded-Host', req.get('host'));
        }
        
        this.logger.debug(`Proxying ${req.method} ${req.url} to FileBrowser`);
      },
      
      // Handle responses
      onProxyRes: (proxyRes, req, res) => {
        // Add CORS headers for API endpoints
        proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
        proxyRes.headers['Access-Control-Allow-Origin'] = req.headers.origin || '*';
        proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
        proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With';
        
        // Add security headers
        proxyRes.headers['X-Frame-Options'] = 'SAMEORIGIN';
        proxyRes.headers['X-Content-Type-Options'] = 'nosniff';
        
        this.logger.debug(`Response from FileBrowser: ${proxyRes.statusCode}`);
      },
      
      // Error handling
      onError: (err, req, res) => {
        this.logger.error(`Proxy error: ${err.message}`);
        
        if (!res.headersSent) {
          res.status(502).json({
            error: 'File Manager service unavailable',
            message: 'The file manager service is currently not responding.',
            timestamp: new Date().toISOString()
          });
        }
      }
    });
  }

  use(req: Request, res: Response, next: NextFunction) {
    // Use the configured proxy middleware
    this.proxyMiddleware(req, res, next);
  }
}