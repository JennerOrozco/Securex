import { TableColumn } from '../../../shared/table-shared/shared/table.types';

export enum ProfileTab {
  INFO = 'info',
  SECURITY = 'security',
  DEVICES = 'devices',
}

export interface ProfileData {
  uuid: string;
  full_name: string;
  email: string;
  role_name?: string;
  role_id?: number;
  company_name?: string;
  branch?: {
    uuid: string;
    name: string;
  };
  profile_picture?: string;
  phone?: string;
}

export const DEVICE_TABLE_COLUMNS: TableColumn[] = [
  { field: 'device_name', header: 'Dispositivo', type: 'text' },
  { field: 'created_at', header: 'Fecha de Registro', type: 'date' },
  { field: 'acciones', header: 'Acciones', type: 'actions' }
];
