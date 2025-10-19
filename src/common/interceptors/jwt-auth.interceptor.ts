// import { Injectable, NestInterceptor, ExecutionContext, CallHandler, UnauthorizedException } from '@nestjs/common';
// import { Observable } from 'rxjs';
// import { tokenHelper } from '@artifact/lpg-api-service';

// @Injectable()
// export class JwtAuthInterceptor implements NestInterceptor {
//   async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
//     const request = context.switchToHttp().getRequest();
//     const response = context.switchToHttp().getResponse();
    
//     try {
//       // 使用 tokenHelper 的 verifyGeneralTokenMiddleWare 邏輯
//       const middleware = tokenHelper.verifyGeneralTokenMiddleWare();
      
//       // 將 Express 中間件包裝成 Promise
//       await new Promise<void>((resolve, reject) => {
//         middleware(request, response, (error?: any) => {
//           if (error) {
//             reject(new UnauthorizedException('Invalid token'));
//           } else {
//             resolve();
//           }
//         });
//       });
      
//       // 如果認證成功，繼續執行下一個處理器
//       return next.handle();
//     } catch (error) {
//       throw new UnauthorizedException('Token verification failed');
//     }
//   }
// }
