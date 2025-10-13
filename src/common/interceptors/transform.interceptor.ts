import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ResponseFormatter } from '../utils/response.formatter';

const FORMAT_RESPONSE_KEY = 'formatResponse';

@Injectable()
export class TransformResponseInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const shouldFormat = this.reflector.getAllAndOverride<boolean>(FORMAT_RESPONSE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!shouldFormat) {
      return next.handle();
    }

    const formatter = new ResponseFormatter();
    return next.handle().pipe(
      map((data) => {
        const req = context.switchToHttp().getRequest();
        const refreshToken = req?.headers?.['x-refresh-token'];
        return formatter.toResponse(data, undefined, refreshToken);
      }),
    );
  }
}

export const FormatResponse = () => (target: any, key?: any, descriptor?: any) => {
  Reflect.defineMetadata(FORMAT_RESPONSE_KEY, true, descriptor ? descriptor.value : target);
  return descriptor ?? target;
};
