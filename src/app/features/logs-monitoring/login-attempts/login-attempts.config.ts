import { TableColumn } from '@shared/table-shared/shared/table.types';

export const LOGIN_ATTEMPTS_COLS: TableColumn[] = [
  { field: 'email', header: 'Usuario (Email)', type: 'user', hideAvatar: true, sortable: true },
  { field: 'app_name', header: 'Aplicación', type: 'text', render: (row) => row.app?.name || row.app_uuid || '-' },
  { field: 'ip_address', header: 'IP', type: 'text', sortable: true },
  { field: 'user_agent', header: 'Navegador / Disp.', type: 'text', render: (row) => row.user_agent ? (row.user_agent.length > 40 ? row.user_agent.substring(0, 40) + '...' : row.user_agent) : '' },
  { field: 'success', header: 'Estado', type: 'badge', sortable: true, render: (row) => ({ value: row.success ? 'ÉXITO' : 'FALLIDO', severity: row.success ? 'success' : 'danger' }) },
  { field: 'created_at', header: 'Fecha', type: 'date', sortable: true, render: (row) => row.created_at && row.created_at !== '0000-00-00 00:00:00' ? row.created_at : null },
  { field: 'acciones', header: 'Acciones', type: 'actions' }
];
