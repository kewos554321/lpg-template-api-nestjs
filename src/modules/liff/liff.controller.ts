import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { join } from 'path';

@Controller('liff')
export class LiffController {
  @Get()
  serveLiffPage(@Res() res: Response) {
    res.sendFile(join(__dirname, '../../../public/liff-simple.html'));
  }
}
