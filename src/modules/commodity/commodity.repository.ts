import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Commodity, CommodityPrice } from '@artifact/lpg-api-service';
import _ from 'lodash';

@Injectable()
export class CommodityRepository {
  constructor(
    @InjectRepository(Commodity) private readonly commodityRepository: Repository<Commodity>,
    @InjectRepository(CommodityPrice) private readonly commodityPriceRepository: Repository<CommodityPrice>,
  ) {}

  public async getCommodityList(supplierId: string, commodityType?: string) {
    const maxCommodityPriceSubQuery = this.commodityPriceRepository
      .createQueryBuilder('commodity_price')
      .select(['commodity_price.commodity_id, Max(commodity_price.create_time_stamp)'])
      .leftJoin('commodity_price.commodity_info', 'commodity')
      .where('commodity.supplier_id = :supplierId')
      .andWhere('commodity_price.deleted = :commodityPriceDeleted')
      .groupBy('commodity_price.commodity_id');

    const commodityModel = this.commodityRepository
      .createQueryBuilder('commodity')
      .select()
      .leftJoinAndSelect('commodity.commodity_latest_price', 'commodity_latest_price')
      .where('commodity.supplier_id = :supplierId', { supplierId })
      .andWhere('commodity.deleted = :commodityDeleted', { commodityDeleted: false })
      .andWhere('commodity.visible = :visible', { visible: true })
      .andWhere('commodity.instock = :instock', { instock: true })
      .andWhere('commodity_latest_price.deleted = :commodityPriceDeleted', {
        commodityPriceDeleted: false,
      })
      .andWhere(
        `(commodity_latest_price.commodity_id, commodity_latest_price.create_time_stamp) In(${maxCommodityPriceSubQuery.getSql()})`,
        { commodityPriceDeleted: false }
      )
      .orderBy('commodity.commodity_name', 'ASC');
    if (!_.isUndefined(commodityType)) {
      commodityModel.andWhere('commodity.commodity_type = :commodityType', { commodityType });
    }

    const result = await commodityModel.getMany();
    return result;
  }

  public async getCommodityTypes(supplierId: string) {
    const result = await this.commodityRepository
      .createQueryBuilder('commodity')
      .select(['commodity.commodity_type as commodityType'])
      .where('commodity.supplier_id = :supplierId', { supplierId })
      .andWhere('commodity.deleted = :deleted', { deleted: false })
      .andWhere('commodity.visible = :visible', { visible: true })
      .andWhere('commodity.instock = :instock', { instock: true })
      .groupBy('commodity.commodity_type')
      .getRawMany();

    return result;
  }
}


