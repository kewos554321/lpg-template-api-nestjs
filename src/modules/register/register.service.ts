import { Injectable } from '@nestjs/common';
import { RegisterModel } from './register.model';

@Injectable()
export class RegisterService {
  constructor(private readonly registerModel: RegisterModel) {}

  public async getCustomerOrSupplierByCode(code: string) {
    const existedCustomerInSupplier = await this.registerModel.getCusSupplierInfosByCode(code);
    if (existedCustomerInSupplier === null) {
      const existedSupplier = await this.registerModel.getSupplierInfoOrList({
        register_number: code,
      } as any);
      if (!existedSupplier || existedSupplier.length === 0) {
        return { data: { message: 'Cannot find supplier' }, status: 404 };
      }
      const result = {
        customer: {},
        supplier: existedSupplier[0],
      };
      return { data: result, status: 200 };
    }
    const result = {
      customer: existedCustomerInSupplier.customer_info,
      supplier: existedCustomerInSupplier.supplier_info,
    };
    return { data: result, status: 200 };
  }

  public async getSupplierCityList() {
    const result = await this.registerModel.getSupplierCityList();
    return { data: result, status: 200 };
  }

  public async getSupplierList(city: string, searchValue: string) {
    const result = await this.registerModel.getSupplierList(city, searchValue);
    return { data: result, status: 200 };
  }

  public async loginAuth() {
    // Keep same behavior as express service, but without token generation dependency.
    // Caller (controller) ensures this is for demo/testing only.
    const payload = {
      customer_id: 244,
      date: new Date().getTime(),
    };
    return { data: { jwtToken: JSON.stringify(payload), expireDate: null }, status: 200 };
  }
}


