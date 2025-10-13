import { OrderRefundType, WorkOrderPayWayEnum } from '@artifact/lpg-api-service';
import { Expose, Type } from 'class-transformer';

import { OrderBaseInfoResDto } from './order-base-res.dto.js';

class CustomerInfoResDto {
  @Expose({ name: 'customer_id' })
  customerId!: number;

  @Expose({ name: 'invoice_carrier' })
  invoiceCarrier!: string;

  @Expose({ name: 'carrier_type' })
  carrierType!: string;
}

class CustomerInSuppliersInfoResDto {
  @Expose({ name: 'cis_id' })
  cisId!: string;

  @Type(() => CustomerInfoResDto)
  @Expose({ name: 'customer_info' })
  customerInfo!: CustomerInfoResDto;
}

/** 付款資料 */
class BillOfSaleWorkInfoResDto {
  @Expose({ name: 'bill_of_sale_work_id' })
  billOfSaleWorkId!: number;

  @Expose({ name: 'create_time_stamp' })
  createTimeStamp!: string;
}

class OrderPayupWorkResDto {
  @Expose({ name: 'order_payup_work_id' })
  orderPayupWorkId!: number;

  @Expose({ name: 'pay_way' })
  payWay!: WorkOrderPayWayEnum;

  @Type(() => BillOfSaleWorkInfoResDto)
  @Expose({ name: 'bill_of_sale_work_info' })
  billOfSaleWorkInfo!: BillOfSaleWorkInfoResDto;
}

class OrderPayupListResDto {
  @Expose({ name: 'order_payup_id' })
  orderPayupId!: number;

  @Expose({ name: 'payment_amount' })
  paymentAmount!: number;

  @Expose({ name: 'is_arrears_order' })
  isArrearsOrder!: boolean;

  @Type(() => OrderPayupWorkResDto)
  @Expose({ name: 'order_payup_work_info' })
  orderPayupWorkInfo!: OrderPayupWorkResDto;
}

class OrderRefundListResDto {
  @Expose({ name: 'order_refund_id' })
  orderRefundId!: number;

  @Expose({ name: 'refund_gas_kilogram' })
  refundGasKilogram!: number;

  @Expose({ name: 'refund_gas_type' })
  refundGasType!: string;

  @Expose({ name: 'gas_price' })
  gasPrice!: number;

  @Expose({ name: 'order_refund_type' })
  orderRefundType!: OrderRefundType;
}

export class OrderInfoResDto extends OrderBaseInfoResDto {
  @Type(() => CustomerInSuppliersInfoResDto)
  @Expose({ name: 'customerInSupplier' })
  customerInSupplier!: CustomerInSuppliersInfoResDto;

  @Type(() => OrderRefundListResDto)
  @Expose({ name: 'order_refund_list' })
  orderRefundList!: OrderRefundListResDto[];

  @Type(() => OrderPayupListResDto)
  @Expose({ name: 'order_payup_list' })
  orderPayupList!: OrderPayupListResDto[];
}
