import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { CustomerInSuppliers, Supplier } from '@artifact/lpg-api-service';

@Injectable()
export class RegisterModel {
  constructor(
    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,
    @InjectRepository(CustomerInSuppliers)
    private readonly cusSupplierRepository: Repository<CustomerInSuppliers>,
  ) {}

  public async getSupplierInfoOrList(filterRule?: Partial<Supplier>) {
    const rule = filterRule ?? {};
    const result = await this.supplierRepository.findBy(rule as any);
    return result;
  }

  public async getSupplierCityList() {
    const result = await this.supplierRepository
      .createQueryBuilder('supplier')
      .select('Distinct (supplier.supplier_city)', 'city')
      .where('supplier.supplier_city IS NOT NULL')
      .getRawMany();
    return result;
  }

  public async getSupplierList(city: string, searchValue: string) {
    const supplierListModel = this.supplierRepository
      .createQueryBuilder('supplier')
      .where('supplier.supplier_city = :city', { city });
    if (searchValue) {
      supplierListModel.andWhere(
        new Brackets((qb) => {
          qb.where('supplier.supplier_address LIKE :searchValue', {
            searchValue: `%${searchValue}%`,
          })
            .orWhere('supplier.supplier_name LIKE :searchValue', {
              searchValue: `%${searchValue}%`,
            })
            .orWhere('supplier.phone LIKE :searchValue', { searchValue: `%${searchValue}%` });
        }),
      );
    }
    const result = await supplierListModel.getMany();
    return result;
  }

  public async getCusSupplierInfosByCode(authenticationCode: string) {
    const result = await this.cusSupplierRepository
      .createQueryBuilder('customer_in_suppliers')
      .select()
      .leftJoinAndSelect('customer_in_suppliers.customer_info', 'customer')
      .leftJoinAndSelect('customer_in_suppliers.supplier_info', 'supplier')
      .where('customer_in_suppliers.authentication_code = :authenticationCode', {
        authenticationCode,
      })
      .getOne();
    return result;
  }
}


