import { FormField } from '@shared/modals/modal-shell/modal-shell.types';
import { TableColumn } from '@shared/table-shared/shared/table.types';

export interface PushSetting {
  id?: number;
  app_uuid: string;
  vapid_public_key: string;
  vapid_private_key: string;
  vapid_subject?: string;
  icon?: string | File;
  url_base?: string;
}

export const PUSH_SETTINGS_COLS: TableColumn[] = [
  {
    field: 'app.name', header: 'App Asociada', type: 'user', sortable: true, style: { width: '25%' },
    avatarRender: (row: any) => row.icon || '',
    fallbackIcon: 'pi pi-bell',
    render: (row: any) => row.app?.name || 'N/A',
    subField: 'app_uuid',
    subFieldRender: (row: any) => {
      const slug = row.app?.slug ? `Slug: ${row.app.slug} | ` : '';
      const uuid = row.app_uuid ? `UUID: ${row.app_uuid.substring(0, 8)}...` : '';
      return slug + uuid;
    }
  },
  {
    field: 'vapid_keys', header: 'VAPID Keys', type: 'user', sortable: false, style: { width: '20%' },
    hideAvatar: true,
    render: (row: any) => `Pub: ${row.vapid_public_key?.substring(0, 15)}...`,
    subField: 'vapid_private_key',
    subFieldRender: (row: any) => `Priv: ${row.vapid_private_key?.substring(0, 15)}...`
  },
  { field: 'url_base', header: 'URL Base', type: 'text', sortable: true, style: { width: '20%' } },
  { field: 'vapid_subject', header: 'Subject', type: 'text', sortable: true, style: { width: '20%' } },
  { field: 'acciones', header: 'Acciones', type: 'actions' }
];

export const createPushSettingsForm = (catalogItems: any): FormField[] => [
  {
    name: 'app_uuid', label: 'Aplicación Asociada', type: 'select', required: true, icon: 'pi pi-th-large', placeholder: '- Selecciona una aplicación -',
    options: (catalogItems['apps'] || []).map((app: any) => ({ label: app.name, value: app.uuid }))
  },
  { name: 'vapid_public_key', label: 'VAPID Public Key', type: 'text', required: true, icon: 'pi pi-key', placeholder: 'Clave pública VAPID' },
  { name: 'vapid_private_key', label: 'VAPID Private Key', type: 'text', required: true, icon: 'pi pi-key', placeholder: 'Clave privada VAPID' },
  { name: 'vapid_subject', label: 'VAPID Subject', type: 'text', required: false, icon: 'pi pi-envelope', placeholder: 'ej. mailto:admin@dominio.com' },
  { name: 'icon', label: 'Icono de Notificación', type: 'file', required: false, accept: 'image/*', icon: 'pi pi-image', fallbackIcon: 'pi-bell', placeholder: 'Sube un ícono (opcional)' },
  { name: 'url_base', label: 'URL Base', type: 'text', required: false, icon: 'pi pi-link', placeholder: 'ej. https://midominio.com' }
];
