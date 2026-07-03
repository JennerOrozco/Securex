export interface LeadSource {
  uuid: string;
  source_name: string;
  sort_order: number;
  is_active: boolean | number;
  created_at?: string;
}

export interface LossReason {
  uuid: string;
  reason_name: string;
  sort_order: number;
  is_active: boolean | number;
  created_at?: string;
}

export interface TaskType {
  uuid: string;
  type_name: string;
  icon_reference?: string;
  sort_order: number;
  is_active: boolean | number;
  created_at?: string;
}

export interface Stage {
  uuid: string;
  stage_name: string;
  sort_order: number;
  is_active: boolean | number;
  created_at?: string;
}

export interface Pipeline {
  uuid: string;
  name: string;
  is_active: boolean | number;
  created_at?: string;
}

export interface Contact {
  uuid: string;
  company_uuid?: string;
  account_uuid?: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  position?: string;
  address?: string;
  nit?: string;
  is_active: boolean | number;
  account?: { uuid: string; account_name: string; industry?: string };
  created_at?: string;
}

export interface ContactB2b {
  uuid: string;
  branch_uuid?: string;
  nombre: string;
  correo?: string;
  puesto?: string;
  telefono?: string;
  branch?: { uuid: string; branch_name: string };
}

export interface Account {
  uuid: string;
  company_uuid?: string;
  account_name: string;
  nit?: string;
  main_email?: string;
  industry?: string;
  website?: string;
  is_active: boolean | number;
  contacts?: Contact[];
  branches?: AccountBranch[];
}

export interface AccountBranch {
  uuid: string;
  account_uuid?: string;
  branch_name: string;
  address?: string;
  phone?: string;
  ciudad?: string;
  estado?: string;
  account?: { account_name: string };
  contactB2b?: ContactB2b[];
}

export interface Opportunity {
  uuid: string;
  company_uuid?: string;
  account_uuid?: string;
  branch_uuid?: string;
  contact_uuid?: string;
  assigned_user_uuid?: string;
  stage_uuid?: string;
  title: string;
  type?: string;
  estimated_value?: number;
  probability?: number;
  closing_date?: string;
  status?: string;
  is_active: boolean | number;
  account?: { uuid: string; account_name: string; industry?: string; website?: string };
  branch?: { uuid: string; branch_name: string; address?: string; phone?: string; ciudad?: string; estado?: string };
  stage?: { uuid: string; stage_name: string; probability_percentage?: number };
  contact?: { uuid: string; first_name: string; last_name: string; email?: string; phone?: string };
  lineItems?: OpportunityLineItem[];
}

export interface OpportunityLineItem {
  uuid: string;
  product_uuid?: string;
  quantity: number;
  unit_price: number;
  discount?: number;
  total?: number;
  product?: { uuid: string; product_name: string; item_type?: number; sku?: string; unit_price?: number };
}

export interface Lead {
  uuid: string;
  company_uuid?: string;
  assigned_user_uuid?: string;
  source_uuid?: string;
  loss_reason_uuid?: string;
  first_name: string;
  last_name: string;
  company?: string;
  email?: string;
  phone?: string;
  status?: string;
  is_active: boolean | number;
  source?: { uuid: string; name: string };
  lossReason?: { uuid: string; name: string };
}

export interface CrmProduct {
  uuid: string;
  company_uuid?: string;
  sku: string;
  product_name: string;
  description?: string;
  unit_price: number;
  is_active: boolean | number;
  photos?: { uuid: string; photo_url: string; is_primary: boolean }[];
}

export interface CrmItem {
  uuid: string;
  sku: string;
  item_name: string;
  item_type: number;
  track_inventory: boolean;
  unit_price: number;
  average_cost: number;
  is_active: boolean | number;
  description?: string;
  photos?: { uuid: string; photo_url: string; is_primary: boolean }[];
}

export interface ActivityLog {
  uuid: string;
  company_uuid?: string;
  user_uuid?: string;
  entity_type: string;
  entity_uuid: string;
  action_type: string;
  description?: string;
  old_values?: any;
  new_values?: any;
}

export interface DocumentType {
  uuid: string;
  name: string;
  is_active: boolean | number;
  created_at?: string;
}

export interface Note {
  uuid: string;
  entity_type: string;
  entity_uuid: string;
  note_content: string;
  created_at?: string;
}
