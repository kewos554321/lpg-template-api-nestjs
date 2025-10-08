import { Injectable } from '@nestjs/common';
import { CustomerModel } from './customer.model';

@Injectable()
export class CustomerService {
  constructor(private readonly customerModel: CustomerModel) {}

  async findCustomerInSuppliers(customerId: number, supplierId?: string) {
    const customerResult = await this.customerModel.findCustomerInSuppliers(customerId, supplierId);
    return customerResult;
  }
}
