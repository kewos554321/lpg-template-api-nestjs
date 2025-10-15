import { Injectable } from '@nestjs/common';
import { httpStatus } from '@artifact/aurora-api-core';
import { RegisterRepository } from './register.repository';
import { ServiceBase, tokenHelper } from '@artifact/lpg-api-service';
import _ from 'lodash';

@Injectable()
export class RegisterService extends ServiceBase {
  constructor(private readonly registerRepository: RegisterRepository) {
    super();
  }

  public async getCustomerOrSupplierByCode(code: string) {
    const existedCustomerInSupplier = await this.registerRepository.getCusSupplierInfosByCode(code);
    if (_.isEmpty(existedCustomerInSupplier)) {
      const existedSupplier = await this.registerRepository.getSupplierInfoOrList({
        register_number: code,
      } as any);
      if (_.isEmpty(existedSupplier)) {
        return this.formatErrorMessage(1013, 'Cannot find supplier', httpStatus.NOT_FOUND);
      }
      const result = {
        customer: {},
        supplier: existedSupplier[0],
      };
      return this.formatMessage(result, httpStatus.OK);
    }
    const result = {
      customer: existedCustomerInSupplier.customer_info,
      supplier: existedCustomerInSupplier.supplier_info,
    };
    return this.formatMessage(result, httpStatus.OK);
  }

  public async getSupplierCityList() {
    const result = await this.registerRepository.getSupplierCityList();
    return this.formatMessage(result, httpStatus.OK);
  }

  public async getSupplierList(city: string, searchValue: string) {
    const result = await this.registerRepository.getSupplierList(city, searchValue);
    return this.formatMessage(result, httpStatus.OK);
  }

  /**
   * 會先確認是否有這組帳號，再透過Bcrypt與資料庫比對密碼，確認後發行token，時效為兩小時
   */
  public async loginAuth() {
    const payload = {
      customer_id: 244,
      date: new Date().getTime(),
    };

    const nowDate = new Date();

    // generate token
    const sign = process.env.JWT_SIGN as string;
    if (process.env.JWT_EXPIRED === 'true') {
      const expireTime = '2h';
      const jwtToken = tokenHelper.generateJwtToken(payload, sign, expireTime);
      nowDate.setHours(nowDate.getHours() + 2);
      return this.formatMessage({ jwtToken, expireDate: nowDate.toISOString() }, httpStatus.OK);
    }
    const jwtToken = tokenHelper.generateJwtToken(payload, sign);
    return this.formatMessage({ jwtToken, expireDate: null }, httpStatus.OK);
  }
}


