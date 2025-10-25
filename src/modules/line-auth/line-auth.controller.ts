import { Controller, Get, Post, Body, Query, Redirect } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { ControllerBase } from '@artifact/aurora-api-core';
import { LineAuthService } from './line-auth.service';
import { LineAuthResponseDto, LineUserProfileDto } from './dto/line-auth.dto';
import { plainToClass } from 'class-transformer';
import { LogDecorator } from 'src/common/decorators/log.decorator';

@LogDecorator('LineAuthController')
@ApiTags('LINE Auth')
@Controller('line-auth')
export class LineAuthController extends ControllerBase {
  constructor(private readonly lineAuthService: LineAuthService) {
    super();
  }


  @Post('login-with-invite')
  @ApiOperation({ summary: 'Login with LINE and invite code (Secure - Access Token Verification)' })
  @ApiResponse({ status: 200, description: 'Login successful', type: LineAuthResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid invite code or access token' })
  @ApiResponse({ status: 401, description: 'Access token verification failed' })
  async loginWithInvite(@Body() body: { 
    authenticationCode: string; 
    accessToken: string;
  }) {
    try {
      // 必須提供 authentication code
      if (!body.authenticationCode) {
        throw new Error('Authentication code 是必需的');
      }
      
      // 必須提供 access token
      if (!body.accessToken) {
        throw new Error('Access token 是必需的');
      }
      
      const result = await this.lineAuthService.loginWithAuthenticationCode(
        body.authenticationCode, 
        body.accessToken
      );

      this.logger.log(`[LINE] 登入成功 - 用戶: ${result.userProfile.displayName}, 新用戶: ${result.isNewUser}`);
      
      const lineAuthResponseDto = plainToClass(LineAuthResponseDto, {
        jwtToken: result.jwtToken,
        expireDate: result.expireDate,
        userProfile: plainToClass(LineUserProfileDto, result.userProfile, {
          excludeExtraneousValues: true,
        }),
        isNewUser: result.isNewUser,
      }, {
        excludeExtraneousValues: true,
      });

      return this.formatResponse(lineAuthResponseDto, 200);
    } catch (error) {
      this.logger.error(`[LINE] 登入失敗: ${error.message || error}`);
      
      // 根據錯誤類型返回適當的狀態碼
      if (error.message?.includes('Access token') || error.message?.includes('Unauthorized')) {
        return this.formatResponse(error.message || 'Access token 驗證失敗', 401);
      }
      
      return this.formatResponse(error.message || '認證碼登入失敗', 400);
    }
  }

  @Get('callback')
  @ApiOperation({ summary: 'LINE OAuth callback endpoint' })
  @ApiQuery({ name: 'code', required: true, description: 'Authorization code from LINE' })
  @ApiQuery({ name: 'state', required: false, description: 'State parameter' })
  @Redirect()
  async handleCallback(@Query('code') code: string, @Query('state') state?: string) {
    // 簡化版本：重定向到 LIFF 頁面
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const redirectUrl = `${frontendUrl}/liff?code=${code}&state=${state || ''}`;

    this.logger.log(`[LINE] handleCallback redirectUrl ${redirectUrl}`);
    
    return { url: redirectUrl };
  }

  @Get('debug/bindings')
  @ApiOperation({ summary: 'Get all bindings (debug endpoint)' })
  async getAllBindings() {
    const bindings = this.lineAuthService.getAllBindings();
    return this.formatResponse(bindings, 200);
  }

  @Get('debug/linebot-users')
  @ApiOperation({ summary: 'Get all linebot users (debug endpoint)' })
  async getAllLinebotUsers() {
    const users = this.lineAuthService.getAllLinebotUsers();
    return this.formatResponse(users, 200);
  }

  @Post('debug/clear')
  @ApiOperation({ summary: 'Clear all in-memory data (debug endpoint)' })
  async clearAllData() {
    this.lineAuthService.clearAllData();
    return this.formatResponse({ message: 'All data cleared' }, 200);
  }
}