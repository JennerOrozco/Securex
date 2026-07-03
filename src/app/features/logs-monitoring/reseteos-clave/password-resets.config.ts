import { TableColumn } from '@shared/table-shared/shared/table.types';

export const PASSWORD_RESETS_COLS: TableColumn[] = [
  { field: 'email', header: 'Usuario (Email)', type: 'user', hideAvatar: true, sortable: true },
  { field: 'app_name', header: 'Aplicación', type: 'text', render: (row) => row.app?.name || row.app_uuid || '-' },
  { field: 'token', header: 'Código OTP', type: 'badge', sortable: true, render: (row) => ({ value: row.token, severity: 'info' }) },
  { field: 'created_at', header: 'Fecha', type: 'date', sortable: true, render: (row) => row.created_at && row.created_at !== '0000-00-00 00:00:00' ? row.created_at : null },
  { field: 'acciones', header: 'Acciones', type: 'actions' }
];
