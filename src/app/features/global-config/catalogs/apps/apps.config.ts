import { TableColumn } from '@shared/table-shared/shared/table.types';
import { FormField } from '@shared/modals/modal-shell/modal-shell.types';

export const APPS_COLS: TableColumn[] = [
  { field: 'name', header: 'Nombre', type: 'text', style: { width: '30%' }, sortable: true },
  { field: 'slug', header: 'Slug', type: 'text', style: { width: '30%' }, sortable: true },
  { field: 'api_key', header: 'API KEY', type: 'text', style: { width: '15%' }, sortable: true },
  {
    field: 'is_active', header: 'Estado', type: 'badge', style: { width: '10%', textAlign: 'center' },
    sortable: true, filterOptions: [{ label: 'Activo', value: true }, { label: 'Inactivo', value: false }], filterOptionLabel: 'label',
    render: (row) => ({ value: row.is_active ? 'Activo' : 'Inactivo', severity: row.is_active ? 'success' : 'danger' })
  },
  { field: 'actions', header: 'Acciones', type: 'actions', style: { width: '15%', textAlign: 'center' } }
];

export const APPS_FORM_FIELDS: FormField[] = [
  { name: 'name', label: 'Nombre', type: 'text', required: true, icon: 'pi pi-th-large' },
  { name: 'slug', label: 'Slug', type: 'text', required: true, icon: 'pi pi-tag' },
  { name: 'api_key', label: 'API Key', type: 'text', required: true, icon: 'pi pi-key' },
  { name: 'api_secret', label: 'API Secret', type: 'text', required: true, icon: 'pi pi-lock' },
  { name: 'is_active', label: 'Activo', type: 'select', options: [{ label: 'Sí', value: true }, { label: 'No', value: false }] },
  { name: 'google_client_id', label: 'Google Client ID', type: 'text', required: false, icon: 'pi pi-google' },
  { name: 'google_client_secret', label: 'Google Client Secret', type: 'text', required: false, icon: 'pi pi-shield' }
];
