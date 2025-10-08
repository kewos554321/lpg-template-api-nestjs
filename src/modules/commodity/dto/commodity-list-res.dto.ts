import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CommodityPriceInfoResDto {
  @ApiProperty({ description: 'Commodity price ID' })
  @Expose({ name: 'commodity_price_id' })
  commodityPriceId!: number;

  @ApiProperty({ description: 'Commodity ID' })
  @Expose({ name: 'commodity_id' })
  commodityId!: number;

  @ApiProperty({ description: 'Price' })
  @Expose({ name: 'price' })
  price!: number;
}

export class CommodityListResDto {
  @ApiProperty({ description: 'Commodity ID' })
  @Expose({ name: 'commodity_id' })
  commodityId!: number;

  @ApiProperty({ description: 'Commodity name' })
  @Expose({ name: 'commodity_name' })
  commodityName!: string;

  @ApiProperty({ description: 'Commodity introduction' })
  @Expose({ name: 'commodity_introduction' })
  commodityIntroduction!: string;

  @ApiProperty({ description: 'Commodity type' })
  @Expose({ name: 'commodity_type' })
  commodityType!: string;

  @ApiProperty({ description: 'Create time stamp' })
  @Expose({ name: 'create_time_stamp' })
  createTimeStamp!: string;

  @ApiProperty({ description: 'Commodity latest price', type: CommodityPriceInfoResDto })
  @Type(() => CommodityPriceInfoResDto)
  @Expose({ name: 'commodity_latest_price' })
  commodityLatestPrice!: CommodityPriceInfoResDto;
}
