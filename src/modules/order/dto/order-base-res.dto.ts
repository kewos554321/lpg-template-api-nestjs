import {
  DeliveryTypeEnum,
  OrderDeliveryStatusEnum,
  OrderStatusEnum,
  TimeSlotEnum,
} from '@artifact/lpg-api-service';
import { Expose, Type } from 'class-transformer';

export class CustomerAddressInfoResDto {
  @Expose({ name: 'customer_address_id' })
  customerAddressId!: number;

  @Expose({ name: 'customer_id' })
  customerId!: number;

  @Expose({ name: 'city' })
  city!: string;

  @Expose({ name: 'site_id' })
  siteId!: string;

  @Expose({ name: 'village' })
  village!: string;

  @Expose({ name: 'neighborhood' })
  neighborhood!: string;

  @Expose({ name: 'road' })
  road!: string;

  @Expose({ name: 'section' })
  section!: string;

  @Expose({ name: 'lane' })
  lane!: string;

  @Expose({ name: 'address_number' })
  addressNumber!: string;

  @Expose({ name: 'floor' })
  floor!: string;

  @Expose({ name: 'extra' })
  extra!: string;

  @Expose({ name: 'latitude' })
  latitude!: number;

  @Expose({ name: 'longitude' })
  longitude!: number;
}

export class AddressBindingInfoResDto {
  @Expose({ name: 'addressBindingId' })
  addressBindingId!: number;

  @Expose({ name: 'addressId' })
  addressId!: number;

  @Type(() => CustomerAddressInfoResDto)
  @Expose({ name: 'customerAddressInfo' })
  customerAddressInfo!: CustomerAddressInfoResDto;

  @Expose({ name: 'address' })
  address!: string;
}

export class CourierInfoResDto {
  @Expose({ name: 'courier_id' })
  courierId!: string;

  @Expose({ name: 'courier_name' })
  courierName!: string;
}

export class CustomerDeliveryInfoResDto {
  @Expose({ name: 'customer_delivery_id' })
  customerDeliveryId!: number;

  @Expose({ name: 'delivery_location' })
  deliveryLocation!: string;

  @Expose({ name: 'usage_name' })
  usageName!: string;

  @Expose({ name: 'floor' })
  floor!: number;

  @Expose({ name: 'is_elevator' })
  isElevator!: boolean;
}

/** 瓦斯 */
export class GasCylinderInfoResDto {
  @Expose({ name: 'gas_id' })
  gasId!: number;

  @Expose({ name: 'kilogram' })
  kilogram!: number;

  @Expose({ name: 'gas_type' })
  gasType!: string;
}

export class GasPriceInfoResDto {
  @Expose({ name: 'gp_id' })
  gpId!: number;

  @Expose({ name: 'price' })
  price!: number;

  @Type(() => GasCylinderInfoResDto)
  @Expose({ name: 'gas_cylinder_info' })
  gasCylinderInfo!: GasCylinderInfoResDto;
}

export class CisGasPriceInfoResDto {
  @Expose({ name: 'cis_gp_id' })
  cisGpId!: number;

  @Expose({ name: 'price' })
  price!: number;

  @Type(() => GasCylinderInfoResDto)
  @Expose({ name: 'gas_cylinder_info' })
  gasCylinderInfo!: GasCylinderInfoResDto;
}

export class OrderGasListResDto {
  @Expose({ name: 'order_gas_id' })
  orderGasId!: number;

  @Expose({ name: 'numbers_of_cylinder' })
  numbersOfCylinder!: number;

  @Type(() => GasPriceInfoResDto)
  @Expose({ name: 'gas_price_info' })
  gasPriceInfo!: GasPriceInfoResDto;

  @Type(() => CisGasPriceInfoResDto)
  @Expose({ name: 'cis_gas_price_info' })
  cisGasPriceInfo!: CisGasPriceInfoResDto;

  @Type(() => CustomerDeliveryInfoResDto)
  @Expose({ name: 'customer_delivery_info' })
  customerDeliveryInfo!: CustomerDeliveryInfoResDto;
}

/** 商品 */
export class CommodityInfoResDto {
  @Expose({ name: 'commodity_id' })
  commodityId!: number;

  @Expose({ name: 'commodity_name' })
  commodityName!: string;

  @Expose({ name: 'commodity_introduction' })
  commodityIntroduction!: string;

  @Expose({ name: 'commodity_type' })
  commodityType!: string;
}

export class CommodityPriceInfoResDto {
  @Expose({ name: 'commodity_price_id' })
  commodityPriceId!: number;

  @Expose({ name: 'price' })
  price!: number;

  @Type(() => CommodityInfoResDto)
  @Expose({ name: 'commodity_info' })
  commodityInfo!: CommodityInfoResDto;
}

export class OrderCommodityListResDto {
  @Expose({ name: 'order_commodity_id' })
  orderCommodityId!: number;

  @Expose({ name: 'numbers_of_commodity' })
  numbersOfCommodity!: number;

  @Type(() => CommodityPriceInfoResDto)
  @Expose({ name: 'commodity_price_info' })
  commodityPriceInfo!: CommodityPriceInfoResDto;
}

/** 鋼瓶使用費 */
export class OrderUsageFeeListResDto {
  @Expose({ name: 'order_usage_fee_id' })
  orderUsageFeeId!: number;

  @Expose({ name: 'number_of_records' })
  numberOfRecords!: number;

  @Expose({ name: 'money' })
  money!: number;
}

/** 掃桶 */
class CylinderInfoResDto {
  @Expose({ name: 'cylinder_id' })
  cylinderId!: number;

  @Expose({ name: 'cylinder_number' })
  cylinderNumber!: string;

  @Expose({ name: 'cylinder_barcode' })
  cylinderBarcode!: string;

  @Expose({ name: 'cylinder_specification' })
  cylinderSpecification!: number;

  @Expose({ name: 'cylinder_gas_type' })
  cylinderGasType!: string;
}

export class CylinderActionListResDto {
  @Expose({ name: 'cylinderActionID' })
  cylinderActionID!: number;

  @Expose({ name: 'cylinderActionType' })
  cylinderActionType!: string;

  @Type(() => CylinderInfoResDto)
  @Expose({ name: 'cylinderInfo' })
  cylinderInfo!: CylinderInfoResDto;
}

export class OrderBaseInfoResDto {
  @Expose({ name: 'order_id' })
  orderId!: string;

  @Expose({ name: 'cis_id' })
  cisId!: string;

  @Expose({ name: 'customer_phone' })
  customerPhone!: string;

  @Expose({ name: 'contact_phone' })
  contactPhone!: string;

  @Expose({ name: 'customer_note' })
  customerNote!: string;

  @Expose({ name: 'order_status' })
  orderStatus!: OrderStatusEnum;

  @Expose({ name: 'order_delivery_status' })
  orderDeliveryStatus!: OrderDeliveryStatusEnum;

  @Expose({ name: 'delivery_type' })
  deliveryType!: DeliveryTypeEnum;

  @Expose({ name: 'time_slot' })
  timeSlot!: TimeSlotEnum;

  @Expose({ name: 'deliveryStatus' })
  deliveryStatus!: string;

  @Expose({ name: 'tax_id_number' })
  taxIdNumber!: string;

  @Expose({ name: 'discount' })
  discount!: number;

  @Expose({ name: 'gas_discount' })
  gasDiscount!: number;

  @Expose({ name: 'delivery_time_stamp' })
  deliveryTimeStamp!: string;

  @Expose({ name: 'create_time_stamp' })
  createTimeStamp!: string;

  @Type(() => OrderGasListResDto)
  @Expose({ name: 'order_gas_list' })
  orderGasList!: OrderGasListResDto[];

  @Type(() => OrderCommodityListResDto)
  @Expose({ name: 'order_commodity_list' })
  orderCommodityList!: OrderCommodityListResDto[];

  @Type(() => OrderUsageFeeListResDto)
  @Expose({ name: 'order_usage_fee_list' })
  orderUsageFeeList!: OrderUsageFeeListResDto[];

  @Type(() => AddressBindingInfoResDto)
  @Expose({ name: 'address_binding_info' })
  addressBindingInfo!: AddressBindingInfoResDto;

  @Type(() => CourierInfoResDto)
  @Expose({ name: 'courier_info' })
  courierInfo!: CourierInfoResDto;

  @Type(() => CylinderActionListResDto)
  @Expose({ name: 'cylinder_action_list' })
  cylinderActionList!: CylinderActionListResDto[];
}
