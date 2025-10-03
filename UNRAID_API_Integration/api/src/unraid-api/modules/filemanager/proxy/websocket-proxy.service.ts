import { Injectable, Logger } from '@nestjs/common';
import { Server } from 'http';
import { createProxyMiddleware } from 'http-proxy-middleware';

@Injectable()
export class WebSocketProxyService {
  private readonly logger = new Logger(WebSocketProxyService.name);

  /**
   * Set up WebSocket proxy for real-time file system updates
   */
  setupWebSocketProxy(server: Server) {
    const wsProxy = createProxyMiddleware('/filemanager/ws', {
      target: 'ws://localhost:8080',
      ws: true,
      changeOrigin: true,
      
      onProxyReqWs: (proxyReq, req, socket) => {
        this.logger.debug('WebSocket connection proxied to FileBrowser');
      },
      
      onError: (err, req, res) => {
        this.logger.error(`WebSocket proxy error: ${err.message}`);
      }
    });

    // Attach WebSocket proxy to server
    server.on('upgrade', wsProxy.upgrade);
    
    this.logger.log('WebSocket proxy configured for FileBrowser real-time updates');
  }
}