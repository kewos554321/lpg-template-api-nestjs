import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommodityController } from './commodity.controller';
import { CommodityService } from './commodity.service';
import { CommodityRepository } from './commodity.repository';
import { Commodity, CommodityPrice } from '@artifact/lpg-api-service';
import { CustomerModule } from '../customer/customer.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Commodity,
      CommodityPrice,
    ]),
    CustomerModule,
  ],
  controllers: [CommodityController],
  providers: [CommodityService, CommodityRepository],
  exports: [CommodityService],
})
export class CommodityModule {}
