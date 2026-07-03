import { FormField } from '@shared/modals/modal-shell/modal-shell.types';
import { TableColumn } from '@shared/table-shared/shared/table.types';

export interface SystemRole {
  uuid: string;
  name: string;
  description?: string;
  created_at?: string;
}

export const ROLE_FORM_FIELDS: FormField[] = [
  { name: 'name', label: 'Nombre del Rol', type: 'text', required: true, icon: 'pi pi-tag' },
  { name: 'description', label: 'Descripción', type: 'textarea' }
];

export const ROLE_TABLE_COLUMNS: TableColumn[] = [
  { field: 'name', header: 'Rol', type: 'role', sortable: true },
  { field: 'company_name', header: 'Compañía', type: 'text', sortable: true, render: (row) => row.company?.name || row.company_uuid || 'Global' },
  { field: 'description', header: 'Descripción', type: 'text', sortable: true },
  { field: 'is_active', header: 'Estado', type: 'badge', sortable: true, render: (row) => ({ value: row.is_active ? 'Activo' : 'Inactivo', severity: row.is_active ? 'success' : 'danger' }) },
  { field: 'acciones', header: 'Acciones', type: 'actions' }
];
