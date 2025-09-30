import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OrderService, Order2Service } from './order.service';
import type {
  CreateOrderRequest,
  GetOrderListRequest,
  UpdateOrderPaymentRequest,
} from './dto/order.dto';

@ApiTags('Order')
@ApiBearerAuth()
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

@ApiTags('Order2')
@ApiBearerAuth()
@Controller('order2')
export class Order2Controller {
  constructor(private readonly service: Order2Service) {}

  @Get(':order_id')
  @ApiOperation({ summary: 'Get order info by ID' })
  @ApiResponse({ status: 200, description: 'Order info returned' })
  getOrderInfo(@Param('order_id') order_id: string) {
    return this.service.getOrderInfo(order_id);
  }

  @Post('list')
  @ApiOperation({ summary: 'List orders (query via URL querystring)' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (>=1)', example: 1 })
  @ApiQuery({ name: 'size', required: false, description: 'Page size', example: 10 })
  @ApiQuery({ name: 'firstDate', required: false, description: 'Filter start ISO date', example: '2025-09-01' })
  @ApiQuery({ name: 'lastDate', required: false, description: 'Filter end ISO date', example: '2025-09-15' })
  @ApiQuery({ name: 'sortColumnName', required: false, description: 'Sort column', example: 'delivery_time_stamp' })
  @ApiQuery({ name: 'orderType', required: false, description: 'Sort direction', example: 'DESC', enum: ['ASC', 'DESC'] as any })
  @ApiQuery({ name: 'order_status', required: false, description: 'Order status filter', example: '尚未配送' })
  @ApiQuery({ name: 'supplier_id', required: false, description: 'Supplier ID', example: 'GS_1' })
  @ApiResponse({ status: 200, description: 'Order list returned' })
  getOrderListByQuery(
    @Query('page') page?: string,
    @Query('size') size?: string,
    @Query('firstDate') firstDate?: string,
    @Query('lastDate') lastDate?: string,
    @Query('sortColumnName') sortColumnName?: string,
    @Query('orderType') orderType?: 'ASC' | 'DESC',
    @Query('order_status') order_status?: string,
    @Query('supplier_id') supplier_id?: string,
  ) {
    const req: GetOrderListRequest = {
      page: page ? Number(page) : undefined,
      size: size ? Number(size) : undefined,
      firstDate,
      lastDate,
      sortColumnName,
      orderType,
      order_status,
      supplier_id,
    };
    return this.service.getOrderList(req);
  }

  // @Post('list')
  // getOrderList(@Body() body: GetOrderListRequest) {
  //   return this.service.getOrderList(body);
  // }

  @Post()
  createOrder(@Body() body: CreateOrderRequest) {
    const supplier_id = 'GS_1';
    return this.service.createOrder(body, supplier_id);
  }

}

