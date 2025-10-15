import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegisterController } from './register.controller';
import { RegisterService } from './register.service';
import { RegisterRepository } from './register.repository';
import { CustomerInSuppliers, Supplier } from '@artifact/lpg-api-service';

@Module({
  imports: [TypeOrmModule.forFeature([Supplier, CustomerInSuppliers])],
  controllers: [RegisterController],
  providers: [RegisterService, RegisterRepository],
  exports: [RegisterService],
})
export class RegisterModule {}


