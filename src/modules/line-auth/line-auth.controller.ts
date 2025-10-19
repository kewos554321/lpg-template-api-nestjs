import { Controller, Get, Post, Body, Query, Redirect } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { ControllerBase } from '@artifact/aurora-api-core';
import { LineAuthService } from './line-auth.service';
import { LineLoginRequestDto, LineAuthResponseDto, LineLoginUrlDto, LineUserProfileDto, LiffUrlRequestDto, LiffUrlResponseDto } from './dto/line-auth.dto';
import { plainToClass } from 'class-transformer';

@ApiTags('LINE Auth')
@Controller('line-auth')
export class LineAuthController extends ControllerBase {
  constructor(private readonly lineAuthService: LineAuthService) {
    super();
  }

  @Get('login-url')
  @ApiOperation({ summary: 'Get LINE login URL' })
  @ApiResponse({ status: 200, description: 'LINE login URL generated successfully', type: LineLoginUrlDto })
  async getLoginUrl() {
    const result = this.lineAuthService.generateLoginUrl();
    const lineLoginUrlDto = plainToClass(LineLoginUrlDto, result, {
      excludeExtraneousValues: true,
    });
    return this.formatResponse(lineLoginUrlDto, 200);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login with LINE authorization code' })
  @ApiResponse({ status: 200, description: 'Login successful', type: LineAuthResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid authorization code' })
  async loginWithLine(@Body() loginRequest: LineLoginRequestDto) {
    try {
      const result = await this.lineAuthService.handleLineLogin(loginRequest.code);
      
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
      return this.formatResponse('LINE login failed', 400);
    }
  }

  @Post('login-with-invite')
  @ApiOperation({ summary: 'Login with LINE and invite code' })
  @ApiResponse({ status: 200, description: 'Login successful', type: LineAuthResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid invite code' })
  async loginWithInvite(@Body() body: { 
    lineUserId: string; 
    inviteCode: string; 
    idToken?: string; 
  }) {
    try {

      console.log(body, JSON.stringify(body));
      const result = await this.lineAuthService.loginWithInviteCode(
        body.lineUserId, 
        body.inviteCode, 
        body.idToken
      );

      console.log(result, JSON.stringify(result));
      
      
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
      console.error(error);
      return this.formatResponse(error.message || '邀請碼登入失敗', 400);
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
    
    return { url: redirectUrl };
  }
}