import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { OrderService } from './order.service';
import type {
  CreateOrderRequest,
  GetOrderListRequest,
  UpdateOrderPaymentRequest,
} from './dto/order.dto';

@Controller('order')
export class OrderController {
  constructor(private readonly service: OrderService) {}

  @Get(':order_id')
  getOrderInfo(@Param('order_id') order_id: string) {
    return this.service.getOrderInfo(order_id);
  }

  @Post('list')
  getOrderList(@Body() body: GetOrderListRequest) {
    return this.service.getOrderList(body);
  }

  @Post()
  createOrder(@Body() body: CreateOrderRequest) {
    const supplier_id = 'GS_1';
    return this.service.createOrder(body, supplier_id);
  }

  @Patch('payment')
  updateOrderPayment(@Body() body: UpdateOrderPaymentRequest) {
    return this.service.updateOrderPayment(body);
  }
}

// Orders controller template
