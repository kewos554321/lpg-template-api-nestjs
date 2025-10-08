export interface CreateCustomerAddressInterface {
  customer_id: number;
  city?: string | null;
  site_id?: string | null;
  village?: string | null;
  neighborhood?: string | null;
  road?: string | null;
  section?: string | null;
  alley?: string | null;
  lane?: string | null;
  address_number?: string | null;
  floor?: string | null;
  room?: string | null;
  extra?: string | null;
}
