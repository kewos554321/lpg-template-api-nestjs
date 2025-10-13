import { Injectable } from '@nestjs/common';
import { CustomerModel } from './customer.model';
import { ServiceBase } from '@artifact/lpg-api-service';
import { httpStatus } from '@artifact/aurora-api-core';

@Injectable()
export class CustomerService extends ServiceBase {
  constructor(private readonly customerModel: CustomerModel) {
    super();
  }

  async findCustomerInSuppliers(customerId: number, supplierId?: string) {
    const customerResult = await this.customerModel.findCustomerInSuppliers(customerId, supplierId);
    return this.formatMessage(customerResult, httpStatus.OK);
  }
}
