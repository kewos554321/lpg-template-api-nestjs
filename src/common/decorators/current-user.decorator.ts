import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return (
    request.user ||
    request.auth_token ||
    request.locals?.auth_token ||
    request.res?.locals?.auth_token ||
    {}
  );
});
