import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderController } from './order.controller';
import { Order2Service, OrderService } from './order.service';
import { OrderModel } from './order.model';
import {
  OrderList,
  OrderGas,
  OrderCommodity,
  OrderCylinder,
  CisCylinderMortgage,
  OrderUsageFee,
  OrderRefund,
  OrderPayup,
  OrderPayupWork,
  Check,
  CisWallet,
  Supplier,
  DeliveryAddress,
} from '@artifact/lpg-api-service';
import { OrderRepository } from './order.repository';
import { Order2Controller } from './order.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrderList,
      OrderGas,
      OrderCommodity,
      OrderCylinder,
      CisCylinderMortgage,
      OrderUsageFee,
      OrderRefund,
      OrderPayup,
      OrderPayupWork,
      Check,
      CisWallet,
      Supplier,
      DeliveryAddress,
    ]),
  ],
  controllers: [OrderController, Order2Controller],
  providers: [OrderService, OrderModel, OrderRepository, Order2Service],
})
export class OrderModule {}
