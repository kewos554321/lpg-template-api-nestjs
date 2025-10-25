import { Test, TestingModule } from '@nestjs/testing';
import { LineAuthController } from './line-auth.controller';
import { LineAuthService } from './line-auth.service';

describe('LineAuthController', () => {
  let controller: LineAuthController;
  const service = {
    loginWithInviteCode: jest.fn(async () => ({
      jwtToken: 'jwt2', expireDate: new Date().toISOString(),
      userProfile: { userId: 'u2', displayName: 'n2' }, isNewUser: false,
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LineAuthController],
      providers: [{ provide: LineAuthService, useValue: service }],
    }).compile();

    controller = module.get(LineAuthController);
    (controller as any).formatResponse = (data: any, status = 200) => ({ data, status });
    jest.clearAllMocks();
  });


  it('loginWithInvite: success', async () => {
    const res = await controller.loginWithInvite({ lineUserId: 'u', inviteCode: 'ABCDEF', accessToken: 'token' } as any);
    expect(service.loginWithInviteCode).toHaveBeenCalledWith('u', 'ABCDEF', undefined, 'token');
    expect(res.status).toBe(200);
    expect(res.data.isNewUser).toBe(false);
  });

  it('loginWithInvite: failure path', async () => {
    (service.loginWithInviteCode as jest.Mock).mockRejectedValueOnce(new Error('fail'));
    const res = await controller.loginWithInvite({ lineUserId: 'u', inviteCode: 'BAD', accessToken: 'token' } as any);
    expect(res.status).toBe(400);
  });

  it('handleCallback redirect', async () => {
    process.env.FRONTEND_URL = 'http://localhost:3000';
    const res = await controller.handleCallback('code123', 'st');
    expect(res).toEqual({ url: 'http://localhost:3000/liff?code=code123&state=st' });
  });
});


