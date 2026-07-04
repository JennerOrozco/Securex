import { TableColumn } from '@shared/table-shared/shared/table.types';
import { FormField } from '@shared/modals/modal-shell/modal-shell.types';
import { Observable } from 'rxjs';

export interface SendConfig {
  fn: (service: any, formData: Record<string, any>) => Observable<any>;
  successMessage: string;
}

export const APP_COLS: TableColumn[] = [
  { 
    field: 'name', header: 'Aplicación', type: 'user', sortable: true,
    avatarRender: (row: any) => row.icon || '',
    render: (row: any) => row.name || 'N/A',
    subField: 'uuid',
    subFieldRender: (row: any) => row.uuid ? `UUID: ${row.uuid.substring(0, 8)}...` : ''
  },
  { field: 'acciones', header: 'Acciones', type: 'actions' }
];

export const COMPANY_COLS: TableColumn[] = [
  { 
    field: 'name', header: 'Compañía', type: 'user', sortable: true,
    avatarRender: (row: any) => row.logo || '',
    fallbackIcon: 'pi pi-building',
    render: (row: any) => row.name || 'N/A',
    subField: 'tax_id',
    subFieldRender: (row: any) => row.tax_id || 'Sin NIT'
  },
  { field: 'acciones', header: 'Acciones', type: 'actions' }
];

export const USER_COLS: TableColumn[] = [
  { 
    field: 'full_name', header: 'Usuario', type: 'user', sortable: true,
    avatarRender: (row: any) => row.profile_picture || '',
    fallbackIcon: 'pi pi-user',
    render: (row: any) => row.full_name || 'Desconocido',
    subField: 'email',
    subFieldRender: (row: any) => row.email || 'Sin correo'
  },
  { field: 'acciones', header: 'Acciones', type: 'actions' }
];

export const MESSAGE_FIELDS: FormField[] = [
  { name: 'title', label: 'Título de la Notificación', type: 'text', required: true, icon: 'pi pi-tag', placeholder: 'Ej. Alerta de Seguridad' },
  { name: 'message', label: 'Mensaje', type: 'textarea', required: true, icon: 'pi pi-comment', placeholder: 'Escribe el contenido del mensaje...' },
  { name: 'type', label: 'Tipo de Notificación', type: 'select', required: true, icon: 'pi pi-tag', options: [
    { label: 'Información (INFO)', value: 'INFO' },
    { label: 'Advertencia (WARNING)', value: 'WARNING' },
    { label: 'Error (ERROR)', value: 'ERROR' },
    { label: 'Éxito (SUCCESS)', value: 'SUCCESS' }
  ]},
  { name: 'channels', label: 'Canales de Envío', type: 'select', required: true, icon: 'pi pi-sliders-h', options: [
    { label: 'Push y Email', value: 'PUSH,EMAIL' },
    { label: 'Solo Push', value: 'PUSH' },
    { label: 'Solo Email', value: 'EMAIL' }
  ]}
];

export const SEND_CONFIG: SendConfig = {
  fn: (service, data) => service.sendNotificationToAny(data),
  successMessage: 'Notificación enviada correctamente al usuario.'
};
