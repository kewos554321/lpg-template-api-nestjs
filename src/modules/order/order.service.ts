import { Injectable } from '@nestjs/common';
import {
  CreateOrderRequest,
  CreateOrderResponse,
  GetOrderListRequest,
  GetOrderListResponse,
  OrderResponse,
  UpdateOrderPaymentRequest,
  UpdateOrderPaymentResponse,
} from './dto/order.dto';
import { OrderModel } from './order.model';
import { OrderRepository } from './order.repository';
import { OrderList } from '@artifact/lpg-api-service/dist/database/entities/order_list';

@Injectable()
export class OrderService {
  constructor(private readonly model: OrderModel) {}

  async getOrderInfo(order_id: string): Promise<OrderResponse> {
    const orderInfo = await this.model.getOrderInfo(order_id);
    if (!orderInfo) throw new Error('Order not found');

    const totalPrice = this.calculateTotalPrice(orderInfo as any);
    const arrears = orderInfo.customerInSupplier?.init_arrears || 0;

    return { orderInfos: orderInfo, arrears, totalPrice } as OrderResponse;
  }

  private calculateTotalPrice(orderInfo: any): number {
    let total = 0;
    if (orderInfo.order_gas_list) {
      orderInfo.order_gas_list.forEach((gas: any) => {
        if (gas.cis_gas_price_info?.price && gas.numbers_of_cylinder) {
          total += gas.cis_gas_price_info.price * gas.numbers_of_cylinder;
        }
      });
    }
    if (orderInfo.order_commodity_list) {
      orderInfo.order_commodity_list.forEach((commodity: any) => {
        if (commodity.commodity_price_info?.price && commodity.numbers_of_commodity) {
          total += commodity.commodity_price_info.price * commodity.numbers_of_commodity;
        }
      });
    }
    if (orderInfo.order_cylinder_list) {
      orderInfo.order_cylinder_list.forEach((cylinder: any) => {
        if (cylinder.cylinder_price_info?.price && cylinder.numbers_of_cylinder) {
          total += cylinder.cylinder_price_info.price * cylinder.numbers_of_cylinder;
        }
      });
    }
    if (orderInfo.order_usage_fee_list) {
      orderInfo.order_usage_fee_list.forEach((fee: any) => {
        if (fee.money) total += fee.money;
      });
    }
    if (orderInfo.cis_cylinder_mortgage_list) {
      orderInfo.cis_cylinder_mortgage_list.forEach((mortgage: any) => {
        if (mortgage.money && mortgage.numbers_of_cylinder) {
          total += mortgage.money * mortgage.numbers_of_cylinder;
        }
      });
    }
    if (orderInfo.order_refund_list) {
      orderInfo.order_refund_list.forEach((refund: any) => {
        if (refund.gas_price && refund.refund_gas_kilogram) {
          total -= refund.gas_price * refund.refund_gas_kilogram;
        }
      });
    }
    if (orderInfo.discount) total -= orderInfo.discount;
    if (orderInfo.gas_discount) total -= orderInfo.gas_discount;
    return Math.max(0, total);
  }

  async getOrderList(request: GetOrderListRequest): Promise<GetOrderListResponse> {
    const orderList = await this.model.getOrderList(request);
    return { orderList, rowsCount: orderList.length };
  }

  async createOrder(request: CreateOrderRequest, supplier_id: string): Promise<CreateOrderResponse> {
    return this.model.createOrder(request, supplier_id);
  }

  async updateOrderPayment(request: UpdateOrderPaymentRequest): Promise<UpdateOrderPaymentResponse> {
    return this.model.updateOrderPayment(request);
  }
}

@Injectable()
export class Order2Service {
  constructor(private readonly repository: OrderRepository) {}

  public async getOrderInfo(order_id: string): Promise<OrderResponse> {
    const orderInfo = await this.repository.getOrderInfo(order_id);
    if (!orderInfo) throw new Error('Order not found');

    const totalPrice = this.mockCalculateTotalPrice(orderInfo as any);
    const arrears = orderInfo.customerInSupplier?.init_arrears || 0;

    return { orderInfos: orderInfo, arrears, totalPrice } as OrderResponse;
  }

  private mockCalculateTotalPrice(orderInfo: any): number {
    return 1000;
  }

  public async getOrderListById(order_id: string): Promise<OrderList[]> {
    return this.repository.getOrderListById(order_id);
  }

  public async getOrderList(request: GetOrderListRequest): Promise<GetOrderListResponse> {
    const orderList = await this.repository.getOrderList(request);
    return { orderList, rowsCount: orderList.length };
  }
}

