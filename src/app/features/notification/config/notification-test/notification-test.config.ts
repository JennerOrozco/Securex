import { TableColumn } from '@shared/table-shared/shared/table.types';

export const APP_COLS: TableColumn[] = [
  { 
    field: 'name', header: 'Aplicación', type: 'user', sortable: true,
    avatarRender: (row: any) => row.icon || '',
    render: (row: any) => row.name || 'N/A',
    subField: 'uuid',
    subFieldRender: (row: any) => row.uuid ? `UUID: ${row.uuid.substring(0, 8)}...` : ''
  },
  { field: 'acciones', header: 'Acciones', type: 'actions' }
];

export const COMPANY_COLS: TableColumn[] = [
  { 
    field: 'name', header: 'Compañía', type: 'user', sortable: true,
    avatarRender: (row: any) => row.logo || '',
    fallbackIcon: 'pi pi-building',
    render: (row: any) => row.name || 'N/A',
    subField: 'tax_id',
    subFieldRender: (row: any) => row.tax_id || 'Sin NIT'
  },
  { field: 'acciones', header: 'Acciones', type: 'actions' }
];

export const USER_COLS: TableColumn[] = [
  { 
    field: 'full_name', header: 'Usuario', type: 'user', sortable: true,
    avatarRender: (row: any) => row.profile_picture || '',
    fallbackIcon: 'pi pi-user',
    render: (row: any) => row.full_name || 'Desconocido',
    subField: 'email',
    subFieldRender: (row: any) => row.email || 'Sin correo'
  },
  { field: 'acciones', header: 'Acciones', type: 'actions' }
];
