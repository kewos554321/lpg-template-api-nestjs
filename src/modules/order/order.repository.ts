import { OrderList } from "@artifact/lpg-api-service/dist/database/entities/order_list";
import { Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class OrderRepository {
  constructor(
    @InjectRepository(OrderList) private readonly orderListRepository: Repository<OrderList>,
  ) {}

  async getOrderListById(order_id: string): Promise<OrderList[]> {
    return this.orderListRepository.find({
      where: {
        order_id,
      },
    });
  }
}