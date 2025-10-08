import { Injectable } from '@nestjs/common';
import { deliveryHelper } from '@artifact/lpg-api-service';

import { DeliveryModel } from './delivery.model';
import { CreateCustomerAddressInterface } from './interface/create-delivery.interface';

@Injectable()
export class DeliveryService {
  constructor(private readonly deliveryModel: DeliveryModel) {}

  async getCustomerAddressList(customerId: number) {
    const result = await this.deliveryModel.getCustomerAddressList(customerId);
    return result;
  }

  async getCustomerDeliveryList(customerAddressId: number) {
    const result = await this.deliveryModel.getCustomerDeliveryList(customerAddressId);
    return result;
  }

  async findAddressBindingInfo(customerAddressId: number) {
    const result = await this.deliveryModel.findAddressBindingInfo(customerAddressId);
    return result;
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
    return result.transaction_data;
  }
}
