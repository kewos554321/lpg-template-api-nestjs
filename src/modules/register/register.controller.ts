import { Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { plainToClass } from 'class-transformer';
import { CustomerOrSupplierInfoResDto, SupplierInfoResDto } from './dto/register-res.dto';
import { RegisterService } from './register.service';
import { ControllerBase, httpStatus } from '@artifact/aurora-api-core';
import _ from 'lodash';
@ApiTags('Register')
@Controller('register')
export class RegisterController extends ControllerBase{
  constructor(private readonly registerService: RegisterService) {
    super();
  }

  @Get('search/check')
  @ApiOperation({ summary: 'Get customer or supplier by code' })
  @ApiQuery({ name: 'code', required: true })
  async getCustomerOrSupplierByCode(@Query('code') code?: string) {
    if (_.isString(code)) {
      return this.formatResponse('Please check your query.', httpStatus.BAD_REQUEST);
    }
    const result = await this.registerService.getCustomerOrSupplierByCode(code);
    const customerOrSupplierInfoResDto = plainToClass(CustomerOrSupplierInfoResDto, result.data, {
      excludeExtraneousValues: true,
    });
    return this.formatResponse(customerOrSupplierInfoResDto, result.status);
  }

  @Get('search/list-city')
  @ApiOperation({ summary: 'Get supplier city list' })
  async getSupplierCityList() {
    const result = await this.registerService.getSupplierCityList();
    return this.formatResponse(result.data, result.status);
  }

  @Get('search/list')
  @ApiOperation({ summary: 'Get supplier list' })
  @ApiQuery({ name: 'city', required: true })
  @ApiQuery({ name: 'searchValue', required: false })
  async getSupplierList(@Query('city') city?: string, @Query('searchValue') searchValue?: string) {
    if (!city) {
      return this.formatResponse('Please check your param.', httpStatus.BAD_REQUEST);
    }
    const result = await this.registerService.getSupplierList(city, searchValue || '');
    const supplierInfoResDto = result.data.map((item: any) =>
      plainToClass(SupplierInfoResDto, item, { excludeExtraneousValues: true }),
    );
    return this.formatResponse(supplierInfoResDto, result.status);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login (issue JWT)' })
  async loginAuth() {
    const result = await this.registerService.loginAuth();
    return this.formatResponse(result.data, result.status);
  }
}


