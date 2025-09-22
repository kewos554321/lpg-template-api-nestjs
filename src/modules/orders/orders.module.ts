import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrdersModel } from './orders.model';
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
  controllers: [OrdersController],
  providers: [OrdersService, OrdersModel],
})
export class OrdersModule {}
