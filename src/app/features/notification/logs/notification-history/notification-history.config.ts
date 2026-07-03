import { TableColumn } from '@shared/table-shared/shared/table.types';

export const NOTIFICATION_HISTORY_COLS: TableColumn[] = [
  { field: 'id', header: 'ID', type: 'text', sortable: true },
  { field: 'app.name', header: 'Aplicación', type: 'text', sortable: true, render: (row) => row.app?.name || row.app_uuid || 'N/A' },
  { field: 'user.full_name', header: 'Usuario', type: 'user', subField: 'user.email', avatarField: 'user.profile_picture', sortable: true, render: (row) => row.user?.full_name || row.user_email || row.user_uuid || 'Desconocido', subFieldRender: (row) => row.user?.email || row.user_email || 'Sin correo' },
  { field: 'title', header: 'Título', type: 'text', sortable: true },
  { field: 'channels', header: 'Canales', type: 'text', sortable: true },
  { field: 'is_read', header: 'Estado', type: 'status', sortable: true, render: (row) => row.is_read ? 'Leída' : 'Pendiente' },
  { field: 'created_at', header: 'Fecha', type: 'date', sortable: true },
  { field: 'acciones', header: 'Acciones', type: 'actions' }
];
