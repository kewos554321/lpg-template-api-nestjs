import { Injectable } from '@nestjs/common';
import { httpStatus } from '@artifact/aurora-api-core';
import {
  CisGasPrice,
  Customer,
  CustomerDelivery,
  DeliveryTypeEnum,
  GasPrice,
  OrderCommodity,
  OrderDeliveryStatusEnum,
  OrderList,
  OrderStatusEnum,
  OrderUsageFee,
  ServiceBase,
  deliveryHelper,
} from '@artifact/lpg-api-service';
import { CustomerRepository } from '../customer/customer.repository.js';
import { DeliveryRepository } from '../delivery/delivery.repository.js';
import {
  CreateOrderCommodityInterface,
  CreateOrderGasInterface,
  CreateOrderInfoInterface,
  CreateOrderUsageFeeInterface,
  SaveCustomerInfoInOrderInterface,
} from './interface/create-order.interface.js';
import { OrderListStatus, OrderRepository } from './order.repository.js';

@Injectable()
export class OrderService extends ServiceBase {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly deliveryRepository: DeliveryRepository,
    private readonly customerRepository: CustomerRepository,
  ) {
    super();
  }

  public async getOrderInfo(orderId: string) {
    const orderInfo = await this.orderRepository.getOrderInfo(orderId);
    const fullOrderInfo = orderInfo ? this.returnFullOrderList([orderInfo])[0] : null;
    return this.formatMessage(fullOrderInfo, httpStatus.OK);
  }

  private returnFullOrderList(orderList: OrderList[]) {
    return orderList.map((item) => {
      let deliveryStatus = OrderListStatus.accomplish;
      if (item.order_status === OrderStatusEnum.undelivery) {
        deliveryStatus = OrderListStatus.waiting;
      } else if (
        item.order_status === OrderStatusEnum.delivering &&
        (item.order_delivery_status === OrderDeliveryStatusEnum.picked ||
          item.order_delivery_status === OrderDeliveryStatusEnum.accomplish)
      ) {
        deliveryStatus = OrderListStatus.delivering;
      } else if (item.delivery_type === DeliveryTypeEnum.scheduledDelivery) {
        deliveryStatus = OrderListStatus.scheduled;
      }
      return {
        ...item,
        address_binding_info: {
          ...item.address_binding_info,
          address: deliveryHelper.mergeToAddressString(
            item.address_binding_info.customerAddressInfo
          ),
        },
        deliveryStatus,
      };
    });
  }

  public async getOrderList(
    page: number,
    size: number,
    customerId: number,
    supplierId: string,
    isAccomplished: boolean,
  ) {
    const customerInfo = await this.customerRepository.findCustomerInSuppliers(customerId, supplierId);

    const orderList = await this.orderRepository.getOrderList(
      page,
      size,
      customerId,
      customerInfo!.supplier_id,
      isAccomplished,
    );
    const fullOrderList = this.returnFullOrderList(orderList.data as any);
    return this.formatMessage(
      {
        orderList: fullOrderList,
        rowsCount: (orderList as any).rowsCount,
      },
      httpStatus.OK,
    );
  }

  private mergeGasPriceList(gasPriceList: GasPrice[], cisGasPriceList: CisGasPrice[]) {
    const gasPriceListMap = new Map<string, GasPrice | CisGasPrice | { gp_id: number | null; cis_gp_id: number | null }>();
    gasPriceList.forEach((item) => {
      gasPriceListMap.set(`${item.gas_cylinder_info.gas_type}-${item.gas_cylinder_info.kilogram}`, {
        ...(item as any),
        gp_id: (item as any).gp_id || null,
        cis_gp_id: null,
      });
    });
    cisGasPriceList.forEach((item) => {
      gasPriceListMap.set(`${item.gas_cylinder_info.gas_type}-${item.gas_cylinder_info.kilogram}`, {
        ...(item as any),
        gp_id: null,
        cis_gp_id: (item as any).cis_gp_id,
      });
    });
    return Array.from(gasPriceListMap.values());
  }

  public async getGasPriceList(
    customerId: number,
    supplierId?: string,
    gasType?: string,
    kilogram?: number,
  ) {
    const customerInfo = await this.customerRepository.findCustomerInSuppliers(customerId, supplierId);
    const gasPriceList = await this.orderRepository.getGasPriceList(
      customerInfo!.supplier_id,
      gasType,
      kilogram,
    );
    const cisGasPriceList = await this.orderRepository.getCisGasPriceList(
      customerId,
      customerInfo!.supplier_id,
      gasType,
      kilogram,
    );
    const mergeGasPriceList = this.mergeGasPriceList(gasPriceList as any, cisGasPriceList as any);
    return this.formatMessage(mergeGasPriceList, httpStatus.OK);
  }

  public async createOrder(
    orderInfo: CreateOrderInfoInterface,
    orderGasList: Array<CreateOrderGasInterface>,
    orderCommodityList: Array<CreateOrderCommodityInterface>,
    orderUsageFeeList: Array<CreateOrderUsageFeeInterface>,
    customerId: number,
    supplierId?: string,
    customerInfoInOrder?: SaveCustomerInfoInOrderInterface,
  ) {
    const customerInfo = await this.customerRepository.findCustomerInSuppliers(customerId, supplierId);

    const promiseResult = await Promise.all([
      this.orderRepository.generateOrderId(customerInfo!.supplier_id),
      this.deliveryRepository.findAddressBindingInfo(orderInfo.customerAddressId),
    ]);
    const orderId = promiseResult[0] as string;
    const addressBinding: any = promiseResult[1];

    if (!addressBinding) {
      return this.formatErrorMessage(
        1040,
        'Address binding not found or address deleted.',
        httpStatus.BAD_REQUEST,
      );
    }

    const insertOrderInfo: Partial<OrderList> = {
      order_id: orderId,
      cis_id: (customerInfo as any)!.cis_id,
      customer_phone: (orderInfo as any).customerPhone,
      contact_phone: (orderInfo as any).contactPhone,
      note: (orderInfo as any).customerNote,
      customer_note: (orderInfo as any).customerNote,
      order_status: OrderStatusEnum.undelivery,
      order_delivery_status: OrderDeliveryStatusEnum.unpick,
      delivery_type: (orderInfo as any).deliveryType,
      time_slot: (orderInfo as any).timeSlot,
      tax_id_number: (orderInfo as any).taxIdNumber,
      address_id: (addressBinding as any).addressId,
      address_binding_id: (addressBinding as any).addressBindingId,
      discount: 0,
      gas_discount: (orderInfo as any).gasDiscount,
      delivery_time_stamp: new Date().toISOString(),
      create_time_stamp: new Date().toISOString(),
    } as any;

    const insertCustomerDeliveryList: Partial<CustomerDelivery>[] = [];
    (orderGasList || []).forEach((item) => {
      if ((item as any).deliveryInfo) {
        const findDuplicateDelivery = insertCustomerDeliveryList.find(
          (delivery) =>
            delivery.delivery_location === (item as any).deliveryInfo!.deliveryLocation &&
            delivery.usage_name === (item as any).deliveryInfo!.usageName &&
            delivery.floor === (item as any).deliveryInfo!.floor &&
            delivery.is_elevator === (item as any).deliveryInfo!.isElevator,
        );
        if (!findDuplicateDelivery) {
          insertCustomerDeliveryList.push({
            customer_delivery_id: (item as any).deliveryInfo.customerDeliveryId,
            customer_address_id: (item as any).deliveryInfo.customerAddressId,
            delivery_location: (item as any).deliveryInfo.deliveryLocation,
            usage_name: (item as any).deliveryInfo.usageName,
            floor: (item as any).deliveryInfo.floor,
            is_elevator: (item as any).deliveryInfo.isElevator,
          });
        }
      }
    });

    const insertOrderCommodityList: Partial<OrderCommodity>[] = (orderCommodityList || []).map(
      (item) => ({
        commodity_price_id: (item as any).commodityPriceId,
        numbers_of_commodity: (item as any).numberOfCommodity,
        order_id: orderId,
      }),
    );
    const insertOrderUsageFeeList: Partial<OrderUsageFee>[] = (orderUsageFeeList || []).map(
      (item) => ({
        number_of_records: (item as any).numberOfRecords,
        money: (item as any).money,
        order_id: orderId,
        create_time_stamp: new Date().toISOString(),
      }),
    );

    const saveCustomerInfoInOrder: Partial<Customer> = {
      customer_id: customerId,
      carrier_type: customerInfoInOrder?.carrierType,
      invoice_carrier: customerInfoInOrder?.invoiceCarrier,
    } as any;

    let saveCisInfo: any;
    if (customerInfoInOrder?.carrierType && customerInfoInOrder?.invoiceCarrier) {
      saveCisInfo = {
        cis_id: (customerInfo as any)!.cis_id,
        carrier_type: customerInfoInOrder.carrierType,
        invoice_carrier: customerInfoInOrder.invoiceCarrier,
      } as any;
    }

    const orderResult = await this.orderRepository.createOrder(
      insertOrderInfo,
      orderGasList,
      insertOrderCommodityList,
      insertOrderUsageFeeList,
      insertCustomerDeliveryList,
      saveCustomerInfoInOrder,
      saveCisInfo,
    );
    if ((orderResult as any).error === true) {
      return this.formatErrorMessage(
        1039,
        'Something wrong with database transaction.',
        httpStatus.BAD_REQUEST,
      );
    }
    return this.formatMessage((orderResult as any).transaction_data, httpStatus.OK);
  }
}


