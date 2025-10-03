import { Controller, Get, Req, Logger } from '@nestjs/common';
import { Request } from 'express';

@Controller('filemanager')
export class FileManagerUserController {
  private readonly logger = new Logger(FileManagerUserController.name);

  @Get('me')
  async me(@Req() req: Request) {
    const user = (req as any).user || null;
    return { ok: !!user, user };
  }
}
