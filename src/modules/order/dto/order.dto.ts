export interface OrderGasInfo {
  order_gas_id: number;
  order_id: string;
  gp_id: number | null;
  cis_gp_id: number;
  numbers_of_cylinder: number;
  delivery_id: number | null;
  gas_price_info: any | null;
  cis_gas_price_info: {
    cis_gp_id: number;
    gas_id: number;
    cis_id: string;
    price: number;
    upload_time_stamp: string;
    user_id: string;
    effect_time_stamp: string;
    deleted: boolean;
    gas_cylinder_info: {
      gas_id: number;
      kilogram: number;
      gas_type: string;
      visible: boolean;
      supplier_id: string;
      deleted: boolean;
    };
  };
  delivery_info: any | null;
}

export interface OrderCommodityInfo {
  order_commodity_id: number;
  order_id: string;
  commodity_price_id: number;
  numbers_of_commodity: number;
  delivery_id: number | null;
  commodity_price_info: {
    commodity_price_id: number;
    commodity_id: number;
    price: number;
    create_time_stamp: string;
    user_id: string;
    deleted: boolean;
    commodity_info: {
      commodity_id: number;
      commodity_name: string;
      commodity_invoice_name: string | null;
      commodity_introduction: string | null;
      commodity_type: string;
      cover_photo_name: string | null;
      visible: boolean;
      instock: boolean;
      supplier_id: string;
      create_time_stamp: string;
      deleted: boolean;
    };
  };
}

export interface OrderCylinderInfo {
  order_cylinder_id: number;
  order_id: string;
  cp_id: number;
  numbers_of_cylinder: number;
  delivery_id: number | null;
  cylinder_price_info: {
    cp_id: number;
    cylinder_specification: number;
    customer_action_type: string;
    price: number;
    create_time_stamp: string;
    user_id: string;
    deleted: boolean;
  };
}

export interface OrderRefundInfo {
  order_refund_id: number;
  order_id: string;
  refund_gas_kilogram: number;
  refund_gas_type: string;
  gas_price: number;
  order_refund_type: string;
}

export interface CisCylinderMortgageInfo {
  cis_cylinder_mortgage_id: number;
  cis_id: string;
  order_id: string;
  take_cylinder_type: string;
  cylinder_specification: number;
  money: number;
  numbers_of_cylinder: number;
  create_time_stamp: string;
}

export interface OrderUsageFeeInfo {
  order_usage_fee_id: number;
  order_id: string;
  number_of_records: number;
  money: number;
  create_time_stamp: string;
}

export interface CustomerInSupplierInfo {
  cis_id: string;
  customer_id: number;
  supplier_id: string;
  customer_status: string;
  authentication_code: string;
  represent_address_id: number;
  note: string;
  order_note: string;
  customer_type: string;
  init_arrears: number;
  carrier_type: string;
  invoice_carrier: string;
  customer_name: string;
  main_phone: string;
  tax_id_number: string;
  company_name: string;
  customer_info: {
    customer_id: number;
    invoice_carrier: string | null;
    carrier_type: string | null;
    account_status: string;
    close_time_stamp: string | null;
  };
}

export interface AddressInfo {
  delivery_address_address_id: number;
  delivery_address_cis_id: string;
  delivery_address_city: string;
  delivery_address_site_id: string;
  delivery_address_village: string;
  delivery_address_neighborhood: string | null;
  delivery_address_road: string;
  delivery_address_section: string | null;
  delivery_address_lane: string | null;
  delivery_address_alley: string | null;
  delivery_address_address_number: string;
  delivery_address_floor: string | null;
  delivery_address_room: string | null;
  delivery_address_full_address: string;
  delivery_address_extra: string | null;
  delivery_address_latitude: number;
  delivery_address_longitude: number;
  delivery_address_deleted: boolean;
  delivery_address_address_code: string;
  address: string;
}

export interface OrderInfo {
  order_id: string;
  cis_id: string;
  customer_phone: string;
  contact_phone: string;
  note: string;
  customer_note: string | null;
  order_status: string;
  courier_id: string | null;
  tax_id_number: string;
  address_id: number;
  discount: number;
  gas_discount: number;
  delivery_time_stamp: string;
  create_time_stamp: string;
  end_time_stamp: string | null;
  order_gas_list: OrderGasInfo[];
  order_commodity_list: OrderCommodityInfo[];
  order_cylinder_list: OrderCylinderInfo[];
  order_payup_list: any[];
  take_back_cylinder_work_list: any[];
  order_refund_list: OrderRefundInfo[];
  cis_cylinder_mortgage_list: CisCylinderMortgageInfo[];
  order_usage_fee_list: OrderUsageFeeInfo[];
  customerInSupplier: CustomerInSupplierInfo;
  address: AddressInfo;
}

export interface OrderResponse {
  orderInfos: OrderInfo;
  arrears: number;
  totalPrice: number;
}

export interface GetOrderListRequest {
  page?: number;
  size?: number;
  firstDate?: string;
  lastDate?: string;
  sortColumnName?: string;
  orderType?: 'ASC' | 'DESC';
  order_status?: string;
  supplier_id?: string;
}

export interface OrderListItem {
  order_list_order_id: string;
  order_list_contact_phone: string;
  order_list_note: string;
  order_list_order_status: string;
  order_list_discount: number;
  order_list_gas_discount: number;
  order_list_delivery_time_stamp: string;
  order_list_create_time_stamp: string;
  customerInSupplier_cis_id: string;
  customerInSupplier_customer_id: number;
  customerInSupplier_supplier_id: string;
  customerInSupplier_customer_status: string;
  customerInSupplier_authentication_code: string;
  customerInSupplier_represent_address_id: number;
  customerInSupplier_note: string;
  customerInSupplier_order_note: string;
  customerInSupplier_customer_type: string;
  customerInSupplier_init_arrears: number;
  customerInSupplier_carrier_type: string;
  customerInSupplier_invoice_carrier: string;
  customerInSupplier_customer_name: string;
  customerInSupplier_main_phone: string;
  customerInSupplier_tax_id_number: string;
  customerInSupplier_company_name: string;
  address_id: number;
  address: string;
  address_city: string;
  address_site_id: string;
  address_village: string;
  address_neighborhood: string | null;
  address_road: string;
  address_section: string | null;
  address_alley: string | null;
  address_lane: string | null;
  address_address_number: string;
  address_floor: string | null;
  address_room: string | null;
  address_extra: string | null;
  address_address_code: string;
  courier_courier_id: string | null;
  courier_courier_name: string | null;
  courier_account: string | null;
  courier_login_time_stamp: string | null;
  courier_supplier_id: string | null;
  courier_deleted: boolean | null;
  courier_create_time_stamp: string | null;
  total_price: number;
  arrears: number;
}

export interface GetOrderListResponse {
  orderList: OrderListItem[];
  rowsCount: number;
}

export interface CreateOrderRequest {
  order_infos: {
    cis_id: string;
    customer_phone: string;
    tax_id_number: string;
    contact_phone: string;
    delivery_time_stamp: string;
    address_id: number;
    courier_id: string;
    discount: number;
    gas_discount: number;
    note: string;
  };
  order_gas_list: Array<{
    gp_id: number;
    cis_gp_id: number | null;
    numbers_of_cylinder: number;
    delivery_id: number;
  }>;
  order_commodity_list: Array<{
    commodity_price_id: number;
    numbers_of_commodity: number;
    delivery_id: number;
  }>;
  order_cylinder_infos: {
    orderCylinderList: Array<{
      cp_id: number;
      numbers_of_cylinder: number;
      delivery_id: number;
    }>;
    orderCylinderMortgageList: Array<{
      take_cylinder_type: string;
      cylinder_specification: number;
      money: number;
      numbers_of_cylinder: number;
    }>;
    cylinderUsageFeeList: Array<{
      number_of_records: number;
      money: number;
    }>;
  };
  order_refund_list: Array<{
    refund_gas_kilogram: number;
    refund_gas_type: string | number;
    gas_price: number;
    order_refund_type: string;
  }>;
}

export interface CreateOrderResponse {
  order_id: string;
  orderGasResult: {
    identifiers: Array<{ order_gas_id: number }>;
    generatedMaps: Array<{ order_gas_id: number }>;
    raw: Array<{ order_gas_id: number }>;
  };
  orderCommodityResult: {
    identifiers: Array<{ order_commodity_id: number }>;
    generatedMaps: Array<{ order_commodity_id: number }>;
    raw: Array<{ order_commodity_id: number }>;
  };
  orderCylinderResult: {
    identifiers: Array<{ order_cylinder_id: number }>;
    generatedMaps: Array<{ order_cylinder_id: number }>;
    raw: Array<{ order_cylinder_id: number }>;
  };
  orderCylinderMortgageResult: {
    identifiers: Array<{ cis_cylinder_mortgage_id: number }>;
    generatedMaps: Array<{ cis_cylinder_mortgage_id: number }>;
    raw: Array<{ cis_cylinder_mortgage_id: number }>;
  };
  orderUsageFeeResult: {
    identifiers: Array<{ order_usage_fee_id: number }>;
    generatedMaps: Array<{ order_usage_fee_id: number }>;
    raw: Array<{ order_usage_fee_id: number }>;
  };
  orderRefundResult: {
    identifiers: Array<{ order_refund_id: number }>;
    generatedMaps: Array<{ order_refund_id: number }>;
    raw: Array<{ order_refund_id: number }>;
  };
  refreshMaterializedRelatedData: {
    isArrearsOrder: boolean;
    isChangeOweCylinderOrder: boolean;
    isChangeCylinderInventory: boolean;
    isChangeDailyStatisticsReport: boolean;
    isUpdateCourierDailySummary: boolean;
    isBillPayupWork: boolean;
    isUpdatePayworkMix: boolean;
  };
}

export interface UpdateOrderPaymentRequest {
  payment_amount_infos: {
    order_id: string;
    order_payment_amount: number;
    cis_payment_amount: number;
    check_payment_amount: number;
    check_infos?: {
      check_number: string;
    };
    discount?: number;
    order_refund_list: Array<{
      order_refund_id: number | null;
      refund_gas_kilogram: number;
      refund_gas_type: number;
      gas_price: number;
      order_refund_type: string;
    }>;
    take_back_cylinder_work_list: Array<{
      cylinder_specification: number;
      num_of_take_bake_cylinders: number;
    }>;
    arrears_payup_amoumt?: {
      order_payment_amount: number;
      cis_payment_amount: number;
      check_payment_amount: number;
      check_infos?: {
        check_number: string;
      };
    };
  };
}

export interface UpdateOrderPaymentResponse {
  message: string;
}


