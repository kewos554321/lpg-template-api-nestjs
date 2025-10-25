import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LineAuthController } from './line-auth.controller';
import { LineAuthService } from './line-auth.service';
import { LineAuthRepository } from './line-auth.repository';
import { CustomerInSuppliers } from '@artifact/lpg-api-service';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([CustomerInSuppliers])
  ],
  controllers: [LineAuthController],
  providers: [LineAuthService, LineAuthRepository],
  exports: [LineAuthService],
})
export class LineAuthModule {}