import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CustomerAddressListResDto {
  @ApiProperty({ description: 'Customer address ID' })
  @Expose({ name: 'customer_address_id' })
  customerAddressId!: number;

  @ApiProperty({ description: 'Customer ID' })
  @Expose({ name: 'customer_id' })
  customerId!: number;

  @ApiProperty({ description: 'City', nullable: true })
  @Expose({ name: 'city' })
  city!: string | null;

  @ApiProperty({ description: 'Site ID', nullable: true })
  @Expose({ name: 'site_id' })
  siteId!: string | null;

  @ApiProperty({ description: 'Village', nullable: true })
  @Expose({ name: 'village' })
  village!: string | null;

  @ApiProperty({ description: 'Neighborhood', nullable: true })
  @Expose({ name: 'neighborhood' })
  neighborhood!: string | null;

  @ApiProperty({ description: 'Road', nullable: true })
  @Expose({ name: 'road' })
  road!: string | null;

  @ApiProperty({ description: 'Section', nullable: true })
  @Expose({ name: 'section' })
  section!: string | null;

  @ApiProperty({ description: 'Alley', nullable: true })
  @Expose({ name: 'alley' })
  alley!: string | null;

  @ApiProperty({ description: 'Lane', nullable: true })
  @Expose({ name: 'lane' })
  lane!: string | null;

  @ApiProperty({ description: 'Address number', nullable: true })
  @Expose({ name: 'address_number' })
  addressNumber!: string | null;

  @ApiProperty({ description: 'Floor', nullable: true })
  @Expose({ name: 'floor' })
  floor!: string | null;

  @ApiProperty({ description: 'Room', nullable: true })
  @Expose({ name: 'room' })
  room!: string | null;

  @ApiProperty({ description: 'Extra', nullable: true })
  @Expose({ name: 'extra' })
  extra!: string | null;

  @ApiProperty({ description: 'Latitude' })
  @Expose({ name: 'latitude' })
  latitude!: number;

  @ApiProperty({ description: 'Longitude' })
  @Expose({ name: 'longitude' })
  longitude!: number;
}

export class CustomerInfoResDto {
  @ApiProperty({ description: 'Customer ID' })
  @Expose({ name: 'customer_id' })
  customerId!: number;

  @ApiProperty({ description: 'Customer name' })
  @Expose({ name: 'customer_name' })
  customerName!: string;

  @ApiProperty({ description: 'Main phone' })
  @Expose({ name: 'main_phone' })
  mainPhone!: string;

  @ApiProperty({ description: 'Tax ID number' })
  @Expose({ name: 'tax_id_number' })
  taxIdNumber!: string;

  @ApiProperty({ description: 'Account status' })
  @Expose({ name: 'account_status' })
  accountStatus!: string;

  @ApiProperty({ description: 'Close time stamp' })
  @Expose({ name: 'close_time_stamp' })
  closeTimeStamp!: string;

  @ApiProperty({ description: 'Customer address list', type: [CustomerAddressListResDto] })
  @Type(() => CustomerAddressListResDto)
  @Expose({ name: 'customer_address_list' })
  customerAddressList!: CustomerAddressListResDto[];
}

export class CustomerInSuppliersResDto {
  @ApiProperty({ description: 'CIS ID' })
  @Expose({ name: 'cis_id' })
  cisId!: string;

  @ApiProperty({ description: 'Customer ID' })
  @Expose({ name: 'customer_id' })
  customerId!: number;

  @ApiProperty({ description: 'Supplier ID' })
  @Expose({ name: 'supplier_id' })
  supplierId!: string;

  @ApiProperty({ description: 'Authentication code' })
  @Expose({ name: 'authentication_code' })
  authenticationCode!: string;

  @ApiProperty({ description: 'Invoice carrier' })
  @Expose({ name: 'invoice_carrier' })
  invoiceCarrier!: string;

  @ApiProperty({ description: 'Carrier type' })
  @Expose({ name: 'carrier_type' })
  carrierType!: string;

  @ApiProperty({ description: 'Customer info', type: CustomerInfoResDto })
  @Type(() => CustomerInfoResDto)
  @Expose({ name: 'customer_info' })
  customerInfo!: CustomerInfoResDto;
}
