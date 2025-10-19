import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { Expose } from 'class-transformer';

export class LineLoginRequestDto {
  @ApiProperty({ description: 'LINE authorization code from callback' })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiProperty({ description: 'State parameter for security', required: false })
  @IsOptional()
  @IsString()
  state?: string;
}

export class LineUserProfileDto {
  @ApiProperty({ description: 'LINE user ID' })
  @Expose({ name: 'userId' })
  userId!: string;

  @ApiProperty({ description: 'Display name' })
  @Expose({ name: 'displayName' })
  displayName!: string;

  @ApiProperty({ description: 'Profile picture URL', required: false })
  @Expose({ name: 'pictureUrl' })
  pictureUrl?: string;

  @ApiProperty({ description: 'Status message', required: false })
  @Expose({ name: 'statusMessage' })
  statusMessage?: string;
}

export class LineAuthResponseDto {
  @ApiProperty({ description: 'JWT token for authenticated user' })
  @Expose()
  jwtToken!: string;

  @ApiProperty({ description: 'Token expiration date' })
  @Expose()
  expireDate!: string;

  @ApiProperty({ description: 'User profile information', type: LineUserProfileDto })
  @Expose()
  userProfile!: LineUserProfileDto;

  @ApiProperty({ description: 'Whether this is a new user registration' })
  @Expose()
  isNewUser!: boolean;
}

export class LineLoginUrlDto {
  @ApiProperty({ description: 'LINE login URL for user authorization' })
  loginUrl!: string;

  @ApiProperty({ description: 'State parameter for security' })
  state!: string;
}
