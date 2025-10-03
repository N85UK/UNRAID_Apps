import { Module, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FileManagerService } from './filemanager.service';
import { FileManagerController } from './filemanager.controller';
import { CookieAuthGuard } from './auth/cookie-auth.guard';
import { TokenBridgeService } from './auth/token-bridge.service';
import { ApiProxyMiddleware } from './proxy/api-proxy.middleware';
import { WebSocketProxyService } from './proxy/websocket-proxy.service';

@Module({
  imports: [ConfigModule],
  controllers: [FileManagerController],
  providers: [
    FileManagerService,
    CookieAuthGuard,
    TokenBridgeService,
    ApiProxyMiddleware,
    WebSocketProxyService,
  ],
  exports: [FileManagerService],
})
export class FileManagerModule implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly fileManagerService: FileManagerService) {}

  async onModuleInit() {
    // Start FileBrowser service when module initializes
    await this.fileManagerService.startFileManager();
  }

  async onModuleDestroy() {
    // Stop FileBrowser service when module is destroyed
    await this.fileManagerService.stopFileManager();
  }
}