import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryRunner } from 'typeorm';
import {
  AddressBinding,
  CisGasPrice,
  Customer,
  CustomerDelivery,
  CustomerInSuppliers,
  DeliveryTypeEnum,
  GasPrice,
  OrderCommodity,
  OrderDeliveryStatusEnum,
  OrderGas,
  OrderList,
  OrderStatusEnum,
  OrderUsageFee,
  Supplier,
  typeormHelper,
} from '@artifact/lpg-api-service';
import _ from 'lodash';
import { CreateOrderGasInterface } from './interface/create-order.interface.js';

export enum OrderListStatus {
  delivering = '正在配送中',
  waiting = '等待接單',
  scheduled = '預約配送訂單',
  accomplish = '訂單已完成',
}

@Injectable()
export class OrderRepository {
  constructor(
    @InjectRepository(OrderList) private readonly orderRepository: Repository<OrderList>,
    @InjectRepository(Supplier) private readonly supplierRepository: Repository<Supplier>,
    @InjectRepository(CisGasPrice) private readonly cisGasPriceRepository: Repository<CisGasPrice>,
    @InjectRepository(GasPrice) private readonly gasPriceRepository: Repository<GasPrice>,
    @InjectRepository(CustomerDelivery) private readonly customerDeliveryRepository: Repository<CustomerDelivery>,
  ) {}

  private returnOrderBaseInfo() {
    const orderModel = this.orderRepository
      .createQueryBuilder('order_list')
      .select()
      .leftJoinAndSelect('order_list.order_gas_list', 'orderGasList')
      .leftJoinAndSelect('orderGasList.gas_price_info', 'gasPrice')
      .leftJoinAndSelect('orderGasList.cis_gas_price_info', 'cisGasPrice')
      .leftJoinAndSelect('gasPrice.gas_cylinder_info', 'gasCylinder')
      .leftJoinAndSelect('cisGasPrice.gas_cylinder_info', 'cisGasCylinder')
      .leftJoinAndSelect('orderGasList.customer_delivery_info', 'customerDelivery')
      .leftJoinAndSelect('order_list.order_commodity_list', 'orderCommodityList')
      .leftJoinAndSelect('orderCommodityList.commodity_price_info', 'commodityPrice')
      .leftJoinAndSelect('commodityPrice.commodity_info', 'commodity')
      .leftJoinAndSelect('order_list.order_usage_fee_list', 'orderUsageFeeList')
      .leftJoinAndSelect('order_list.order_refund_list', 'order_refund_list')
      .leftJoin(
        (subQuery) => {
          return subQuery
            .select([
              'address.cis_id as cis_id',
              'address_binding.address_binding_id as address_binding_id',
            ])
            .from(AddressBinding, 'address_binding')
            .leftJoin('address_binding.customerAddressInfo', 'customerAddress')
            .leftJoin('address_binding.addressInfo', 'address')
            .leftJoin('address.cis_info', 'cisInfo')
            .where('customerAddress.deleted = false')
            .andWhere('address.deleted = false');
        },
        'lastest_address_binding',
        'lastest_address_binding.cis_id = order_list.cis_id',
      )
      .leftJoinAndSelect(
        'order_list.address_binding_info',
        'addressBinding',
        'addressBinding.address_binding_id = lastest_address_binding.address_binding_id',
      )
      .leftJoinAndSelect('addressBinding.customerAddressInfo', 'customerAddress')
      .leftJoinAndSelect('order_list.courier_info', 'courier')
      .leftJoinAndSelect('order_list.cylinder_action_list', 'cylinder_action_list')
      .leftJoinAndSelect('cylinder_action_list.cylinderInfo', 'cylinder')
      .leftJoinAndSelect('order_list.customerInSupplier', 'customerInSupplier')
      .leftJoinAndSelect('customerInSupplier.customer_info', 'customer')
      .leftJoinAndSelect('order_list.order_payup_list', 'order_payup_list')
      .leftJoinAndSelect('order_payup_list.order_payup_work_info', 'order_payup_work');

    return orderModel;
  }

  public async getOrderInfo(orderId: string) {
    const orderInfo = await this.returnOrderBaseInfo()
      .where('order_list.order_id = :orderId', { orderId })
      .getOne();
    return orderInfo as any;
  }

  public async getOrderList(
    page: number,
    size: number,
    customerId: number,
    supplierId: string,
    isAccomplished: boolean,
  ) {
    const selectOrderListModel = this.returnOrderBaseInfo()
      .skip(page * size)
      .take(size)
      .where('customerAddress.customer_id = :customerId', { customerId })
      .andWhere('customerInSupplier.supplier_id = :supplierId', { supplierId });

    if (isAccomplished) {
      selectOrderListModel.andWhere('order_list.order_status = :orderStatus', {
        orderStatus: OrderStatusEnum.accomplish,
      });
    } else {
      selectOrderListModel.andWhere('order_list.order_status != :orderStatus', {
        orderStatus: OrderStatusEnum.accomplish,
      });
    }

    const orderList = await selectOrderListModel
      .addSelect(
        `CASE
            WHEN 
              order_list.order_status = '${OrderStatusEnum.delivering}' 
              AND (order_list.order_delivery_status = '${OrderDeliveryStatusEnum.picked}' OR 
              order_list.order_delivery_status = '${OrderDeliveryStatusEnum.accomplish}')
            THEN 1
            WHEN order_list.order_status = '${OrderStatusEnum.undelivery}'
            THEN 2
            WHEN order_list.delivery_type = '${DeliveryTypeEnum.scheduledDelivery}'
            THEN 3
            ELSE 4
        END`,
        'delivery_status_order',
      )
      .orderBy('delivery_status_order', 'ASC')
      .addOrderBy('order_list.create_time_stamp', 'DESC')
      .getMany();
    const rowsCount = await selectOrderListModel.getCount();
    return {
      data: orderList,
      rowsCount,
    } as any;
  }

  public async getGasPriceList(supplierId: string, gasType?: string, kilogram?: number) {
    const maxEffectTimeSubQuery = this.gasPriceRepository
      .createQueryBuilder('gas_price')
      .select('gas_cylinder.gas_id, MAX(gas_price.effect_time_stamp)')
      .leftJoin('gas_price.gas_cylinder_info', 'gas_cylinder')
      .distinctOn(['gas_cylinder.gas_id'])
      .groupBy('gas_cylinder.gas_id')
      .andWhere('gas_price.deleted = :deleted')
      .andWhere('gas_price.effect_time_stamp <= :nowDate')
      .andWhere('gas_cylinder.visible = :visible')
      .andWhere('gas_cylinder.supplier_id = :supplierId');

    if (!_.isUndefined(gasType)) {
      maxEffectTimeSubQuery.andWhere('gas_cylinder.gas_type = :theGasType');
    }
    if (!_.isUndefined(kilogram)) {
      maxEffectTimeSubQuery.andWhere('gas_cylinder.kilogram = :theKilogram');
    }

    const priceListQuery = this.gasPriceRepository
      .createQueryBuilder('gas_price')
      .select([
        'gas_price.gp_id',
        'gas_price.upload_time_stamp',
        'gas_price.effect_time_stamp',
        'gas_price.price',
        'gas_price.user_id',
        'gas_price.deleted',
        'gas_cylinder',
      ])
      .leftJoin('gas_price.gas_cylinder_info', 'gas_cylinder')
      .orderBy('gas_cylinder.kilogram', 'ASC')
      .where('gas_price.deleted = false');
    if (!_.isUndefined(gasType)) {
      priceListQuery.andWhere(
        `(gas_price.gas_id, gas_price.effect_time_stamp) In(${maxEffectTimeSubQuery.getSql()})`,
        {
          deleted: false,
          nowDate: new Date().toISOString(),
          visible: true,
          supplierId,
          theGasType: gasType,
        },
      );
    }
    if (!_.isUndefined(kilogram)) {
      priceListQuery.andWhere(
        `(gas_price.gas_id, gas_price.effect_time_stamp) In(${maxEffectTimeSubQuery.getSql()})`,
        {
          deleted: false,
          nowDate: new Date().toISOString(),
          visible: true,
          supplierId,
          theKilogram: kilogram,
        },
      );
    }
    if (_.isUndefined(gasType) && _.isUndefined(kilogram)) {
      priceListQuery.andWhere(
        `(gas_price.gas_id, gas_price.effect_time_stamp) In(${maxEffectTimeSubQuery.getSql()})`,
        {
          deleted: false,
          nowDate: new Date().toISOString(),
          visible: true,
          supplierId,
        },
      );
    }

    const gasPriceList = await priceListQuery.getMany();
    return gasPriceList as any;
  }

  public async getCisGasPriceList(
    customerId: number,
    supplierId: string,
    gasType?: string,
    kilogram?: number,
  ) {
    const maxEffectTimeSubQuery = this.cisGasPriceRepository
      .createQueryBuilder('cis_gas_price')
      .select('gas_cylinder.gas_id, MAX(cis_gas_price.effect_time_stamp)')
      .leftJoin('cis_gas_price.gas_cylinder_info', 'gas_cylinder')
      .leftJoin('cis_gas_price.customerInSupplier', 'customerInSupplier')
      .groupBy('gas_cylinder.gas_id')
      .andWhere('cis_gas_price.deleted = :deleted')
      .andWhere('cis_gas_price.effect_time_stamp <= :nowDate')
      .andWhere('customerInSupplier.customer_id = :customerId')
      .andWhere('gas_cylinder.visible = :visible')
      .andWhere('gas_cylinder.supplier_id = :supplierId');

    const querySelectConditions: any = {
      deleted: false,
      nowDate: new Date().toISOString(),
      visible: true,
      supplierId,
      customerId,
    };

    if (!_.isUndefined(gasType)) {
      maxEffectTimeSubQuery.andWhere('gas_cylinder.gas_type = :theGasType)');
      querySelectConditions.theGasType = gasType;
    }
    if (!_.isUndefined(kilogram)) {
      maxEffectTimeSubQuery.andWhere('gas_cylinder.kilogram = :theKilogram');
      querySelectConditions.theKilogram = kilogram;
    }

    const gasPriceList = await this.cisGasPriceRepository
      .createQueryBuilder('cis_gas_price')
      .select()
      .leftJoinAndSelect('cis_gas_price.gas_cylinder_info', 'gas_cylinder')
      .leftJoin('cis_gas_price.customerInSupplier', 'customerInSupplier')
      .where('customerInSupplier.customer_id = :customerId', { customerId })
      .andWhere('customerInSupplier.supplier_id = :supplierId', { supplierId })
      .andWhere(
        `(cis_gas_price.gas_id, cis_gas_price.effect_time_stamp) In(${maxEffectTimeSubQuery.getSql()})`,
        querySelectConditions,
      )
      .andWhere('cis_gas_price.deleted = false')
      .orderBy('gas_cylinder.kilogram', 'ASC')
      .getMany();

    return gasPriceList as any;
  }

  public selectOrderModel(columnList?: any) {
    if (_.isUndefined(columnList) || columnList?.length === 0) {
      return this.orderRepository.createQueryBuilder('order_list').select();
    }
    return this.orderRepository.createQueryBuilder('order_list').select(columnList);
  }

  public async generateOrderId(supplierId: string) {
    const supplierResult = await this.supplierRepository.findBy({ supplier_id: supplierId });
    const checkOrderId = await this.orderRepository
      .createQueryBuilder('order_list')
      .select("MAX(split_part(order_list.order_id, '_', 2)::int)", 'id_second_text')
      .where('order_list.order_id like :prefix', { prefix: `%${supplierResult[0]!.prefix}O_%` })
      .getRawOne();

    if (_.isUndefined(checkOrderId)) {
      return `${supplierResult[0]!.prefix}O_1`;
    }
    return `${supplierResult[0]!.prefix}O_${(checkOrderId as any).id_second_text + 1}`;
  }

  public async createOrder(
    orderInfo: Partial<OrderList>,
    orderGasList: Array<CreateOrderGasInterface>,
    orderCommodityList: Partial<OrderCommodity>[],
    orderUsageFeeList: Partial<OrderUsageFee>[],
    customerDeliveryList: Partial<CustomerDelivery>[],
    saveCustomerInfoInOrder?: Partial<Customer>,
    cisInfo?: Partial<CustomerInSuppliers>,
  ) {
    const cb = async (queryRunner: QueryRunner) => {
      const promise1Result = await Promise.all([
        queryRunner.manager.insert(OrderList, orderInfo),
        saveCustomerInfoInOrder ? queryRunner.manager.save(Customer, saveCustomerInfoInOrder) : null,
        cisInfo ? queryRunner.manager.save(CustomerInSuppliers, cisInfo) : null,
        queryRunner.manager.save(CustomerDelivery, customerDeliveryList),
      ]);
      const orderResult: any = promise1Result[0];
      const customerDeliveryResult: any = promise1Result[3];

      const insertOrderGasList: Partial<OrderGas>[] = orderGasList.map((item) => {
        if ((item as any).deliveryInfo) {
          const findDelivery = customerDeliveryResult.find(
            (delivery) =>
              delivery.delivery_location === (item as any).deliveryInfo!.deliveryLocation &&
              delivery.usage_name === (item as any).deliveryInfo!.usageName &&
              delivery.floor === (item as any).deliveryInfo!.floor &&
              delivery.is_elevator === (item as any).deliveryInfo!.isElevator,
          );
          return {
            gp_id: (item as any).gpId,
            cis_gp_id: (item as any).cisGpId,
            order_id: orderResult.identifiers[0]!.order_id,
            numbers_of_cylinder: (item as any).numberOfCylinder,
            customer_delivery_id: findDelivery!.customer_delivery_id,
          } as any;
        }
        return {
          gp_id: (item as any).gpId,
          cis_gp_id: (item as any).cisGpId,
          order_id: orderResult.identifiers[0]!.order_id,
          numbers_of_cylinder: (item as any).numberOfCylinder,
        } as any;
      });

      const promise2Result = await Promise.all([
        queryRunner.manager.insert(OrderGas, insertOrderGasList),
        queryRunner.manager.insert(
          OrderCommodity,
          orderCommodityList.map((item) => ({
            ...item,
            order_id: orderResult.identifiers[0]!.order_id,
          })),
        ),
        queryRunner.manager.insert(
          OrderUsageFee,
          orderUsageFeeList.map((item) => ({
            ...item,
            order_id: orderResult.identifiers[0]!.order_id,
          })),
        ),
      ]);
      const orderGasResult = promise2Result[0];
      const orderCommodityResult = promise2Result[1];
      const orderCylinderUsageFeeResult = promise2Result[2];

      return {
        orderResult,
        orderGasResult,
        orderCommodityResult,
        orderCylinderUsageFeeResult,
      } as any;
    };

    const result = await typeormHelper.databaseTransaction(cb);
    return result as any;
  }
}


