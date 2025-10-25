import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerInSuppliers } from '@artifact/lpg-api-service';

@Injectable()
export class LineAuthRepository {
  constructor(
    @InjectRepository(CustomerInSuppliers)
    private readonly customerInSuppliersRepository: Repository<CustomerInSuppliers>
  ) {}

  public async getCustomerInSuppliersByAuthenticationCode(authenticationCode: string) {
    
    const customerInSuppliers = await this.customerInSuppliersRepository.findOne({
      where: {
        authentication_code: authenticationCode,
      },
    });
    
    return customerInSuppliers;
  }
}