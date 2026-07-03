import { FormField } from '@shared/modals/modal-shell/modal-shell.types';
import { TableColumn } from '@shared/table-shared/shared/table.types';

export interface SmtpSetting {
  id?: number;
  app_uuid: string;
  smtp_host: string;
  smtp_port: number;
  smtp_user: string;
  smtp_pass?: string;
  smtp_encryption: string;
  from_email: string;
  from_name: string;
}

export const SMTP_SETTINGS_COLS: TableColumn[] = [
  { 
    field: 'app.name', header: 'App Asociada', type: 'user', sortable: true,
    avatarRender: (row: any) => row.app?.icon || '',
    render: (row: any) => row.app?.name || 'N/A',
    subField: 'app.uuid',
    subFieldRender: (row: any) => row.app?.uuid ? `UUID: ${row.app.uuid.substring(0, 8)}...` : ''
  },
  { field: 'smtp_host', header: 'Host', type: 'text', sortable: true },
  { field: 'from_email', header: 'Remitente', type: 'text', sortable: true },
  { 
    field: 'smtp_encryption', header: 'Encriptación', type: 'badge', sortable: false,
    render: (row: any) => {
      const val = row.smtp_encryption;
      return {
        value: val?.toUpperCase() || 'NONE',
        severity: val === 'tls' || val === 'ssl' ? 'success' : 'warning'
      }
    }
  },
  { field: 'acciones', header: 'Acciones', type: 'actions' }
];

export const createSmtpSettingsForm = (catalogItems: any): FormField[] => [
  {
    name: 'app_uuid', label: 'Aplicación Asociada', type: 'select', required: true, placeholder: '- Selecciona una aplicación -',
    options: (catalogItems['apps'] || []).map((app: any) => ({ label: app.name, value: app.uuid }))
  },
  { name: 'smtp_host', label: 'SMTP Host', type: 'text', required: true, icon: 'pi pi-server', placeholder: 'ej. smtp.gmail.com' },
  { name: 'smtp_port', label: 'SMTP Port', type: 'number', required: true, icon: 'pi pi-hashtag', placeholder: 'ej. 587' },
  { name: 'smtp_user', label: 'Usuario SMTP', type: 'text', required: true, icon: 'pi pi-user', placeholder: 'ej. usuario@dominio.com' },
  { name: 'smtp_pass', label: 'Contraseña SMTP', type: 'password', required: true, icon: 'pi pi-lock', placeholder: 'Ingresa la contraseña SMTP' },
  {
    name: 'smtp_encryption', label: 'Encriptación', type: 'select', required: true, placeholder: '- Selecciona la encriptación -', options: [
      { label: 'TLS', value: 'tls' }, { label: 'SSL', value: 'ssl' }, { label: 'Ninguna', value: 'none' }
    ]
  },
  { name: 'from_email', label: 'Email Remitente', type: 'email', required: true, icon: 'pi pi-envelope', placeholder: 'ej. no-reply@dominio.com' },
  { name: 'from_name', label: 'Nombre Remitente', type: 'text', required: true, icon: 'pi pi-user', placeholder: 'ej. Equipo de Soporte' }
];
