import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliveryController } from './delivery.controller';
import { DeliveryService } from './delivery.service';
import { DeliveryModel } from './delivery.model';
import { CustomerAddress, CustomerDelivery } from '@artifact/lpg-api-service';
import { AddressBinding } from '@artifact/lpg-api-service/dist/database/entities/address_binding';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CustomerAddress,
      CustomerDelivery,
      AddressBinding,
    ]),
  ],
  controllers: [DeliveryController],
  providers: [DeliveryService, DeliveryModel],
  exports: [DeliveryService, DeliveryModel],
})
export class DeliveryModule {}
