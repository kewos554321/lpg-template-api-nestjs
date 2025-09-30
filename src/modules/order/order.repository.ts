import { OrderList } from "@artifact/lpg-api-service/dist/database/entities/order_list";
import { Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { OrderInfo } from "./dto/order.dto";

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
}