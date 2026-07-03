import { TableColumn } from '@shared/table-shared/shared/table.types';
import { FormField } from '@shared/modals/modal-shell/modal-shell.types';

export const BRANCHES_COLS: TableColumn[] = [
  { field: 'name', header: 'Nombre', type: 'tree', sortable: true, style: { width: '30%' } },
  { field: 'address', header: 'Dirección', type: 'text', sortable: true, style: { width: '25%' } },
  { field: 'phone', header: 'Teléfono', type: 'text', sortable: true, style: { width: '20%' } },
  { field: 'is_active', header: 'Estado', type: 'badge', style: { width: '10%', textAlign: 'center' }, render: (row) => ({ value: row.is_active ? 'Activo' : 'Inactivo', severity: row.is_active ? 'success' : 'danger' }) },
  { field: 'actions', header: 'Acciones', type: 'actions', style: { width: '15%', 'text-align': 'center' } }
];

export const createBranchesForm = (companies: any[]): FormField[] => [
  { name: 'name', label: 'Nombre de Sucursal', type: 'text', required: true, icon: 'pi pi-sitemap' },
  { name: 'company_id', label: 'Compañía', type: 'select', required: true, options: companies.map((c: any) => ({ label: c.name, value: c.id })) },
  { name: 'address', label: 'Dirección', type: 'text', icon: 'pi pi-map-marker' },
  { name: 'phone', label: 'Teléfono', type: 'phone', icon: 'pi pi-phone' },
  { name: 'is_active', label: '¿Activa?', type: 'select', required: true, options: [{ label: 'Sí', value: true }, { label: 'No', value: false }] }
];
