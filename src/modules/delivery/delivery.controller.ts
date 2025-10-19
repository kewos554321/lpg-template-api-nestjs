import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DeliveryService } from './delivery.service';
import { CreateCustomerAddressDto } from './dto/delivery.dto';
import { ControllerBase } from '@artifact/aurora-api-core';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { AuthCustomer } from 'src/common/decorators/auth-customer.decorator';
@ApiTags('Delivery')
@UseGuards(JwtAuthGuard)
@Controller('delivery')
export class DeliveryController extends ControllerBase{
  constructor(private readonly deliveryService: DeliveryService) {
    super();
  }

  @Get('address')
  @ApiOperation({ summary: 'Get customer address list' })
  @ApiResponse({ status: 200, description: 'Customer address list returned' })
  async getCustomerAddressList(@AuthCustomer() customer: any) {
    const customerId = Number(customer.customer_id);
    const result = await this.deliveryService.getCustomerAddressList(customerId);
    return this.formatResponse(result.data, result.status);
  }

  @Get('address/location/:customerAddressId')
  @ApiOperation({ summary: 'Get customer delivery list by address ID' })
  @ApiResponse({ status: 200, description: 'Customer delivery list returned' })
  async getCustomerDeliveryList(@Param('customerAddressId') customerAddressId: string) {
    const result = await this.deliveryService.getCustomerDeliveryList(Number(customerAddressId));
    return this.formatResponse(result.data, result.status);
  }

  @Get('address/:customerAddressId')
  @ApiOperation({ summary: 'Find address binding info' })
  @ApiResponse({ status: 200, description: 'Address binding info returned' })
  async findAddressBindingInfo(@Param('customerAddressId') customerAddressId: string) {
    const result = await this.deliveryService.findAddressBindingInfo(Number(customerAddressId));
    return this.formatResponse(result.data, result.status);
  }

  @Post('address')
  @ApiOperation({ summary: 'Create customer address' })
  @ApiResponse({ status: 201, description: 'Customer address created' })
  async createCustomerAddress(@Body() body: { addressInfos: CreateCustomerAddressDto; addressId?: number }) {
    const result = await this.deliveryService.createCustomerAddress(body.addressInfos, body.addressId);
    return this.formatResponse(result.data, result.status);
  }
}
