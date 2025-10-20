import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { tokenHelper, ServiceBase } from '@artifact/lpg-api-service';
import { LineAuthConfig, LineTokenResponse, LineUserProfile, LineAuthResult } from './interfaces/line-auth.interface';
import { LineUserProfileDto } from './dto/line-auth.dto';
import { plainToClass } from 'class-transformer';
import * as crypto from 'crypto';

@Injectable()
export class LineAuthService extends ServiceBase {
  private readonly lineConfig: LineAuthConfig;

  constructor(private readonly configService: ConfigService) {
    super();
    
    this.lineConfig = {
      channelId: this.configService.get<string>('LINE_CHANNEL_ID') || '',
      channelSecret: this.configService.get<string>('LINE_CHANNEL_SECRET') || '',
      redirectUri: this.configService.get<string>('LINE_REDIRECT_URI') || '',
      scope: 'profile openid email',
      prompt: this.configService.get<string>('LINE_PROMPT'),
      botPrompt: this.configService.get<string>('LINE_BOT_PROMPT'),
    };
  }

  /**
   * 生成 LINE 登入 URL
   */
  public generateLoginUrl(): { loginUrl: string; state: string } {
    const state = crypto.randomBytes(32).toString('hex');
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.lineConfig.channelId,
      redirect_uri: this.lineConfig.redirectUri,
      state,
      scope: this.lineConfig.scope,
    });

    // Optional: force consent screen each time
    if (this.lineConfig.prompt) {
      params.set('prompt', this.lineConfig.prompt);
    }
    // Optional: suggest adding the LINE Official Account
    if (this.lineConfig.botPrompt) {
      params.set('bot_prompt', this.lineConfig.botPrompt);
    }

    const loginUrl = `https://access.line.me/oauth2/v2.1/authorize?${params.toString()}`;
    
    return { loginUrl, state };
  }

  /**
   * 使用授權碼交換存取權杖
   */
  public async exchangeCodeForToken(code: string): Promise<LineTokenResponse> {
    try {
      const response = await axios.post('https://api.line.me/oauth2/v2.1/token', {
        grant_type: 'authorization_code',
        code,
        redirect_uri: this.lineConfig.redirectUri,
        client_id: this.lineConfig.channelId,
        client_secret: this.lineConfig.channelSecret,
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      return response.data;
    } catch (error) {
      throw new UnauthorizedException('Failed to exchange code for token');
    }
  }

  /**
   * 使用存取權杖獲取用戶資料
   */
  public async getUserProfile(accessToken: string): Promise<LineUserProfile> {
    try {
      const response = await axios.get('https://api.line.me/v2/profile', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      return {
        userId: response.data.userId,
        displayName: response.data.displayName,
        pictureUrl: response.data.pictureUrl,
        statusMessage: response.data.statusMessage,
      };
    } catch (error) {
      throw new UnauthorizedException('Failed to get user profile');
    }
  }

  /**
   * 驗證 ID Token 並提取用戶資訊
   */
  public async verifyIdToken(idToken: string): Promise<LineUserProfile> {
    try {
      // 簡化版本：直接解析 JWT payload
      const payload = JSON.parse(Buffer.from(idToken.split('.')[1], 'base64').toString());
      
      return {
        userId: payload.sub,
        displayName: payload.name,
        pictureUrl: payload.picture,
        statusMessage: undefined,
      };
    } catch (error) {
      throw new UnauthorizedException('Failed to verify ID token');
    }
  }

  /**
   * 處理 LINE 登入流程（簡化版本）
   */
  public async handleLineLogin(code: string): Promise<LineAuthResult> {
    try {
      // 1. 交換授權碼獲取權杖
      const tokenResponse = await this.exchangeCodeForToken(code);
      
      // 2. 獲取用戶資料
      const userProfile = await this.getUserProfile(tokenResponse.access_token);
      
      // 3. 簡化版本：直接生成 JWT token（不進行資料庫操作）
      const jwtToken = this.generateJwtToken(userProfile.userId);
      const expireDate = this.calculateExpireDate();

      return {
        jwtToken,
        expireDate,
        userProfile,
        isNewUser: true, // 簡化版本總是標記為新用戶
      };
    } catch (error) {
      throw new BadRequestException('LINE login failed');
    }
  }

  /**
   * 使用邀請碼登入（簡化版本）
   */
  public async loginWithInviteCode(
    lineUserId: string, 
    inviteCode: string, 
    idToken?: string
  ): Promise<LineAuthResult> {
    try {
      console.log(`[測試模式] 邀請碼登入 - LINE用戶: ${lineUserId}, 邀請碼: ${inviteCode}`);
      
      // 簡化版本：直接驗證邀請碼格式
      if (!inviteCode || inviteCode.length < 6) {
        throw new BadRequestException('無效的邀請碼格式');
      }

      // 從 idToken 解析真實的用戶資訊（如果有的話）
      let userProfile: LineUserProfile;
      if (idToken) {
        try {
          userProfile = await this.verifyIdToken(idToken);
          console.log(`[測試模式] 使用真實 LINE 用戶資料: ${userProfile.displayName}`);
        } catch (error) {
          console.log('[測試模式] ID Token 解析失敗，使用模擬資料');
          userProfile = {
            userId: lineUserId,
            displayName: `測試用戶_${inviteCode}`,
            pictureUrl: '',
            statusMessage: ''
          };
        }
      } else {
        // 模擬用戶資料
        userProfile = {
          userId: lineUserId,
          displayName: `測試用戶_${inviteCode}`,
          pictureUrl: '',
          statusMessage: ''
        };
      }

      // 生成 JWT token（使用 LINE 用戶 ID 的 hash 值）
      const customerId = Math.abs(lineUserId.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
      }, 0));
      
      const jwtToken = this.generateJwtToken(customerId);
      const expireDate = this.calculateExpireDate();

      console.log(`[測試模式] 登入成功 - 客戶ID: ${customerId}, JWT: ${jwtToken.substring(0, 20)}...`);

      return {
        jwtToken,
        expireDate,
        userProfile,
        isNewUser: false, // 測試模式總是標記為現有用戶
      };
    } catch (error) {
      console.error('[測試模式] 邀請碼登入失敗:', error);
      throw new BadRequestException('邀請碼登入失敗');
    }
  }

  /**
   * 生成 JWT token
   */
  private generateJwtToken(customerId: number | string): string {
    const payload = {
      customer_id: customerId,
      date: new Date().getTime(),
    };

    const sign = process.env.JWT_SIGN as string;
    const expireTime = process.env.JWT_EXPIRED === 'true' ? '2h' : undefined;
    
    return tokenHelper.generateJwtToken(payload, sign, expireTime);
  }

  /**
   * 生成帶有邀請碼的 LIFF URL
   */
  public generateLiffUrlWithInviteCode(
    inviteCode: string, 
    source?: string, 
    additionalParams?: string
  ): { liffUrl: string; inviteCode: string; source?: string; qrCodeUrl?: string } {
    const baseLiffUrl = 'https://liff.line.me/2008316850-kN5g1q7N';
    
    // 構建查詢參數
    const params = new URLSearchParams();
    params.set('inviteCode', inviteCode);
    
    if (source) {
      params.set('source', source);
    }
    
    if (additionalParams) {
      // 解析額外參數（格式：key1=value1&key2=value2）
      const additionalParamsObj = new URLSearchParams(additionalParams);
      additionalParamsObj.forEach((value, key) => {
        params.set(key, value);
      });
    }
    
    // 生成完整的 LIFF URL
    const liffUrl = `${baseLiffUrl}?${params.toString()}`;
    
    // 生成 QR Code URL（使用 Google Charts API）
    const qrCodeUrl = `https://chart.googleapis.com/chart?chs=300x300&chld=M|0&cht=qr&chl=${encodeURIComponent(liffUrl)}`;
    
    console.log(`[LIFF URL 生成] 邀請碼: ${inviteCode}, 來源: ${source || 'N/A'}, URL: ${liffUrl}`);
    
    return {
      liffUrl,
      inviteCode,
      source,
      qrCodeUrl
    };
  }

  /**
   * 計算過期時間
   */
  private calculateExpireDate(): string {
    const nowDate = new Date();
    if (process.env.JWT_EXPIRED === 'true') {
      nowDate.setHours(nowDate.getHours() + 2);
    }
    return nowDate.toISOString();
  }
}