import { OrderList } from "@artifact/lpg-api-service/dist/database/entities/order_list";
import { Repository, DataSource } from "typeorm";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { OrderInfo, GetOrderListRequest, OrderListItem, UpdateOrderPaymentRequest, CreateOrderRequest, CreateOrderResponse, UpdateOrderPaymentResponse } from "./dto/order.dto";
import {
  OrderGas,
  OrderCommodity,
  OrderCylinder,
  CisCylinderMortgage,
  OrderUsageFee,
  OrderRefund,
  OrderPayup,
  OrderPayupWork,
  Check,
  CisWallet,
  Supplier,
  WorkPayWayEnum,
  PaymentFlowTypeEnum,
  OrderStatusEnum,
  DeliveryAddress,
} from '@artifact/lpg-api-service';


@Injectable()
export class OrderRepository {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(OrderList) private readonly orderListRepository: Repository<OrderList>,
    @InjectRepository(Supplier) private readonly supplierRepository: Repository<Supplier>,
  ) {}

  public async getOrderInfo(order_id: string): Promise<OrderInfo | null> {
    const order = await this.orderListRepository.findOne({
      where: { order_id },
      relations: {
        order_gas_list: {
          cis_gas_price_info: {
            gas_cylinder_info: true
          }
        },
        order_commodity_list: {
          commodity_price_info: {
            commodity_info: true
          }
        },
        order_cylinder_list: {
          cylinder_price_info: true
        },
        order_payup_list: true,
        take_back_cylinder_work_list: true,
        order_refund_list: true,
        cis_cylinder_mortgage_list: true,
        order_usage_fee_list: true,
        customerInSupplier: {
          customer_info: true
        },
        address_info: true, // 使用 entity 中定義的 address_info 關聯
      },
    });

    if (!order) return null;

    // 轉換為 OrderInfo 格式，包含地址信息
    return {
      ...order,
      address: order.address_info ? {
        delivery_address_address_id: order.address_info.address_id,
        delivery_address_cis_id: order.address_info.cis_id,
        delivery_address_city: order.address_info.city,
        delivery_address_site_id: order.address_info.site_id,
        delivery_address_village: order.address_info.village,
        delivery_address_neighborhood: order.address_info.neighborhood,
        delivery_address_road: order.address_info.road,
        delivery_address_section: order.address_info.section,
        delivery_address_lane: order.address_info.lane,
        delivery_address_alley: order.address_info.alley,
        delivery_address_address_number: order.address_info.address_number,
        delivery_address_floor: order.address_info.floor,
        delivery_address_room: order.address_info.room,
        delivery_address_full_address: order.address_info.fullAddress,
        delivery_address_extra: order.address_info.extra,
        delivery_address_latitude: order.address_info.latitude,
        delivery_address_longitude: order.address_info.longitude,
        delivery_address_deleted: order.address_info.deleted,
        delivery_address_address_code: order.address_info.address_code,
        address: order.address_info.fullAddress,
      } : null,
    } as OrderInfo;
  }

  public async getOrderListById(order_id: string): Promise<OrderList[]> {
    return this.orderListRepository.find({
      where: {
        order_id,
      },
    });
  }

  public async getOrderList(request: GetOrderListRequest): Promise<OrderListItem[]> {
    const qb = this.orderListRepository
      .createQueryBuilder('order_list')
      .leftJoinAndSelect('order_list.customerInSupplier', 'customerInSupplier')
      .leftJoinAndSelect('customerInSupplier.customer_info', 'customer_info')
      .leftJoinAndSelect('order_list.address_info', 'address_info')
      .leftJoinAndSelect('order_list.courier_info', 'courier_info');

    // 條件篩選
    if (request.order_status) {
      qb.andWhere('order_list.order_status = :order_status', { order_status: request.order_status });
    }
    if (request.supplier_id) {
      qb.andWhere('customerInSupplier.supplier_id = :supplier_id', { supplier_id: request.supplier_id });
    }
    if (request.firstDate) {
      qb.andWhere('order_list.delivery_time_stamp >= :firstDate', { firstDate: request.firstDate });
    }
    if (request.lastDate) {
      qb.andWhere('order_list.delivery_time_stamp <= :lastDate', { lastDate: request.lastDate });
    }

    // 分頁
    if (request.page && request.size) {
      const offset = (request.page - 1) * request.size;
      qb.skip(offset).take(request.size);
    }

    // 排序
    const sortColumn = request.sortColumnName || 'delivery_time_stamp';
    const orderType = (request.orderType || 'DESC') as 'ASC' | 'DESC';
    const allowedColumns = ['delivery_time_stamp', 'create_time_stamp', 'order_id', 'order_status'];
    if (allowedColumns.includes(sortColumn)) {
      qb.orderBy(`order_list.${sortColumn}`, orderType);
    } else {
      qb.orderBy('order_list.delivery_time_stamp', 'DESC');
    }

    const orders = await qb.getMany();
    
    return orders.map((order: any) => {
      const totalPrice = (order.discount || 0) + (order.gas_discount || 0);
      
      return {
        order_list_order_id: order.order_id,
        order_list_contact_phone: order.contact_phone,
        order_list_note: order.note,
        order_list_order_status: order.order_status,
        order_list_discount: order.discount || null,
        order_list_gas_discount: order.gas_discount || null,
        order_list_delivery_time_stamp: order.delivery_time_stamp || null,
        order_list_create_time_stamp: order.create_time_stamp || null,
        customerInSupplier_cis_id: order.customerInSupplier?.cis_id || null,
        customerInSupplier_customer_id: order.customerInSupplier?.customer_id || null,
        customerInSupplier_supplier_id: order.customerInSupplier?.supplier_id || null,
        customerInSupplier_customer_status: order.customerInSupplier?.customer_status || null,
        customerInSupplier_authentication_code: order.customerInSupplier?.authentication_code || null,
        customerInSupplier_represent_address_id: order.customerInSupplier?.represent_address_id || null,
        customerInSupplier_note: order.customerInSupplier?.note || null,
        customerInSupplier_order_note: order.customerInSupplier?.order_note || null,
        customerInSupplier_customer_type: order.customerInSupplier?.customer_type || null,
        customerInSupplier_init_arrears: order.customerInSupplier?.init_arrears || null,
        customerInSupplier_carrier_type: order.customerInSupplier?.carrier_type || null,
        customerInSupplier_invoice_carrier: order.customerInSupplier?.invoice_carrier || null,
        customerInSupplier_customer_name: order.customerInSupplier?.customer_name || null,
        customerInSupplier_main_phone: order.customerInSupplier?.main_phone || null,
        customerInSupplier_tax_id_number: order.customerInSupplier?.tax_id_number || null,
        customerInSupplier_company_name: order.customerInSupplier?.company_name || null,
        address_id: order.address_id || 0,
        address: order.address_info?.fullAddress || null,
        address_city: order.address_info?.city || null,
        address_site_id: order.address_info?.site_id || null,
        address_village: order.address_info?.village || null,
        address_neighborhood: order.address_info?.neighborhood || null,
        address_road: order.address_info?.road || null,
        address_section: order.address_info?.section || null,
        address_alley: order.address_info?.alley || null,
        address_lane: order.address_info?.lane || null,
        address_address_number: order.address_info?.address_number || null,
        address_floor: order.address_info?.floor || null,
        address_room: order.address_info?.room || null,
        address_extra: order.address_info?.extra || null,
        address_address_code: order.address_info?.address_code || null,
        courier_courier_id: order.courier_info?.courier_id || null,
        courier_courier_name: order.courier_info?.courier_name || null,
        courier_account: order.courier_info?.account || null,
        courier_login_time_stamp: order.courier_info?.login_time_stamp || null,
        courier_supplier_id: order.courier_info?.supplier_id || null,
        courier_deleted: order.courier_info?.deleted || null,
        courier_create_time_stamp: order.courier_info?.create_time_stamp || null,
        total_price: totalPrice,
        arrears: order.customerInSupplier?.init_arrears || null,
      } as OrderListItem;
    });
  }

  public async createOrder(request: CreateOrderRequest, supplier_id: string): Promise<CreateOrderResponse> {
    return this.dataSource.transaction(async (manager) => {
      const orderId = await this.generateOrderId(supplier_id);

      const orderListEntity = manager.create(OrderList as any, {
        order_id: orderId,
        cis_id: request.order_infos.cis_id,
        contact_phone: request.order_infos.contact_phone,
        note: request.order_infos.note,
        order_status: OrderStatusEnum.undelivery,
        discount: request.order_infos.discount,
        gas_discount: request.order_infos.gas_discount,
        delivery_time_stamp: request.order_infos.delivery_time_stamp,
        create_time_stamp: new Date().toISOString(),
        address_id: request.order_infos.address_id,
        courier_id: request.order_infos.courier_id,
      });
      await manager.save(orderListEntity);

      const orderGasEntities = request.order_gas_list.map((gas) =>
        manager.create(OrderGas as any, {
          order_id: orderId,
          gp_id: gas.gp_id,
          cis_gp_id: gas.cis_gp_id || undefined,
          numbers_of_cylinder: gas.numbers_of_cylinder,
          delivery_id: gas.delivery_id,
        }),
      );
      const orderGasResult = await manager.save(orderGasEntities);

      const orderCommodityEntities = request.order_commodity_list.map((commodity) =>
        manager.create(OrderCommodity as any, {
          order_id: orderId,
          commodity_price_id: commodity.commodity_price_id,
          numbers_of_commodity: commodity.numbers_of_commodity,
          delivery_id: commodity.delivery_id,
        }),
      );
      const orderCommodityResult = await manager.save(orderCommodityEntities);

      const orderCylinderEntities = request.order_cylinder_infos.orderCylinderList.map((cylinder) =>
        manager.create(OrderCylinder as any, {
          order_id: orderId,
          cp_id: cylinder.cp_id,
          numbers_of_cylinder: cylinder.numbers_of_cylinder,
          delivery_id: cylinder.delivery_id,
        }),
      );
      const orderCylinderResult = await manager.save(orderCylinderEntities);

      const orderCylinderMortgageEntities = request.order_cylinder_infos.orderCylinderMortgageList.map((mortgage) =>
        manager.create(CisCylinderMortgage as any, {
          cis_id: request.order_infos.cis_id,
          order_id: orderId,
          take_cylinder_type: mortgage.take_cylinder_type as any,
          cylinder_specification: mortgage.cylinder_specification,
          money: mortgage.money,
          numbers_of_cylinder: mortgage.numbers_of_cylinder,
          create_time_stamp: new Date().toISOString(),
        }),
      );
      const orderCylinderMortgageResult = await manager.save(orderCylinderMortgageEntities);

      const orderUsageFeeEntities = request.order_cylinder_infos.cylinderUsageFeeList.map((fee) =>
        manager.create(OrderUsageFee as any, {
          order_id: orderId,
          number_of_records: fee.number_of_records,
          money: fee.money,
          create_time_stamp: new Date().toISOString(),
        }),
      );
      const orderUsageFeeResult = await manager.save(orderUsageFeeEntities);

      const orderRefundEntities = request.order_refund_list.map((refund) =>
        manager.create(OrderRefund as any, {
          order_id: orderId,
          refund_gas_kilogram: refund.refund_gas_kilogram,
          refund_gas_type: refund.refund_gas_type,
          gas_price: refund.gas_price,
          order_refund_type: refund.order_refund_type as any,
        }),
      );
      const orderRefundResult = await manager.save(orderRefundEntities);

      return {
        order_id: orderId,
        orderGasResult: {
          identifiers: orderGasResult.map((r: any) => ({ order_gas_id: r.order_gas_id })),
          generatedMaps: orderGasResult.map((r: any) => ({ order_gas_id: r.order_gas_id })),
          raw: orderGasResult.map((r: any) => ({ order_gas_id: r.order_gas_id })),
        },
        orderCommodityResult: {
          identifiers: orderCommodityResult.map((r: any) => ({ order_commodity_id: r.order_commodity_id })),
          generatedMaps: orderCommodityResult.map((r: any) => ({ order_commodity_id: r.order_commodity_id })),
          raw: orderCommodityResult.map((r: any) => ({ order_commodity_id: r.order_commodity_id })),
        },
        orderCylinderResult: {
          identifiers: orderCylinderResult.map((r: any) => ({ order_cylinder_id: r.order_cylinder_id })),
          generatedMaps: orderCylinderResult.map((r: any) => ({ order_cylinder_id: r.order_cylinder_id })),
          raw: orderCylinderResult.map((r: any) => ({ order_cylinder_id: r.order_cylinder_id })),
        },
        orderCylinderMortgageResult: {
          identifiers: orderCylinderMortgageResult.map((r: any) => ({ cis_cylinder_mortgage_id: r.cis_cylinder_mortgage_id })),
          generatedMaps: orderCylinderMortgageResult.map((r: any) => ({ cis_cylinder_mortgage_id: r.cis_cylinder_mortgage_id })),
          raw: orderCylinderMortgageResult.map((r: any) => ({ cis_cylinder_mortgage_id: r.cis_cylinder_mortgage_id })),
        },
        orderUsageFeeResult: {
          identifiers: orderUsageFeeResult.map((r: any) => ({ order_usage_fee_id: r.order_usage_fee_id })),
          generatedMaps: orderUsageFeeResult.map((r: any) => ({ order_usage_fee_id: r.order_usage_fee_id })),
          raw: orderUsageFeeResult.map((r: any) => ({ order_usage_fee_id: r.order_usage_fee_id })),
        },
        orderRefundResult: {
          identifiers: orderRefundResult.map((r: any) => ({ order_refund_id: r.order_refund_id })),
          generatedMaps: orderRefundResult.map((r: any) => ({ order_refund_id: r.order_refund_id })),
          raw: orderRefundResult.map((r: any) => ({ order_refund_id: r.order_refund_id })),
        },
        refreshMaterializedRelatedData: {
          isArrearsOrder: false,
          isChangeOweCylinderOrder: false,
          isChangeCylinderInventory: true,
          isChangeDailyStatisticsReport: true,
          isUpdateCourierDailySummary: false,
          isBillPayupWork: false,
          isUpdatePayworkMix: false,
        },
      } as CreateOrderResponse;
    });
  }

  private async generateOrderId(supplier_id: string): Promise<string> {
    const supplier = await this.supplierRepository.findBy({ supplier_id });
    const prefix = supplier[0]?.prefix;
    const row = await this.orderListRepository
      .createQueryBuilder('order_list')
      .select("MAX(split_part(order_list.order_id, '_', 2)::int)", 'id_second_text')
      .where('order_list.order_id like :prefix', { prefix: `%${prefix}O_%` })
      .getRawOne();
    if (!row || row.id_second_text == null) return `${prefix}O_1`;
    return `${prefix}O_${row.id_second_text + 1}`;
  }
}