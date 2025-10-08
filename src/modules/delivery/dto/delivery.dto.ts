import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCustomerAddressDto {
  @ApiProperty({ description: 'Customer ID', example: 1 })
  @IsNumber()
  customer_id: number;

  @ApiProperty({ description: 'City', example: 'Taipei', required: false })
  @IsOptional()
  @IsString()
  city?: string | null;

  @ApiProperty({ description: 'Site ID', example: '100', required: false })
  @IsOptional()
  @IsString()
  site_id?: string | null;

  @ApiProperty({ description: 'Village', example: 'Zhongshan District', required: false })
  @IsOptional()
  @IsString()
  village?: string | null;

  @ApiProperty({ description: 'Neighborhood', example: 'Xinyi District', required: false })
  @IsOptional()
  @IsString()
  neighborhood?: string | null;

  @ApiProperty({ description: 'Road', example: 'Zhongshan North Road', required: false })
  @IsOptional()
  @IsString()
  road?: string | null;

  @ApiProperty({ description: 'Section', example: 'Section 1', required: false })
  @IsOptional()
  @IsString()
  section?: string | null;

  @ApiProperty({ description: 'Lane', example: 'Lane 100', required: false })
  @IsOptional()
  @IsString()
  lane?: string | null;

  @ApiProperty({ description: 'Alley', example: 'Alley 10', required: false })
  @IsOptional()
  @IsString()
  alley?: string | null;

  @ApiProperty({ description: 'Address number', example: '123', required: false })
  @IsOptional()
  @IsString()
  address_number?: string | null;

  @ApiProperty({ description: 'Floor', example: '3F', required: false })
  @IsOptional()
  @IsString()
  floor?: string | null;

  @ApiProperty({ description: 'Room', example: 'Room 301', required: false })
  @IsOptional()
  @IsString()
  room?: string | null;

  @ApiProperty({ description: 'Extra information', example: 'Near MRT station', required: false })
  @IsOptional()
  @IsString()
  extra?: string | null;
}

export interface CreateCustomerAddressInterface {
  customer_id: number;
  city?: string | null;
  site_id?: string | null;
  village?: string | null;
  neighborhood?: string | null;
  road?: string | null;
  section?: string | null;
  alley?: string | null;
  lane?: string | null;
  address_number?: string | null;
  floor?: string | null;
  room?: string | null;
  extra?: string | null;
}
