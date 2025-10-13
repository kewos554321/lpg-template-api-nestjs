import { Expose, Type } from 'class-transformer';

class GasCylinderInfo {
  @Expose({ name: 'gas_id' })
  gasId!: number;

  @Expose({ name: 'kilogram' })
  kilogram!: number;

  @Expose({ name: 'gas_type' })
  gasType!: string;
}

export class GasPriceListResDto {
  @Expose({ name: 'gp_id' })
  gpId!: number;

  @Expose({ name: 'cis_gp_id' })
  cisGpId!: number;

  @Expose({ name: 'price' })
  price!: number;

  @Type(() => GasCylinderInfo)
  @Expose({ name: 'gas_cylinder_info' })
  gasCylinderInfo!: GasCylinderInfo;
}
