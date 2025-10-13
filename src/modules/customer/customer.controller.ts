import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CustomerService } from './customer.service';
import { CustomerInSuppliersResDto } from './dto/customer-info-res.dto';
import { ControllerBase, httpStatus } from '@artifact/aurora-api-core';
import { plainToClass } from 'class-transformer';

@ApiTags('Customer')
@ApiBearerAuth()
@Controller('customer')
export class CustomerController extends ControllerBase{
  constructor(private readonly customerService: CustomerService) {
    super();
  }

  @Get('suppliers')
  @ApiOperation({ summary: 'Find customer in suppliers' })
  @ApiQuery({ name: 'supplierId', required: false, description: 'Supplier ID filter' })
  @ApiResponse({ status: 200, description: 'Customer in suppliers info returned', type: CustomerInSuppliersResDto })
  async findCustomerInSuppliers(
    @Query('supplierId') supplierId?: string,
  ) {
    // TODO: 需要從 JWT token 中取得 customerId
    const customerId = 1; // 暫時硬編碼，需要實作 JWT 解析
    const result = await this.customerService.findCustomerInSuppliers(customerId, supplierId);
    const customerInSuppliersResDto = plainToClass(CustomerInSuppliersResDto, result.data, {
      excludeExtraneousValues: true,
    });
    return this.formatResponse(customerInSuppliersResDto, result.status);
  }
}
