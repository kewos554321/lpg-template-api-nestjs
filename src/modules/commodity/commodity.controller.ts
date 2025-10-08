import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CommodityService } from './commodity.service';
import { CommodityListResDto } from './dto/commodity-list-res.dto';

@ApiTags('Commodity')
@ApiBearerAuth()
@Controller('commodity')
export class CommodityController {
  constructor(private readonly commodityService: CommodityService) {}

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
    return this.commodityService.getCommodityList(customerId, supplierId, commodityType);
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
    return this.commodityService.getCommodityTypes(customerId, supplierId);
  }
}
