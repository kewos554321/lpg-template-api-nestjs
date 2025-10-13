import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ControllerBase, httpStatus, ValidParam } from '@artifact/aurora-api-core';
import { plainToClass } from 'class-transformer';
import { OrderService } from './order.service.js';
import { OrderInfoResDto } from './dto/order-info-res.dto.js';
import { OrderListDataResDto } from './dto/order-list-res.dto.js';
import { GasPriceListResDto } from './dto/gas-price-res.dto.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Order')
@Controller('order')
export class OrderController extends ControllerBase {
  constructor(private readonly orderService: OrderService, private readonly validParam: ValidParam) {
    super();
  }

  @Get(':orderId')
  @ApiOperation({ summary: 'Get order info' })
  async getOrderInfo(@Param('orderId') orderId: string) {
    const result = await this.orderService.getOrderInfo(orderId);
    const orderInfoResDto = plainToClass(OrderInfoResDto, result.data, {
      excludeExtraneousValues: true,
    });
    return this.formatResponse(orderInfoResDto, result.status);
  }

  @Get('search/unaccomplished')
  @ApiOperation({ summary: 'Get unaccomplished order list' })
  @ApiQuery({ name: 'supplierId', required: true })
  async getUnaccomplishedOrderList(
    @CurrentUser() user: any,
    @Query('supplierId') supplierId: string,
  ) {
    const customerId = Number(user.customer_id);
    const result = await this.orderService.getOrderList(
      0,
      Number.MAX_SAFE_INTEGER,
      customerId,
      supplierId,
      false,
    );
    const orderListResDto = plainToClass(OrderListDataResDto, result.data, {
      excludeExtraneousValues: true,
    });
    return this.formatResponse(orderListResDto, result.status);
  }

  @Get('search/accomplished')
  @ApiOperation({ summary: 'Get accomplished order list' })
  @ApiQuery({ name: 'page', required: true })
  @ApiQuery({ name: 'size', required: true })
  @ApiQuery({ name: 'supplierId', required: true })
  async getAccomplishedOrderList(
    @CurrentUser() user: any,
    @Query('page') page: number,
    @Query('size') size: number,
    @Query('supplierId') supplierId: string,
  ) {
    const customerId = Number(user.customer_id);
    const result = await this.orderService.getOrderList(page, size, customerId, supplierId, true);
    const orderListResDto = plainToClass(OrderListDataResDto, result.data, {
      excludeExtraneousValues: true,
    });
    return this.formatResponse(orderListResDto, result.status);
  }

  @Get('gas/price')
  @ApiOperation({ summary: 'Get gas price list' })
  @ApiQuery({ name: 'supplierId', required: true })
  @ApiQuery({ name: 'gasType', required: false })
  @ApiQuery({ name: 'kilogram', required: false })
  async getGasPriceList(
    @CurrentUser() user: any,
    @Query('supplierId') supplierId: string,
    @Query('gasType') gasType?: string,
    @Query('kilogram') kilogram?: number,
  ) {
    const customerId = Number(user.customer_id);
    const result = await this.orderService.getGasPriceList(customerId, supplierId, gasType, kilogram);
    const gasPriceListResDto = plainToClass(GasPriceListResDto, result.data, {
      excludeExtraneousValues: true,
    });
    return this.formatResponse(gasPriceListResDto, result.status);
  }

  @Post()
  @ApiOperation({ summary: 'Create order' })
  async createOrder(
    @CurrentUser() user: any,
    @Body()
    body: any,
  ) {
    const customerId = Number(user.customer_id);

    const {
      orderInfo,
      orderGasList,
      orderCommodityList,
      orderUsageFeeList,
      supplierId,
      customerInfoInOrder,
    } = body;

    // Validation is handled via DTOs/schema in future; keep parity now
    if (!orderInfo || !orderGasList || !supplierId) {
      return this.formatResponse('Please check your body.', httpStatus.BAD_REQUEST);
    }

    const result = await this.orderService.createOrder(
      orderInfo,
      orderGasList,
      orderCommodityList,
      orderUsageFeeList,
      customerId,
      supplierId,
      customerInfoInOrder,
    );
    return this.formatResponse(result.data, result.status);
  }
}


