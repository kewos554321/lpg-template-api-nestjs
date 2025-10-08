import { Injectable } from '@nestjs/common';
import { CommodityModel } from './commodity.model';
import { CustomerModel } from '../customer/customer.model';

@Injectable()
export class CommodityService {
  constructor(
    private readonly commodityModel: CommodityModel,
    private readonly customerModel: CustomerModel,
  ) {}

  async getCommodityList(customerId: number, supplierId?: string, commodityType?: string) {
    const customerInfo = await this.customerModel.findCustomerInSuppliers(customerId, supplierId);
    const result = await this.commodityModel.getCommodityList(
      customerInfo?.supplier_id || supplierId || 'GS_1',
      commodityType
    );
    return result;
  }

  async getCommodityTypes(customerId: number, supplierId?: string) {
    const customerInfo = await this.customerModel.findCustomerInSuppliers(customerId, supplierId);
    const result = await this.commodityModel.getCommodityTypes(
      customerInfo?.supplier_id || supplierId || 'GS_1'
    );
    return result;
  }
}
