import { Controller, All, Req, Res, UseGuards, Get } from '@nestjs/common';
import { Request, Response } from 'express';
import { FileManagerService } from './filemanager.service';
import { CookieAuthGuard } from './auth/cookie-auth.guard';

@Controller('filemanager')
@UseGuards(CookieAuthGuard) // Ensure user is authenticated via UNRAID API
export class FileManagerController {
  constructor(private readonly fileManagerService: FileManagerService) {}

  @Get('status')
  async getStatus() {
    return this.fileManagerService.getServiceStatus();
  }

  @Get('health')
  async healthCheck() {
    const status = await this.fileManagerService.getServiceStatus();
    return {
      status: status.running ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      service: 'filemanager'
    };
  }

  @All('*')
  async proxyRequest(@Req() req: Request, @Res() res: Response) {
    // Proxy all other requests to FileBrowser service
    const proxy = this.fileManagerService.createApiProxy();
    
    return new Promise<void>((resolve, reject) => {
      proxy(req, res, (err: any) => {
        if (err) {
          console.error('Proxy error:', err);
          if (!res.headersSent) {
            res.status(500).json({ 
              error: 'File Manager service unavailable', 
              details: err.message 
            });
          }
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}