import { Injectable } from '@nestjs/common';
import { deliveryHelper } from '@artifact/lpg-api-service';

import { DeliveryModel } from './delivery.model';
import { CreateCustomerAddressInterface } from './interface/create-delivery.interface';
import { ServiceBase } from '@artifact/lpg-api-service';
import { httpStatus } from '@artifact/aurora-api-core';

@Injectable()
export class DeliveryService extends ServiceBase {
  constructor(private readonly deliveryModel: DeliveryModel) {
    super();
  }

  async getCustomerAddressList(customerId: number) {
    const result = await this.deliveryModel.getCustomerAddressList(customerId);
    return this.formatMessage(result, httpStatus.OK);
  }

  async getCustomerDeliveryList(customerAddressId: number) {
    const result = await this.deliveryModel.getCustomerDeliveryList(customerAddressId);
    return this.formatMessage(result, httpStatus.OK);
  }

  async findAddressBindingInfo(customerAddressId: number) {
    const result = await this.deliveryModel.findAddressBindingInfo(customerAddressId);
    return this.formatMessage(result, httpStatus.OK);
  }

  async createCustomerAddress(
    customerAddress: CreateCustomerAddressInterface,
    addressId?: number
  ) {
    const address = deliveryHelper.mergeToAddressString(customerAddress);
    const googleMapGeometry: any = await deliveryHelper.getGoogleMapGeometry(address);
    const result = await this.deliveryModel.createCustomerAddress(
      {
        ...customerAddress,
        latitude: googleMapGeometry.results[0].geometry.location.lat,
        longitude: googleMapGeometry.results[0].geometry.location.lng,
      },
      addressId
    );

    if (result.error === true) {
      throw new Error('Something wrong with database transaction.');
    }
    return this.formatMessage(result.transaction_data, httpStatus.OK);
  }
}
