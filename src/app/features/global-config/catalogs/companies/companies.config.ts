import { TableColumn } from '@shared/table-shared/shared/table.types';
import { FormField } from '@shared/modals/modal-shell/modal-shell.types';

export const COMPANIES_COLS: TableColumn[] = [
  { field: 'name', header: 'Nombre', type: 'tree', sortable: true, style: { width: '40%' } },
  { field: 'tax_id', header: 'NIT', type: 'text', sortable: true, style: { width: '20%' } },
  { field: 'is_active', header: 'Estado', type: 'badge', style: { width: '15%', textAlign: 'center' }, render: (row) => ({ value: row.is_active ? 'Activo' : 'Inactivo', severity: row.is_active ? 'success' : 'danger' }) },
  { field: 'actions', header: 'Acciones', type: 'actions', style: { width: '25%', 'text-align': 'center' } }
];

export const createCompaniesForm = (apps: any[]): FormField[] => [
  { name: 'name', label: 'Nombre de la Compañía', type: 'text', required: true },
  { name: 'tax_id', label: 'NIT / Identificación Fiscal', type: 'nit', required: true },
  { name: 'app_id', label: 'Aplicación Asociada', type: 'select', required: false, options: apps.map(app => ({ label: app.name, value: app.id })) },
  { name: 'logo_url', label: 'Logo de la Compañía', type: 'file', required: false, accept: 'image/*' },
  { name: 'is_active', label: '¿Está Activa?', type: 'select', required: true, options: [{ label: 'Activo', value: true }, { label: 'Inactivo', value: false }] }
];
