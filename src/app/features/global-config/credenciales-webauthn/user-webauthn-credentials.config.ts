import { TableColumn } from '@shared/table-shared/shared/table.types';

export const WEBAUTHN_CREDENTIALS_COLS: TableColumn[] = [
  { field: 'user_name', header: 'Usuario', type: 'user', subField: 'email', sortable: true },
  { field: 'app_name', header: 'Aplicación', type: 'text', sortable: true },
  { field: 'device_name', header: 'Dispositivo', type: 'text', sortable: true },
  { field: 'credential_id', header: 'Credential ID', type: 'text', render: (row) => row.credential_id ? `...${row.credential_id.substring(row.credential_id.length - 8)}` : 'N/A' },
  { field: 'created_at', header: 'Registrado', type: 'date', sortable: true },
  { field: 'acciones', header: 'Acciones', type: 'actions' }
];
