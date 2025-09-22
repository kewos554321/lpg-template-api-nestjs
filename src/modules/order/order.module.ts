import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
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
} from '@artifact/lpg-api-service';

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
    ]),
  ],
  controllers: [OrderController],
  providers: [OrderService, OrderModel],
})
export class OrderModule {}
