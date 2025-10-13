import { Expose, Type } from 'class-transformer';

import { OrderBaseInfoResDto } from './order-base-res.dto.js';

class OrderListResDto extends OrderBaseInfoResDto {}

export class OrderListDataResDto {
  @Type(() => OrderListResDto)
  @Expose({ name: 'orderList' })
  orderList!: OrderListResDto[];

  @Expose({ name: 'rowsCount' })
  rowsCount!: number;
}
