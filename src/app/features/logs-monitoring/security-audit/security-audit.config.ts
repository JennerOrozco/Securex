import { TableColumn } from '@shared/table-shared/shared/table.types';

const getSeverityForEvent = (event: string): string => {
  if (!event) return 'default';
  const e = event.toLowerCase();
  if (e.includes('fail') || e.includes('error') || e.includes('delete') || e.includes('revoke')) return 'danger';
  if (e.includes('success') || e.includes('create')) return 'success';
  if (e.includes('update') || e.includes('reset') || e.includes('request') || e.includes('warn')) return 'warning';
  return 'info';
};

export const SECURITY_AUDIT_COLS: TableColumn[] = [
  { field: 'user_name', header: 'Usuario', type: 'user', subField: 'user.email', sortable: true, avatarField: 'user.profile_picture' },
  { field: 'app_name', header: 'Aplicación / Compañía', type: 'user', subField: 'company_name', hideAvatar: true, sortable: true, render: (row) => row.app?.name || row.app_uuid || '-', subFieldRender: (row) => row.company?.name || row.company_uuid || '-' },
  { field: 'event_type', header: 'Evento', type: 'badge', sortable: true, filterOptions: [], filterMulti: true, render: (row) => ({ value: row.event_type, severity: getSeverityForEvent(row.event_type) }) },
  { field: 'description', header: 'Descripción', type: 'text', sortable: true },
  { field: 'ip_address', header: 'IP', type: 'text', sortable: true },
  { field: 'acciones', header: 'Acciones', type: 'actions' }
];
