import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CommodityService } from './commodity.service';
import { CommodityListResDto } from './dto/commodity-list-res.dto';
import { ControllerBase, httpStatus } from '@artifact/aurora-api-core';

@ApiTags('Commodity')
@ApiBearerAuth()
@Controller('commodity')
export class CommodityController extends ControllerBase {
  constructor(private readonly commodityService: CommodityService) {
    super();
  }

  @Get('list')
  @ApiOperation({ summary: 'Get commodity list' })
  @ApiQuery({ name: 'commodityType', required: false, description: 'Commodity type filter' })
  @ApiQuery({ name: 'supplierId', required: false, description: 'Supplier ID filter' })
  @ApiResponse({ status: 200, description: 'Commodity list returned', type: [CommodityListResDto] })
  async getCommodityList(
    @Query('commodityType') commodityType?: string,
    @Query('supplierId') supplierId?: string,
  ) {
    // TODO: 需要從 JWT token 中取得 customerId
    const customerId = 1; // 暫時硬編碼，需要實作 JWT 解析
    const result = await this.commodityService.getCommodityList(customerId, supplierId, commodityType);
    return this.formatResponse(result, result.status);
  }

  @Get('types')
  @ApiOperation({ summary: 'Get commodity types' })
  @ApiQuery({ name: 'supplierId', required: false, description: 'Supplier ID filter' })
  @ApiResponse({ status: 200, description: 'Commodity types returned' })
  async getCommodityTypes(
    @Query('supplierId') supplierId?: string,
  ) {
    // TODO: 需要從 JWT token 中取得 customerId
    const customerId = 1; // 暫時硬編碼，需要實作 JWT 解析
    const result = await this.commodityService.getCommodityTypes(customerId, supplierId);
    return this.formatResponse(result, result.status);
  }
}
