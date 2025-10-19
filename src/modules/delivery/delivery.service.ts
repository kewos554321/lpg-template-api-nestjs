import { Injectable } from '@nestjs/common';
import { deliveryHelper } from '@artifact/lpg-api-service';

import { DeliveryRepository } from './delivery.repository';
import { CreateCustomerAddressInterface } from './interface/create-delivery.interface';
import { ServiceBase } from '@artifact/lpg-api-service';
import { httpStatus } from '@artifact/aurora-api-core';

@Injectable()
export class DeliveryService extends ServiceBase {
  constructor(private readonly deliveryRepository: DeliveryRepository) {
    super();
  }

  async getCustomerAddressList(customerId: number) {
    const result = await this.deliveryRepository.getCustomerAddressList(customerId);
    return this.formatMessage(result, httpStatus.OK);
  }

  async getCustomerDeliveryList(customerAddressId: number) {
    const result = await this.deliveryRepository.getCustomerDeliveryList(customerAddressId);
    return this.formatMessage(result, httpStatus.OK);
  }

  async findAddressBindingInfo(customerAddressId: number) {
    const result = await this.deliveryRepository.findAddressBindingInfo(customerAddressId);
    return this.formatMessage(result, httpStatus.OK);
  }

  async createCustomerAddress(
    customerAddress: CreateCustomerAddressInterface,
    addressId?: number
  ) {
    const address = deliveryHelper.mergeToAddressString(customerAddress);
    const googleMapGeometry: any = await deliveryHelper.getGoogleMapGeometry(address);
    const result = await this.deliveryRepository.createCustomerAddress(
      {
        ...customerAddress,
        latitude: googleMapGeometry.results[0].geometry.location.lat,
        longitude: googleMapGeometry.results[0].geometry.location.lng,
      },
      addressId
    );

    return this.formatMessage(result, httpStatus.OK);
  }
}
