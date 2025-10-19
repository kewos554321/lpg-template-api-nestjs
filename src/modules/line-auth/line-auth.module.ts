import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LineAuthController } from './line-auth.controller';
import { LineAuthService } from './line-auth.service';

@Module({
  imports: [ConfigModule],
  controllers: [LineAuthController],
  providers: [LineAuthService],
  exports: [LineAuthService],
})
export class LineAuthModule {}