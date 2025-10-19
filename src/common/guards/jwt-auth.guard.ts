import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { tokenHelper } from '@artifact/lpg-api-service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    
    try {
      // 使用 tokenHelper 的 verifyGeneralTokenMiddleWare 邏輯
      const middleware = tokenHelper.verifyGeneralTokenMiddleWare();
      
      // 將 Express 中間件包裝成 Promise
      await new Promise<void>((resolve, reject) => {
        middleware(request, response, (error?: any) => {
          if (error) {
            reject(new UnauthorizedException('Invalid token'));
          } else {
            resolve();
          }
        });
      });
      
      return true;
    } catch (error) {
      throw new UnauthorizedException('Token verification failed');
    }
  }
}
