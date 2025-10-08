import { CreateCustomerAddressInterface } from '../interface/create-delivery.interface';

export const createAddressSchema = {
  type: 'object',
  properties: {
    customer_id: { type: 'number' },
    city: { type: 'string', nullable: true },
    site_id: { type: 'string', nullable: true },
    village: { type: 'string', nullable: true },
    neighborhood: { type: 'string', nullable: true },
    road: { type: 'string', nullable: true },
    section: { type: 'string', nullable: true },
    lane: { type: 'string', nullable: true },
    alley: { type: 'string', nullable: true },
    address_number: { type: 'string', nullable: true },
    floor: { type: 'string', nullable: true },
    room: { type: 'string', nullable: true },
    extra: { type: 'string', nullable: true },
  },
  required: ['customer_id'],
  additionalProperties: false,
};
