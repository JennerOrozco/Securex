import { TableColumn } from '@shared/table-shared/shared/table.types';

export const USER_DEVICES_COLS: TableColumn[] = [
  { field: 'id', header: 'ID', type: 'text', sortable: true },
  { field: 'app.name', header: 'Aplicación', type: 'text', sortable: true, render: (row) => row.app?.name || 'N/A' },
  { field: 'user.full_name', header: 'Usuario', type: 'user', subField: 'user.email', avatarField: 'user.profile_picture', sortable: false, filterable: false, render: (row) => row.user?.full_name || 'Desconocido', subFieldRender: (row) => row.user?.email || 'Sin correo' },
  { field: 'device_type', header: 'Tipo', type: 'text', sortable: true },
  { field: 'device_token', header: 'Token', type: 'text', sortable: false },
  { field: 'acciones', header: 'Acciones', type: 'actions' }
];
