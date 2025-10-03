import { Injectable, CanActivate, ExecutionContext, Logger, UnauthorizedException } from '@nestjs/common';
import { TokenBridgeService } from './token-bridge.service';

@Injectable()
export class CookieAuthGuard implements CanActivate {
  private readonly logger = new Logger(CookieAuthGuard.name);
  constructor(private readonly tokenBridge: TokenBridgeService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    try {
      const user = await this.tokenBridge.getUserFromRequest(req);
      if (user) {
        (req as any).user = user;
        return true;
      }
      this.logger.debug('CookieAuthGuard: no user from token bridge');
      throw new UnauthorizedException('Unauthorized');
    } catch (err) {
      this.logger.debug('Auth guard error', err as any);
      throw new UnauthorizedException('Unauthorized');
    }
  }
}
