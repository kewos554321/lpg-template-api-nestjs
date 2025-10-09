import { Controller, Get, Post, Query, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { plainToClass } from 'class-transformer';
import { CustomerOrSupplierInfoResDto, SupplierInfoResDto } from './dto/register-res.dto';
import { RegisterService } from './register.service';

@ApiTags('Register')
@Controller('register')
export class RegisterController {
  constructor(private readonly registerService: RegisterService) {}

  @Get('search/check')
  @ApiOperation({ summary: 'Get customer or supplier by code' })
  @ApiQuery({ name: 'code', required: true })
  async getCustomerOrSupplierByCode(@Query('code') code?: string) {
    if (!code) {
      throw new BadRequestException('Please check your query.');
    }
    const result = await this.registerService.getCustomerOrSupplierByCode(code);
    const data = plainToClass(CustomerOrSupplierInfoResDto, result.data, {
      excludeExtraneousValues: true,
    });
    return data;
  }

  @Get('search/list-city')
  @ApiOperation({ summary: 'Get supplier city list' })
  async getSupplierCityList() {
    const result = await this.registerService.getSupplierCityList();
    return result.data;
  }

  @Get('search/list')
  @ApiOperation({ summary: 'Get supplier list' })
  @ApiQuery({ name: 'city', required: true })
  @ApiQuery({ name: 'searchValue', required: false })
  async getSupplierList(@Query('city') city?: string, @Query('searchValue') searchValue?: string) {
    if (!city) {
      throw new BadRequestException('Please check your param.');
    }
    const result = await this.registerService.getSupplierList(city, searchValue || '');
    const data = result.data.map((item: any) =>
      plainToClass(SupplierInfoResDto, item, { excludeExtraneousValues: true }),
    );
    return data;
  }

  @Post('login')
  @ApiOperation({ summary: 'Login (issue JWT)' })
  async loginAuth() {
    const result = await this.registerService.loginAuth();
    return result.data;
  }
}


