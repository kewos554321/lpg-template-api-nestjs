import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { LineAuthService } from './line-auth.service';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

jest.mock('@artifact/lpg-api-service', () => ({
  tokenHelper: {
    generateJwtToken: jest.fn(() => 'mock.jwt.token'),
  },
  ServiceBase: class {},
}));

describe('LineAuthService', () => {
  let service: LineAuthService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const map: Record<string, string> = {
        LINE_CHANNEL_ID: 'test_channel_id',
        LINE_CHANNEL_SECRET: 'test_channel_secret',
        LINE_REDIRECT_URI: 'http://localhost:3000/callback',
      };
      return map[key];
    }),
  };

  beforeEach(async () => {
    process.env.JWT_SIGN = 'test-sign';
    delete process.env.JWT_EXPIRED;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LineAuthService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get(LineAuthService);
    jest.clearAllMocks();
  });

  it('generateLoginUrl: 應回傳 loginUrl 與 state', () => {
    const { loginUrl, state } = service.generateLoginUrl();
    expect(loginUrl).toContain('access.line.me');
    expect(loginUrl).toContain('client_id=test_channel_id');
    expect(state).toHaveLength(64);
  });

  it('exchangeCodeForToken: 成功交換 token', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { access_token: 'at', id_token: 'it' } });
    const res = await service.exchangeCodeForToken('code123');
    expect(res).toEqual({ access_token: 'at', id_token: 'it' });
    expect(mockedAxios.post).toHaveBeenCalled();
  });

  it('exchangeCodeForToken: 失敗時丟 UnauthorizedException', async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error('network'));
    await expect(service.exchangeCodeForToken('bad')).rejects.toThrow('Failed to exchange code for token');
  });

  it('getUserProfile: 成功取得 profile', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { userId: 'u123', displayName: 'Mike', pictureUrl: 'p.png', statusMessage: 'hi' },
    });
    const res = await service.getUserProfile('at');
    expect(res).toEqual({ userId: 'u123', displayName: 'Mike', pictureUrl: 'p.png', statusMessage: 'hi' });
  });

  it('getUserProfile: 失敗時丟 UnauthorizedException', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('401'));
    await expect(service.getUserProfile('bad')).rejects.toThrow('Failed to get user profile');
  });

  it('verifyIdToken: 成功解析', async () => {
    const payload = Buffer.from(JSON.stringify({ sub: 'u1', name: 'Amy', picture: 'x.png' })).toString('base64url');
    const token = `aaa.${payload}.zzz`;
    const res = await service.verifyIdToken(token);
    expect(res).toEqual({ userId: 'u1', displayName: 'Amy', pictureUrl: 'x.png', statusMessage: undefined });
  });

  it('verifyIdToken: 失敗丟 UnauthorizedException', async () => {
    await expect(service.verifyIdToken('broken')).rejects.toThrow('Failed to verify ID token');
  });

  it('handleLineLogin: happy path', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { access_token: 'at' } });
    mockedAxios.get.mockResolvedValueOnce({
      data: { userId: 'u1', displayName: 'Amy', pictureUrl: 'x', statusMessage: 'hi' },
    });
    const res = await service.handleLineLogin('good_code');
    expect(res.jwtToken).toBe('mock.jwt.token');
    expect(res.isNewUser).toBe(true);
  });

  it('handleLineLogin: 任一步驟失敗 => BadRequestException', async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error('bad exchange'));
    await expect(service.handleLineLogin('bad_code')).rejects.toThrow('LINE login failed');
  });

  it('loginWithInviteCode: 無效邀請碼 => BadRequestException', async () => {
    await expect(service.loginWithInviteCode('u1', '123')).rejects.toThrow('邀請碼登入失敗');
  });

  it('loginWithInviteCode: 有效邀請碼，無 idToken => 使用模擬用戶', async () => {
    const res = await service.loginWithInviteCode('u1', 'ABCDEF');
    expect(res.jwtToken).toBe('mock.jwt.token');
    expect(res.isNewUser).toBe(false);
    expect(res.userProfile.displayName).toContain('測試用戶_ABCDEF');
  });

  it('loginWithInviteCode: 提供正確 idToken => 使用真實解析資料', async () => {
    const payload = Buffer.from(JSON.stringify({ sub: 'line-123', name: 'RealUser', picture: '' })).toString('base64url');
    const token = `h.${payload}.s`;
    const res = await service.loginWithInviteCode('u-any', 'ABCDEF', token);
    expect(res.userProfile.displayName).toBe('RealUser');
    expect(res.isNewUser).toBe(false);
  });

  it('generateLiffUrlWithInviteCode: 生成 URL 與 QRCode', () => {
    const res = service.generateLiffUrlWithInviteCode('INV123', 'ad', 'k=v');
    expect(res.liffUrl).toContain('inviteCode=INV123');
    expect(res.source).toBe('ad');
    expect(res.qrCodeUrl).toContain('chart.googleapis.com');
  });

  it('calculateExpireDate: 受 JWT_EXPIRED 影響', () => {
    const d1 = (service as any).calculateExpireDate();
    process.env.JWT_EXPIRED = 'true';
    const d2 = (service as any).calculateExpireDate();
    expect(new Date(d2).getTime() - new Date(d1).getTime()).toBeGreaterThanOrEqual(2 * 60 * 60 * 1000 - 1000);
  });
});
