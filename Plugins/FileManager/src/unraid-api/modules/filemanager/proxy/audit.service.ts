import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  logAction(user: { username: string } | null, action: string, targetPath: string, details?: any) {
    // For now log to console/host logging. Production should use structured audit logs (file or syslog)
    const entry = {
      timestamp: new Date().toISOString(),
      user: user?.username || 'anonymous',
      action,
      targetPath,
      details: details || null,
    };
    this.logger.log(JSON.stringify(entry));
  }
}
