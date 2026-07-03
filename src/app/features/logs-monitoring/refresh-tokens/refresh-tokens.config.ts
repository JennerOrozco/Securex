import { TableColumn } from '@shared/table-shared/shared/table.types';

export const REFRESH_TOKENS_COLS: TableColumn[] = [
  { field: 'user_name', header: 'Usuario', type: 'user', subField: 'user.email', sortable: true, render: (row) => row.user?.full_name || row.user?.uuid || row.user_id || '-', avatarField: 'user.profile_picture' },
  { field: 'app_name', header: 'Aplicación', type: 'text', render: (row) => row.app?.name || row.app_id || '-' },
  { field: 'ip_address', header: 'IP', type: 'text', sortable: true },
  { field: 'token_hash', header: 'Token', type: 'text', render: (row) => row.token_hash ? `...${row.token_hash.substring(row.token_hash.length - 12)}` : 'N/A' },
  { field: 'is_revoked', header: 'Estado', type: 'badge', sortable: true,
    render: (row) => ({ value: row.is_revoked ? 'Inactivo' : 'Activo', severity: row.is_revoked ? 'danger' : 'success' }),
    filterOptions: [{ label: 'Activo', value: 'Activo' }, { label: 'Inactivo', value: 'Inactivo' }], filterOptionLabel: 'label' },
  { field: 'expires_at', header: 'Expira', type: 'date', sortable: true, render: (row) => row.expires_at && row.expires_at !== '0000-00-00 00:00:00' ? row.expires_at : null },
  { field: 'created_at', header: 'Creado', type: 'date', sortable: true, render: (row) => row.issued_at && row.issued_at !== '0000-00-00 00:00:00' ? row.issued_at : null },
  { field: 'acciones', header: 'Acciones', type: 'actions' }
];
