import { Controller, Post, Body, UseGuards, Logger } from '@nestjs/common';
import { CookieAuthGuard } from './auth/cookie-auth.guard';
import { TokenBridgeService } from './auth/token-bridge.service';
import { FileManagerService } from './filemanager.service';
import { AdminGuard } from './auth/admin.guard';

@Controller('filemanager/admin')
@UseGuards(CookieAuthGuard, AdminGuard)
export class FileManagerAdminDiagnosticsController {
  private readonly logger = new Logger(FileManagerAdminDiagnosticsController.name);
  constructor(private readonly tokenBridge: TokenBridgeService, private readonly fileManagerService: FileManagerService) {}

  // Validate a session or API key payload. Body shape: { apiKey?: string, cookies?: { [k:string]: string } }
  @Post('validate')
  async validateSession(@Body() body: any) {
    try {
      const fakeReq: any = { headers: {}, cookies: {} };
      if (body?.apiKey) fakeReq.headers['x-api-key'] = body.apiKey;
      if (body?.cookies) fakeReq.cookies = body.cookies;

      const user = await this.tokenBridge.getUserFromRequest(fakeReq);
      return { ok: !!user, user };
    } catch (err) {
      this.logger.error('validateSession error', err as any);
      return { ok: false, error: String(err) };
    }
  }

  @Post('start')
  async startFileManager() {
    try {
      const started = await this.fileManagerService.startService();
      return { ok: !!started, started };
    } catch (err) {
      this.logger.error('startFileManager', err as any);
      return { ok: false, error: String(err) };
    }
  }

  @Post('stop')
  async stopFileManager() {
    try {
      const stopped = await this.fileManagerService.stopService();
      return { ok: !!stopped, stopped };
    } catch (err) {
      this.logger.error('stopFileManager', err as any);
      return { ok: false, error: String(err) };
    }
  }

  @Post('status')
  async status() {
    try {
      const status = await this.fileManagerService.getStatus();
      return { ok: true, status };
    } catch (err) {
      this.logger.error('status', err as any);
      return { ok: false, error: String(err) };
    }
  }
}
