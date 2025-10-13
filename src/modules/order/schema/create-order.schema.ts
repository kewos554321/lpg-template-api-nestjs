import { CarrierTypeEnum, DeliveryTypeEnum, TimeSlotEnum } from '@artifact/lpg-api-service';

import { CreateOrderInterface } from '../interface/create-order.interface.js';

export const createOrderSchema: any = {
  type: 'object',
  properties: {
    orderInfo: {
      type: 'object',
      properties: {
        customerPhone: { type: 'string' },
        contactPhone: { type: 'string' },
        customerNote: { type: 'string', nullable: true },
        deliveryType: { type: 'string', enum: Object.values(DeliveryTypeEnum) },
        timeSlot: { type: 'string', enum: Object.values(TimeSlotEnum) },
        taxIdNumber: { type: 'string', nullable: true },
        customerAddressId: { type: 'number' },
        gasDiscount: { type: 'number' },
      },
      required: [
        'customerPhone',
        'contactPhone',
        'deliveryType',
        'timeSlot',
        'customerAddressId',
        'gasDiscount',
      ],
      additionalProperties: false,
    },
    orderGasList: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          gpId: { type: 'number', nullable: true },
          cisGpId: { type: 'number', nullable: true },
          numberOfCylinder: { type: 'number' },
          deliveryInfo: {
            type: 'object',
            properties: {
              customerDeliveryId: { type: 'number', nullable: true },
              customerAddressId: { type: 'number' },
              deliveryLocation: { type: 'string' },
              usageName: { type: 'string' },
              floor: { type: 'number' },
              isElevator: { type: 'boolean' },
            },
            required: ['customerAddressId', 'deliveryLocation', 'usageName', 'isElevator'],
            additionalProperties: false,
            nullable: true,
          },
        },
        required: ['numberOfCylinder'],
        additionalProperties: false,
      },
    },
    orderCommodityList: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          commodityPriceId: { type: 'number' },
          numberOfCommodity: { type: 'number' },
        },
        required: ['commodityPriceId', 'numberOfCommodity'],
        additionalProperties: false,
      },
    },
    orderUsageFeeList: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          numberOfRecords: { type: 'number' },
          money: { type: 'number' },
        },
        required: ['numberOfRecords', 'money'],
        additionalProperties: false,
      },
    },
    customerInfoInOrder: {
      type: 'object',
      properties: {
        customerId: { type: 'number' },
        invoiceCarrier: { type: 'string' },
        carrierType: { type: 'string', enum: Object.values(CarrierTypeEnum) },
      },
      required: ['customerId', 'invoiceCarrier', 'carrierType'],
      additionalProperties: false,
      nullable: true,
    },
  },
  required: ['orderInfo', 'orderGasList', 'orderCommodityList', 'orderUsageFeeList'],
  additionalProperties: false,
} as const;
