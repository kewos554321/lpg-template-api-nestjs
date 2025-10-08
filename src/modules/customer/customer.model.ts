import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerInSuppliers, CustomerStatusEnum } from '@artifact/lpg-api-service';

@Injectable()
export class CustomerModel {
  constructor(
    @InjectRepository(CustomerInSuppliers) private readonly customerInSuppliersRepository: Repository<CustomerInSuppliers>,
  ) {}

  public async findCustomerInSuppliers(customerId: number, supplierId?: string) {
    const customerInSuppliersQuery = this.customerInSuppliersRepository
      .createQueryBuilder('customer_in_suppliers')
      .select()
      .leftJoinAndSelect('customer_in_suppliers.customer_info', 'customer')
      .leftJoinAndSelect('customer.customer_address_list', 'customer_address_list')
      .where('customer_in_suppliers.customer_id = :customerId', { customerId })
      .andWhere('customer_in_suppliers.customer_status != :customerStatus', {
        customerStatus: CustomerStatusEnum.unbind,
      });
    if (supplierId) {
      customerInSuppliersQuery.andWhere('customer_in_suppliers.supplier_id = :supplierId', {
        supplierId,
      });
    }

    const customerResult = await customerInSuppliersQuery.getOne();
    return customerResult;
  }
}
