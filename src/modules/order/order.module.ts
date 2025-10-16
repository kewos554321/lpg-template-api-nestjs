import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  CisGasPrice,
  Customer,
  CustomerDelivery,
  CustomerInSuppliers,
  GasPrice,
  OrderCommodity,
  OrderGas,
  OrderList,
  OrderUsageFee,
  Supplier,
} from '@artifact/lpg-api-service';
import { OrderController } from './order.controller.js';
import { OrderService } from './order.service.js';
import { OrderRepository } from './order.repository.js';
import { DeliveryModule } from '../delivery/delivery.module';
import { CustomerModule } from '../customer/customer.module';
import { CommodityModule } from '../commodity/commodity.module';
import { AddressBinding } from '@artifact/lpg-api-service/dist/database/entities/address_binding';
import { ValidParam } from '@artifact/aurora-api-core';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrderList,
      OrderGas,
      OrderCommodity,
      OrderUsageFee,
      Supplier,
      GasPrice,
      CisGasPrice,
      Customer,
      CustomerDelivery,
      CustomerInSuppliers,
      AddressBinding,
    ]),
    DeliveryModule,
    CustomerModule,
    CommodityModule,
  ],
  controllers: [OrderController],
  providers: [OrderService, OrderRepository, ValidParam],
})
export class OrderModule {}


