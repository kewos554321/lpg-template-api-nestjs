import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {
  OrderList,
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
} from '@artifact/lpg-api-service';
import {
  CreateOrderRequest,
  CreateOrderResponse,
  GetOrderListRequest,
  OrderInfo,
  OrderListItem,
  UpdateOrderPaymentRequest,
  UpdateOrderPaymentResponse,
} from './dto/order.dto';

@Injectable()
export class OrdersModel {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(OrderList) private readonly orderRepo: Repository<any>,
    @InjectRepository(Supplier) private readonly supplierRepo: Repository<any>,
  ) {}

  async getOrderInfo(order_id: string): Promise<OrderInfo | null> {
    const qb = this.orderRepo
      .createQueryBuilder('order_list')
      .leftJoinAndSelect('order_list.order_gas_list', 'order_gas_list')
      .leftJoinAndSelect('order_gas_list.cis_gas_price_info', 'cis_gas_price_info')
      .leftJoinAndSelect('cis_gas_price_info.gas_cylinder_info', 'gas_cylinder_info')
      .leftJoinAndSelect('order_list.order_commodity_list', 'order_commodity_list')
      .leftJoinAndSelect('order_commodity_list.commodity_price_info', 'commodity_price_info')
      .leftJoinAndSelect('commodity_price_info.commodity_info', 'commodity_info')
      .leftJoinAndSelect('order_list.order_cylinder_list', 'order_cylinder_list')
      .leftJoinAndSelect('order_cylinder_list.cylinder_price_info', 'cylinder_price_info')
      .leftJoinAndSelect('order_list.order_payup_list', 'order_payup_list')
      .leftJoinAndSelect('order_list.take_back_cylinder_work_list', 'take_back_cylinder_work_list')
      .leftJoinAndSelect('order_list.order_refund_list', 'order_refund_list')
      .leftJoinAndSelect('order_list.cis_cylinder_mortgage_list', 'cis_cylinder_mortgage_list')
      .leftJoinAndSelect('order_list.order_usage_fee_list', 'order_usage_fee_list')
      .leftJoinAndSelect('order_list.customerInSupplier', 'customerInSupplier')
      .leftJoinAndSelect('customerInSupplier.customer_info', 'customer_info')
      .leftJoin('DeliveryAddress', 'delivery_address', 'delivery_address.address_id = order_list.address_id')
      .addSelect([
        'delivery_address.address_id as delivery_address_address_id',
        'delivery_address.cis_id as delivery_address_cis_id',
        'delivery_address.city as delivery_address_city',
        'delivery_address.site_id as delivery_address_site_id',
        'delivery_address.village as delivery_address_village',
        'delivery_address.neighborhood as delivery_address_neighborhood',
        'delivery_address.road as delivery_address_road',
        'delivery_address.section as delivery_address_section',
        'delivery_address.lane as delivery_address_lane',
        'delivery_address.alley as delivery_address_alley',
        'delivery_address.address_number as delivery_address_address_number',
        'delivery_address.floor as delivery_address_floor',
        'delivery_address.room as delivery_address_room',
        'delivery_address.full_address as delivery_address_full_address',
        'delivery_address.extra as delivery_address_extra',
        'delivery_address.latitude as delivery_address_latitude',
        'delivery_address.longitude as delivery_address_longitude',
        'delivery_address.deleted as delivery_address_deleted',
        'delivery_address.address_code as delivery_address_address_code',
      ])
      .where('order_list.order_id = :order_id', { order_id });

    const res = await qb.getRawAndEntities();
    if (!res.entities[0]) return null;
    const order = res.entities[0];
    const raw = res.raw[0];

    const addressInfo = raw
      ? {
          delivery_address_address_id: raw.delivery_address_address_id,
          delivery_address_cis_id: raw.delivery_address_cis_id,
          delivery_address_city: raw.delivery_address_city,
          delivery_address_site_id: raw.delivery_address_site_id,
          delivery_address_village: raw.delivery_address_village,
          delivery_address_neighborhood: raw.delivery_address_neighborhood,
          delivery_address_road: raw.delivery_address_road,
          delivery_address_section: raw.delivery_address_section,
          delivery_address_lane: raw.delivery_address_lane,
          delivery_address_alley: raw.delivery_address_alley,
          delivery_address_address_number: raw.delivery_address_address_number,
          delivery_address_floor: raw.delivery_address_floor,
          delivery_address_room: raw.delivery_address_room,
          delivery_address_full_address: raw.delivery_address_full_address,
          delivery_address_extra: raw.delivery_address_extra,
          delivery_address_latitude: raw.delivery_address_latitude,
          delivery_address_longitude: raw.delivery_address_longitude,
          delivery_address_deleted: raw.delivery_address_deleted,
          delivery_address_address_code: raw.delivery_address_address_code,
          address: raw.delivery_address_full_address,
        }
      : null;

    return { ...(order as any), address: addressInfo } as OrderInfo;
  }

  async getOrderList(request: GetOrderListRequest): Promise<OrderListItem[]> {
    const qb = this.orderRepo
      .createQueryBuilder('order_list')
      .leftJoinAndSelect('order_list.customerInSupplier', 'customerInSupplier')
      .leftJoinAndSelect('customerInSupplier.customer_info', 'customer_info')
      .leftJoin('DeliveryAddress', 'delivery_address', 'delivery_address.address_id = order_list.address_id')
      .addSelect([
        'delivery_address.address_id as delivery_address_address_id',
        'delivery_address.full_address as delivery_address_full_address',
        'delivery_address.city as delivery_address_city',
        'delivery_address.site_id as delivery_address_site_id',
        'delivery_address.village as delivery_address_village',
        'delivery_address.neighborhood as delivery_address_neighborhood',
        'delivery_address.road as delivery_address_road',
        'delivery_address.section as delivery_address_section',
        'delivery_address.alley as delivery_address_alley',
        'delivery_address.lane as delivery_address_lane',
        'delivery_address.address_number as delivery_address_address_number',
        'delivery_address.floor as delivery_address_floor',
        'delivery_address.room as delivery_address_room',
        'delivery_address.extra as delivery_address_extra',
        'delivery_address.address_code as delivery_address_address_code',
      ])
      .leftJoin('Courier', 'courier', 'courier.courier_id = order_list.courier_id')
      .addSelect([
        'courier.courier_id as courier_courier_id',
        'courier.courier_name as courier_courier_name',
        'courier.account as courier_account',
        'courier.login_time_stamp as courier_login_time_stamp',
        'courier.supplier_id as courier_supplier_id',
        'courier.deleted as courier_deleted',
        'courier.create_time_stamp as courier_create_time_stamp',
      ]);

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
    if (request.page && request.size) {
      const offset = (request.page - 1) * request.size;
      qb.skip(offset).take(request.size);
    }
    const sortColumn = request.sortColumnName || 'delivery_time_stamp';
    const orderType = (request.orderType || 'DESC') as 'ASC' | 'DESC';
    const allowed = ['delivery_time_stamp', 'create_time_stamp', 'order_id', 'order_status'];
    if (allowed.includes(sortColumn)) qb.orderBy(`order_list.${sortColumn}`, orderType);
    else qb.orderBy('order_list.delivery_time_stamp', 'DESC');

    const result = await qb.getRawAndEntities();
    return result.entities.map((order: any, idx) => {
      const raw: any = result.raw[idx];
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
        address: raw?.delivery_address_full_address || null,
        address_city: raw?.delivery_address_city || null,
        address_site_id: raw?.delivery_address_site_id || null,
        address_village: raw?.delivery_address_village || null,
        address_neighborhood: raw?.delivery_address_neighborhood || null,
        address_road: raw?.delivery_address_road || null,
        address_section: raw?.delivery_address_section || null,
        address_alley: raw?.delivery_address_alley || null,
        address_lane: raw?.delivery_address_lane || null,
        address_address_number: raw?.delivery_address_address_number || null,
        address_floor: raw?.delivery_address_floor || null,
        address_room: raw?.delivery_address_room || null,
        address_extra: raw?.delivery_address_extra || null,
        address_address_code: raw?.delivery_address_address_code || null,
        courier_courier_id: raw?.courier_courier_id || null,
        courier_courier_name: raw?.courier_courier_name || null,
        courier_account: raw?.courier_account || null,
        courier_login_time_stamp: raw?.courier_login_time_stamp || null,
        courier_supplier_id: raw?.courier_supplier_id || null,
        courier_deleted: raw?.courier_deleted || null,
        courier_create_time_stamp: raw?.courier_create_time_stamp || null,
        total_price: totalPrice,
        arrears: order.customerInSupplier?.init_arrears || null,
      } as OrderListItem;
    });
  }

  async createOrder(request: CreateOrderRequest, supplier_id: string): Promise<CreateOrderResponse> {
    return this.dataSource.transaction(async (manager) => {
      const orderId = await this.generateOrderId(supplier_id);

      const orderListEntity = manager.create(OrderList as any, {
        order_id: orderId,
        cis_id: request.order_infos.cis_id,
        contact_phone: request.order_infos.contact_phone,
        note: request.order_infos.note,
        order_status: 'undelivery',
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

  async updateOrderPayment(request: UpdateOrderPaymentRequest): Promise<UpdateOrderPaymentResponse> {
    const { payment_amount_infos } = request;
    const { order_id } = payment_amount_infos;

    return this.dataSource.transaction(async (manager) => {
      const existingOrder = await manager.findOne(OrderList as any, { where: { order_id } });
      if (!existingOrder) throw new Error(`Order with ID ${order_id} not found`);
      const cisId: string = (existingOrder as any).cis_id;

      for (const refund of payment_amount_infos.order_refund_list) {
        if (refund.order_refund_id) {
          await manager.update(
            OrderRefund as any,
            { order_refund_id: refund.order_refund_id },
            {
              refund_gas_kilogram: refund.refund_gas_kilogram,
              refund_gas_type: String(refund.refund_gas_type),
              gas_price: refund.gas_price,
              order_refund_type: refund.order_refund_type as any,
            },
          );
        } else {
          const newRefund = manager.create(OrderRefund as any, {
            order_id,
            refund_gas_kilogram: refund.refund_gas_kilogram,
            refund_gas_type: String(refund.refund_gas_type),
            gas_price: refund.gas_price,
            order_refund_type: refund.order_refund_type as any,
          });
          await manager.save(OrderRefund as any, newRefund);
        }
      }

      const payupWorks: any[] = [];

      if (payment_amount_infos.order_payment_amount > 0) {
        const payupWork = manager.create(OrderPayupWork as any, {
          pay_way: WorkPayWayEnum.cash,
          payment_amount: payment_amount_infos.order_payment_amount,
        });
        const saved: any = await manager.save(payupWork as any);
        payupWorks.push(saved);
        await manager.save(manager.create(OrderPayup as any, {
          order_id,
          order_payup_work_id: saved.order_payup_work_id,
          payment_amount: payment_amount_infos.order_payment_amount,
          is_arrears_order: false,
        }));
      }

      if (payment_amount_infos.cis_payment_amount > 0) {
        const payupWork = manager.create(OrderPayupWork as any, {
          pay_way: WorkPayWayEnum.e_wallet,
          payment_amount: payment_amount_infos.cis_payment_amount,
        });
        const saved: any = await manager.save(payupWork as any);
        payupWorks.push(saved);
        await manager.save(manager.create(OrderPayup as any, {
          order_id,
          order_payup_work_id: saved.order_payup_work_id,
          payment_amount: payment_amount_infos.cis_payment_amount,
          is_arrears_order: false,
        }));
        await manager.save(manager.create(CisWallet as any, {
          cis_id: cisId,
          order_id,
          payment_flow_type: PaymentFlowTypeEnum.payment,
          money: -payment_amount_infos.cis_payment_amount,
          create_time_stamp: new Date().toISOString(),
        }));
      }

      if (payment_amount_infos.check_payment_amount > 0) {
        const payupWork = manager.create(OrderPayupWork as any, {
          pay_way: WorkPayWayEnum.check,
          payment_amount: payment_amount_infos.check_payment_amount,
        });
        const saved: any = await manager.save(payupWork as any);
        payupWorks.push(saved);
        await manager.save(manager.create(OrderPayup as any, {
          order_id,
          order_payup_work_id: saved.order_payup_work_id,
          payment_amount: payment_amount_infos.check_payment_amount,
          is_arrears_order: false,
        }));
        if (payment_amount_infos.check_infos?.check_number) {
          await manager.save(manager.create(Check as any, {
            order_payup_work_id: saved.order_payup_work_id,
            check_number: payment_amount_infos.check_infos.check_number,
          }));
        }
      }

      if (payment_amount_infos.discount !== undefined) {
        await manager.update(OrderList as any, { order_id }, { discount: payment_amount_infos.discount });
      }

      if (payment_amount_infos.arrears_payup_amoumt) {
        const ap = payment_amount_infos.arrears_payup_amoumt;
        if (ap.order_payment_amount > 0) {
          const saved: any = await manager.save(manager.create(OrderPayupWork as any, {
            pay_way: WorkPayWayEnum.cash,
            payment_amount: ap.order_payment_amount,
          }));
          await manager.save(manager.create(OrderPayup as any, {
            order_id,
            order_payup_work_id: saved.order_payup_work_id,
            payment_amount: ap.order_payment_amount,
            is_arrears_order: true,
          }));
        }
        if (ap.cis_payment_amount > 0) {
          const saved: any = await manager.save(manager.create(OrderPayupWork as any, {
            pay_way: WorkPayWayEnum.e_wallet,
            payment_amount: ap.cis_payment_amount,
          }));
          await manager.save(manager.create(OrderPayup as any, {
            order_id,
            order_payup_work_id: saved.order_payup_work_id,
            payment_amount: ap.cis_payment_amount,
            is_arrears_order: true,
          }));
          await manager.save(manager.create(CisWallet as any, {
            cis_id: cisId,
            order_id,
            payment_flow_type: PaymentFlowTypeEnum.payment,
            money: -ap.cis_payment_amount,
            create_time_stamp: new Date().toISOString(),
          }));
        }
        if (ap.check_payment_amount > 0) {
          const saved: any = await manager.save(manager.create(OrderPayupWork as any, {
            pay_way: WorkPayWayEnum.check,
            payment_amount: ap.check_payment_amount,
          }));
          await manager.save(manager.create(OrderPayup as any, {
            order_id,
            order_payup_work_id: saved.order_payup_work_id,
            payment_amount: ap.check_payment_amount,
            is_arrears_order: true,
          }));
          if (ap.check_infos?.check_number) {
            await manager.save(manager.create(Check as any, {
              order_payup_work_id: saved.order_payup_work_id,
              check_number: ap.check_infos.check_number,
            }));
          }
        }
      }

      return { message: '成功完成' } as UpdateOrderPaymentResponse;
    });
  }

  async generateOrderId(supplier_id: string): Promise<string> {
    const supplier = await this.supplierRepo.findBy({ supplier_id });
    const prefix = supplier[0]?.prefix;
    const row = await this.orderRepo
      .createQueryBuilder('order_list')
      .select("MAX(split_part(order_list.order_id, '_', 2)::int)", 'id_second_text')
      .where('order_list.order_id like :prefix', { prefix: `%${prefix}O_%` })
      .getRawOne();
    if (!row || row.id_second_text == null) return `${prefix}O_1`;
    return `${prefix}O_${row.id_second_text + 1}`;
  }
}


