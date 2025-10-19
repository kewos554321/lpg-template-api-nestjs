import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CustomerService } from './customer.service';
import { CustomerInSuppliersResDto } from './dto/customer-info-res.dto';
import { ControllerBase } from '@artifact/aurora-api-core';
import { plainToClass } from 'class-transformer';
import { AuthCustomer } from 'src/common/decorators/auth-customer.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@ApiTags('Customer')
@UseGuards(JwtAuthGuard)
@Controller('customer')
export class CustomerController extends ControllerBase{
  constructor(private readonly customerService: CustomerService) {
    super();
  }

  @Get('')
  @ApiOperation({ summary: 'Find customer in suppliers' })
  @ApiQuery({ name: 'supplierId', required: false, description: 'Supplier ID filter' })
  @ApiResponse({ status: 200, description: 'Customer in suppliers info returned', type: CustomerInSuppliersResDto })
  async findCustomerInSuppliers(
    @AuthCustomer() customer: any,
    @Query('supplierId') supplierId?: string,
  ) {
    const customerId = Number(customer.customer_id);
    const result = await this.customerService.findCustomerInSuppliers(customerId, supplierId);
    const customerInSuppliersResDto = plainToClass(CustomerInSuppliersResDto, result.data, {
      excludeExtraneousValues: true,
    });
    return this.formatResponse(customerInSuppliersResDto, result.status);
  }
}
