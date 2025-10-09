import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CustomerInfoResDto {
  @ApiProperty({ required: false, example: 123 })
  @IsOptional()
  @IsNumber()
  @Expose({ name: 'customer_id' })
  customerId?: number;

  @ApiProperty({ required: false, example: 'Acme Corp.' })
  @IsOptional()
  @IsString()
  @Expose({ name: 'customer_name' })
  customerName?: string;

  @ApiProperty({ required: false, example: '0912-345-678' })
  @IsOptional()
  @IsString()
  @Expose({ name: 'main_phone' })
  mainPhone?: string;

  @ApiProperty({ required: false, example: '12345678' })
  @IsOptional()
  @IsString()
  @Expose({ name: 'tax_id_number' })
  taxIdNumber?: string;
}

export class SupplierInfoResDto {
  @ApiProperty({ required: false, example: 456 })
  @IsOptional()
  @Expose({ name: 'supplier_id' })
  supplierId?: any;

  @ApiProperty({ required: false, example: 'Best Gas Supplier' })
  @IsOptional()
  @IsString()
  @Expose({ name: 'supplier_name' })
  supplierName?: string;

  @ApiProperty({ required: false, example: '123 Main St' })
  @IsOptional()
  @IsString()
  @Expose({ name: 'supplier_address' })
  supplierAddress?: string;

  @ApiProperty({ required: false, example: 'Taipei' })
  @IsOptional()
  @IsString()
  @Expose({ name: 'supplier_city' })
  supplierCity?: string;

  @ApiProperty({ required: false, example: 'A1' })
  @IsOptional()
  @IsString()
  @Expose({ name: 'supplier_site_id' })
  supplierSiteId?: string;

  @ApiProperty({ required: false, example: 'Xinyi' })
  @IsOptional()
  @IsString()
  @Expose({ name: 'supplier_section' })
  supplierSection?: string;

  @ApiProperty({ required: false, example: '02-12345678' })
  @IsOptional()
  @IsString()
  @Expose({ name: 'phone' })
  phone?: string;

  @ApiProperty({ required: false, example: '87654321' })
  @IsOptional()
  @IsString()
  @Expose({ name: 'tax_id_number' })
  taxIdNumber?: string;

  @ApiProperty({ required: false, example: 'R-0001' })
  @IsOptional()
  @IsString()
  @Expose({ name: 'register_number' })
  registerNumber?: string;
}

export class CustomerOrSupplierInfoResDto {
  @ApiProperty({ type: () => CustomerInfoResDto })
  @Type(() => CustomerInfoResDto)
  @Expose()
  customer!: CustomerInfoResDto;

  @ApiProperty({ type: () => SupplierInfoResDto })
  @Type(() => SupplierInfoResDto)
  @Expose()
  supplier!: SupplierInfoResDto;
}


