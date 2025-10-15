import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryRunner } from 'typeorm';
import { typeormHelper } from '@artifact/lpg-api-service';
import { CustomerAddress, CustomerDelivery } from '@artifact/lpg-api-service';
import { AddressBinding } from '@artifact/lpg-api-service/dist/database/entities/address_binding';

@Injectable()
export class DeliveryRepository {
  constructor(
    @InjectRepository(CustomerAddress)
    private readonly customerAddressRepository: Repository<CustomerAddress>,
    @InjectRepository(CustomerDelivery)
    private readonly customerDeliveryRepository: Repository<CustomerDelivery>,
    @InjectRepository(AddressBinding)
    private readonly addressBindingRepository: Repository<AddressBinding>,
  ) {}

  public async getCustomerAddressList(customerId: number) {
    const customerAddressResult = await this.customerAddressRepository
      .createQueryBuilder('customer_address')
      .leftJoinAndSelect('customer_address.customerDeliveryList', 'customerDeliveryList')
      .select()
      .where('customer_address.customer_id = :customerId', { customerId })
      .andWhere('customer_address.deleted = :deleted', { deleted: false })
      .getMany();

    return customerAddressResult;
  }

  public async getCustomerDeliveryList(customerAddressId: number) {
    const customerDeliveryResult = await this.customerDeliveryRepository
      .createQueryBuilder('customer_delivery')
      .select()
      .where('customer_delivery.customer_address_id = :customerAddressId', { customerAddressId })
      .andWhere('customer_delivery.deleted = :deleted', { deleted: false })
      .getMany();

    return customerDeliveryResult;
  }

  public async findAddressBindingInfo(customerAddressId: number) {
    const addressBindResult = await this.addressBindingRepository
      .createQueryBuilder('address_binding')
      .select()
      .leftJoinAndSelect('address_binding.customerAddressInfo', 'customerAddress')
      .leftJoin('address_binding.addressInfo', 'address')
      .where('address_binding.customerAddressId = :customerAddressId', { customerAddressId })
      .andWhere('address.deleted = :deleted', { deleted: false })
      .andWhere('customerAddress.deleted = :deleted', { deleted: false })
      .getOne();

    return addressBindResult;
  }

  public async createCustomerAddress(
    customerAddress: Partial<CustomerAddress>,
    addressId?: number
  ) {
    const cb = async (queryRunner: QueryRunner) => {
      const customerAddressResult = await queryRunner.manager.insert(
        CustomerAddress,
        customerAddress
      );
      const addressBindingResult = addressId
        ? await queryRunner.manager.insert(AddressBinding, {
            customerAddressId: customerAddressResult.identifiers[0]!.customer_address_id,
            addressId,
          })
        : null;

      return {
        customerAddressResult,
        addressBindingResult,
      };
    };

    const result = await typeormHelper.databaseTransaction(cb);
    return result;
  }
}


