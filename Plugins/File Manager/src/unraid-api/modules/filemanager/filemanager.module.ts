import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FileManagerService } from './filemanager.service';
import { FileManagerController } from './filemanager.controller';
import { TokenBridgeService } from './auth/token-bridge.service';
import { CookieAuthGuard } from './auth/cookie-auth.guard';
import { RateLimiterService } from './proxy/rate-limiter.service';
import { AuditService } from './proxy/audit.service';
import { PermissionService } from './proxy/permission.service';
import { FileManagerAdminController } from './admin.controller';
import { FileManagerAdminDiagnosticsController } from './admin-diagnostics.controller';
import { FileBrowserConfigService } from './filebrowser-config.service';
import { AdminGuard } from './auth/admin.guard';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [FileManagerController, FileManagerAdminController, FileManagerAdminDiagnosticsController],
  providers: [FileManagerService, TokenBridgeService, CookieAuthGuard, AdminGuard, RateLimiterService, AuditService, PermissionService, FileBrowserConfigService],
})
export class FileManagerModule {}
