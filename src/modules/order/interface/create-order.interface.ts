import { CarrierTypeEnum, DeliveryTypeEnum, TimeSlotEnum } from '@artifact/lpg-api-service';

/** 建立訂單資訊 */
export interface CreateOrderInterface {
  orderInfo: CreateOrderInfoInterface;
  orderGasList: Array<CreateOrderGasInterface>;
  orderCommodityList: Array<CreateOrderCommodityInterface>;
  orderUsageFeeList: Array<CreateOrderUsageFeeInterface>;
  customerInfoInOrder?: SaveCustomerInfoInOrderInterface;
}

/** 訂單資訊 */
export interface CreateOrderInfoInterface {
  customerPhone: string;
  contactPhone: string;
  customerNote?: string;
  deliveryType: DeliveryTypeEnum;
  timeSlot: TimeSlotEnum;
  taxIdNumber?: string | null;
  customerAddressId: number;
  gasDiscount: number;
}

/** 訂單瓦斯資訊 */
export interface CreateOrderGasInterface {
  gpId?: number;
  cisGpId?: number;
  numberOfCylinder: number;
  deliveryInfo?: {
    customerDeliveryId?: number;
    customerAddressId: number;
    deliveryLocation: string;
    usageName: string;
    floor: number;
    isElevator: boolean;
  };
}

/** 訂單商品資訊 */
export interface CreateOrderCommodityInterface {
  commodityPriceId: number;
  numberOfCommodity: number;
}

/** 鋼瓶使用費資訊 */
export interface CreateOrderUsageFeeInterface {
  numberOfRecords: number;
  money: number;
}

/** 在訂單操作中，要儲存的客戶資料 */
export interface SaveCustomerInfoInOrderInterface {
  customerId: number;
  invoiceCarrier: string;
  carrierType: CarrierTypeEnum;
}
