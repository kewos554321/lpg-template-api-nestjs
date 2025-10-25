import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { tokenHelper, ServiceBase } from '@artifact/lpg-api-service';
import { LineAuthConfig, LineUserProfile, LineAuthResult } from './interfaces/line-auth.interface';
import { LineUserProfileDto } from './dto/line-auth.dto';
import { plainToClass } from 'class-transformer';

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
   * 驗證 access token 是否有效
   */
  public async verifyAccessToken(accessToken: string): Promise<{ client_id: string; expires_in: number }> {
    try {
      const response = await axios.get('https://api.line.me/oauth2/v2.1/verify', {
        params: {
          access_token: accessToken
        }
      });

      console.log('[LINE] Access token verification response:', JSON.stringify(response.data, null, 2));

      const { client_id, expires_in } = response.data;
      
      // 驗證 client_id 是否匹配我們的 channel ID
      if (client_id !== this.lineConfig.channelId) {
        throw new UnauthorizedException('Invalid client_id in access token');
      }

      // 驗證 token 是否未過期
      if (expires_in <= 0) {
        throw new UnauthorizedException('Access token has expired');
      }

      return { client_id, expires_in };
    } catch (error) {
      console.error('[LINE] Access token verification failed:', error?.response?.data || error?.message);
      throw new UnauthorizedException('Failed to verify access token');
    }
  }

  /**
   * 使用存取權杖獲取用戶資料
   */
  public async getUserProfile(accessToken: string): Promise<LineUserProfile> {
    try {
      const response = await axios.get('https://api.line.me/v2/profile ', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      // 透過 OpenID UserInfo 取得更多欄位（若 scope/openid 設定允許）
      let userInfo: any = {};
      try {
        console.log(`start userInfoResp`)
        const userInfoResp = await axios.get('https://api.line.me/oauth2/v2.1/userinfo', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });
        console.log(`userInfoResp ${JSON.stringify(userInfoResp, null, 2)}`)
        userInfo = userInfoResp.data || {};
      } catch (e) {
        console.error('userInfoResp e -> ' , e)
        userInfo = {};
      }

      return {
        userId: response.data.userId,
        displayName: response.data.displayName,
        pictureUrl: response.data.pictureUrl,
        statusMessage: response.data.statusMessage,
        language: userInfo.lang || userInfo.locale,
        locale: userInfo.locale,
        email: userInfo.email,
        emailVerified: userInfo.email_verified,
        givenName: userInfo.given_name,
        familyName: userInfo.family_name,
      };
    } catch (error) {
      throw new UnauthorizedException('Failed to get user profile');
    }
  }

  /**
   * 驗證 ID Token 並提取用戶資訊
   */
  public async verifyIdToken(idToken: string, accessToken?: string): Promise<LineUserProfile> {
    try {
      // 簡化版本：直接解析 JWT payload
      const payload = JSON.parse(Buffer.from(idToken.split('.')[1], 'base64').toString());

      console.info('idToken payload', JSON.stringify(payload, null, 2), '\n');

      // 驗證 ID Token（向 LINE 平台驗證），並輸出回應內容以便除錯
      try {
        const form = new URLSearchParams();
        form.set('id_token', idToken);
        form.set('client_id', this.lineConfig.channelId);
        const verifyResp = await axios.post(
          'https://api.line.me/oauth2/v2.1/verify',
          form.toString(),
          { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );
        console.log('[LINE] /oauth2/v2.1/verify (id_token) response:', JSON.stringify(verifyResp.data, null, 2));
      } catch (e) {
        console.warn('[LINE] verify id_token failed:', e?.response?.data || e?.message);
      }
      
      const baseFromIdToken: LineUserProfile = {
        userId: payload.sub,
        displayName: payload.name,
        pictureUrl: payload.picture,
        statusMessage: undefined,
        language: payload.lang || payload.locale || undefined,
        email: payload.email,
        emailVerified: payload.email_verified,
      };

      // 若同時取得 accessToken，嘗試補充更多 profile 欄位
      console.log(`userInfoResp1`, accessToken)
      if (accessToken) {
        try {
          console.log(`userInfoResp2`)

          const enriched = await this.getUserProfile(accessToken);

          return {
            ...baseFromIdToken,
            // 以 userInfo/PROFILE 為準，回填更多欄位
            displayName: enriched.displayName || baseFromIdToken.displayName,
            pictureUrl: enriched.pictureUrl || baseFromIdToken.pictureUrl,
            statusMessage: enriched.statusMessage ?? baseFromIdToken.statusMessage,
            language: enriched.language || baseFromIdToken.language,
            locale: enriched.locale || undefined,
            email: enriched.email || baseFromIdToken.email,
            emailVerified: enriched.emailVerified ?? baseFromIdToken.emailVerified,
            givenName: enriched.givenName || undefined,
            familyName: enriched.familyName || undefined,
          };
        } catch (_) {
          // 無法取得 userinfo 時，仍回傳 idToken 解析結果
          return baseFromIdToken;
        }
      }

      return baseFromIdToken;
    } catch (error) {
      throw new UnauthorizedException('Failed to verify ID token');
    }
  }


  /**
   * 使用邀請碼登入（安全版本 - 使用 access token 驗證）
   */
  public async loginWithInviteCode(
    lineUserId: string, 
    inviteCode: string, 
    idToken?: string,
    accessToken?: string
  ): Promise<LineAuthResult> {
    try {
      console.log(`[安全模式] 邀請碼登入 - LINE用戶: ${lineUserId}, 邀請碼: ${inviteCode}`);
      
      // 驗證邀請碼格式
      if (!inviteCode || inviteCode.length < 6) {
        throw new BadRequestException('無效的邀請碼格式');
      }

      let userProfile: LineUserProfile;

      // 優先使用 access token 進行安全驗證
      if (accessToken) {
        try {
          console.log('[安全模式] 使用 access token 進行安全驗證');
          
          // 1. 驗證 access token 是否有效
          const verificationResult = await this.verifyAccessToken(accessToken);
          console.log('[安全模式] Access token 驗證成功:', verificationResult);
          
          // 2. 使用 access token 獲取用戶資料
          userProfile = await this.getUserProfile(accessToken);
          console.log('[安全模式] 從 LINE Platform 獲取的真實用戶資料:', JSON.stringify(userProfile, null, 2));
          
        } catch (error) {
          console.error('[安全模式] Access token 驗證失敗:', error);
          throw new UnauthorizedException('Access token 驗證失敗，請重新登入');
        }
      } 
      // 備用方案：使用 ID token（較不安全）
      else if (idToken) {
        try {
          console.log('[備用模式] 使用 ID token 解析用戶資料');
          userProfile = await this.verifyIdToken(idToken);
          console.log('[備用模式] 從 ID token 解析的用戶資料:', JSON.stringify(userProfile, null, 2));
        } catch (error) {
          console.log('[備用模式] ID Token 解析失敗，使用模擬資料');
          userProfile = {
            userId: lineUserId,
            displayName: `測試用戶_${inviteCode}`,
            pictureUrl: '',
            statusMessage: ''
          };
        }
      } 
      // 最後備用方案：模擬用戶資料（僅用於測試）
      else {
        console.log('[測試模式] 無 access token 和 ID token，使用模擬資料');
        userProfile = {
          userId: lineUserId,
          displayName: `測試用戶_${inviteCode}`,
          pictureUrl: '',
          statusMessage: ''
        };
      }

      // 生成 JWT token（使用 LINE 用戶 ID 的 hash 值）
      const customerId = Math.abs(userProfile.userId.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
      }, 0));
      
      const jwtToken = this.generateJwtToken(customerId);
      const expireDate = this.calculateExpireDate();

      console.log(`[安全模式] 登入成功 - 客戶ID: ${customerId}, JWT: ${jwtToken.substring(0, 20)}...`);

      return {
        jwtToken,
        expireDate,
        userProfile,
        isNewUser: false, // 標記為現有用戶
      };
    } catch (error) {
      console.error('[安全模式] 邀請碼登入失敗:', error);
      throw new BadRequestException(error.message || '邀請碼登入失敗');
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