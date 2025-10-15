import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliveryController } from './delivery.controller';
import { DeliveryService } from './delivery.service';
import { DeliveryRepository } from './delivery.repository';
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
  providers: [DeliveryService, DeliveryRepository],
  exports: [DeliveryService, DeliveryRepository],
})
export class DeliveryModule {}
