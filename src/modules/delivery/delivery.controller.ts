import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DeliveryService } from './delivery.service';
import { CreateCustomerAddressDto } from './dto/delivery.dto';
import { ControllerBase } from '@artifact/aurora-api-core';

@ApiTags('Delivery')
@ApiBearerAuth()
@Controller('delivery')
export class DeliveryController extends ControllerBase{
  constructor(private readonly deliveryService: DeliveryService) {
    super();
  }

  @Get('address')
  @ApiOperation({ summary: 'Get customer address list' })
  @ApiResponse({ status: 200, description: 'Customer address list returned' })
  async getCustomerAddressList() {
    // Note: In a real implementation, you would get customerId from JWT token
    // For now, we'll need to implement proper authentication
    const customerId = 1; // This should come from JWT token
    const result = await this.deliveryService.getCustomerAddressList(customerId);
    return this.formatResponse(result, result.status);
  }

  @Get('address/location/:customerAddressId')
  @ApiOperation({ summary: 'Get customer delivery list by address ID' })
  @ApiResponse({ status: 200, description: 'Customer delivery list returned' })
  async getCustomerDeliveryList(@Param('customerAddressId') customerAddressId: string) {
    const result = await this.deliveryService.getCustomerDeliveryList(Number(customerAddressId));
    return this.formatResponse(result, result.status);
  }

  @Get('address/:customerAddressId')
  @ApiOperation({ summary: 'Find address binding info' })
  @ApiResponse({ status: 200, description: 'Address binding info returned' })
  async findAddressBindingInfo(@Param('customerAddressId') customerAddressId: string) {
    const result = await this.deliveryService.findAddressBindingInfo(Number(customerAddressId));
    return this.formatResponse(result, result.status);
  }

  @Post('address')
  @ApiOperation({ summary: 'Create customer address' })
  @ApiResponse({ status: 201, description: 'Customer address created' })
  async createCustomerAddress(@Body() body: { addressInfos: CreateCustomerAddressDto; addressId?: number }) {
    const result = await this.deliveryService.createCustomerAddress(body.addressInfos, body.addressId);
    return this.formatResponse(result, result.status);
  }
}
