import { Injectable } from '@nestjs/common';
import { CommodityRepository } from './commodity.repository';
import { CustomerRepository } from '../customer/customer.repository';
import { ServiceBase } from '@artifact/lpg-api-service';
import { httpStatus } from '@artifact/aurora-api-core';

@Injectable()
export class CommodityService extends ServiceBase {
  constructor(
    private readonly commodityRepository: CommodityRepository,
    private readonly customerRepository: CustomerRepository,
  ) {
    super();
  }

  async getCommodityList(customerId: number, supplierId?: string, commodityType?: string) {
    const customerInfo = await this.customerRepository.findCustomerInSuppliers(customerId, supplierId);
    const result = await this.commodityRepository.getCommodityList(
      customerInfo?.supplier_id || supplierId || 'GS_1',
      commodityType
    );
    return this.formatMessage(result, httpStatus.OK);
  }

  async getCommodityTypes(customerId: number, supplierId?: string) {
    const customerInfo = await this.customerRepository.findCustomerInSuppliers(customerId, supplierId);
    const result = await this.commodityRepository.getCommodityTypes(
      customerInfo?.supplier_id || supplierId || 'GS_1'
    );
    return this.formatMessage(result, httpStatus.OK);
  }
}
