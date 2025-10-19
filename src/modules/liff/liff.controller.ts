import { Controller, Get, Res, Query } from '@nestjs/common';
import type { Response } from 'express';
import { join } from 'path';

@Controller('liff')
export class LiffController {
  @Get()
  serveLiffPage(@Res() res: Response, @Query('inviteCode') inviteCode?: string) {
    // 輸出邀請碼到控制台
    if (inviteCode) {
      console.log(`[LIFF] 收到邀請碼: ${inviteCode}`);
    } else {
      console.log('[LIFF] 沒有收到邀請碼參數');
    }
    
    res.sendFile(join(__dirname, '../../../public/liff-demo.html'));
  }
}
