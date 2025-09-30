import { OrderList } from "@artifact/lpg-api-service/dist/database/entities/order_list";
import { Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { OrderInfo, GetOrderListRequest, OrderListItem } from "./dto/order.dto";

@Injectable()
export class OrderRepository {
  constructor(
    @InjectRepository(OrderList) private readonly orderListRepository: Repository<OrderList>,
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
      .leftJoin('DeliveryAddress', 'delivery_address', 'delivery_address.address_id = order_list.address_id')
      .addSelect([
        'delivery_address.address_id as delivery_address_address_id',
        'delivery_address.fullAddress as delivery_address_full_address',
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
}