import { TableColumn } from '@shared/table-shared/shared/table.types';

export const SEND_ATTEMPTS_COLS: TableColumn[] = [
  { field: 'id', header: 'ID', type: 'text', sortable: true },
  { field: 'app.name', header: 'Aplicación', type: 'text', sortable: true, render: (row) => row.app?.name || row.app_uuid || 'N/A' },
  { field: 'user.full_name', header: 'Usuario', type: 'user', subField: 'user.email', avatarField: 'user.profile_picture', sortable: true, render: (row) => row.user?.full_name || row.user_uuid || 'Desconocido', subFieldRender: (row) => row.user?.email || 'Sin correo' },
  { field: 'ip_address', header: 'Dirección IP', type: 'text', sortable: true },
  { field: 'created_at', header: 'Fecha', type: 'date', sortable: true },
  { field: 'acciones', header: 'Acciones', type: 'actions' }
];
