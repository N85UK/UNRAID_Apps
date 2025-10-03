import { Injectable, CanActivate, ExecutionContext, Logger, ForbiddenException } from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  private readonly logger = new Logger(AdminGuard.name);

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const user = (req as any).user;
    if (!user) {
      this.logger.debug('AdminGuard: no user on request');
      throw new ForbiddenException('Forbidden');
    }
    const roles: string[] = user.roles || [];
    if (!roles.includes('admin')) {
      this.logger.debug('AdminGuard: user missing admin role');
      throw new ForbiddenException('Forbidden');
    }
    return true;
  }
}
