import { Injectable } from '@nestjs/common';
import { CustomerRepository } from './customer.repository';
import { ServiceBase } from '@artifact/lpg-api-service';
import { httpStatus } from '@artifact/aurora-api-core';

@Injectable()
export class CustomerService extends ServiceBase {
  constructor(private readonly customerRepository: CustomerRepository) {
    super();
  }

  async findCustomerInSuppliers(customerId: number, supplierId?: string) {
    const customerResult = await this.customerRepository.findCustomerInSuppliers(customerId, supplierId);
    return this.formatMessage(customerResult, httpStatus.OK);
  }
}
