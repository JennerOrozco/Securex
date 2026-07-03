import { TableColumn } from '@shared/table-shared/shared/table.types';

export const APPS_COLS: TableColumn[] = [
  { 
    field: 'id', header: 'ID / UUID', type: 'user', sortable: true, style: { width: '25%' },
    hideAvatar: true,
    render: (row: any) => `ID: ${row.id}`,
    subField: 'uuid',
    subFieldRender: (row: any) => row.uuid ? `UUID: ${row.uuid.substring(0, 8)}...` : ''
  },
  { 
    field: 'name', header: 'Aplicación', type: 'user', sortable: true, style: { width: '55%' },
    avatarRender: (row: any) => row.icon || '',
    fallbackIcon: 'pi pi-window-maximize',
    render: (row: any) => row.name || 'N/A',
    subField: 'slug',
    subFieldRender: (row: any) => row.slug ? `Slug: ${row.slug}` : ''
  },
  { field: 'is_active', header: 'Estado', type: 'status', sortable: true, style: { width: '20%' } }
];
