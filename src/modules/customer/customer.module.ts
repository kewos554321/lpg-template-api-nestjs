import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';
import { CustomerModel } from './customer.model';
import { CustomerInSuppliers, Customer, CustomerAddress } from '@artifact/lpg-api-service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CustomerInSuppliers,
      Customer,
      CustomerAddress,
    ]),
  ],
  controllers: [CustomerController],
  providers: [CustomerService, CustomerModel],
  exports: [CustomerService, CustomerModel],
})
export class CustomerModule {}
