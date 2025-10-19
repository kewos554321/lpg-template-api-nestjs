import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';

export const AuthCustomer = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  const response = ctx.switchToHttp().getResponse();
  
  const customer = response.locals?.auth_token || {};
  
  // 驗證必要的客戶資訊
  if (!customer.customer_id) {
    throw new UnauthorizedException('Invalid customer: missing customer_id');
  }
  
  return customer;
});
