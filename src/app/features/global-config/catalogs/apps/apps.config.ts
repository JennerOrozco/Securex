import { TableColumn } from '@shared/table-shared/shared/table.types';
import { FormField } from '@shared/modals/modal-shell/modal-shell.types';

export const APPS_COLS: TableColumn[] = [
  {
    field: 'name',
    header: 'Aplicación',
    type: 'text',
    sortable: true,
    style: { width: '25%' }
  },
  {
    field: 'slug',
    header: 'Slug / Identificador',
    type: 'text',
    sortable: true,
    copyable: true,
    style: { width: '20%' }
  },
  {
    field: 'api_key',
    header: 'API Key',
    type: 'text',
    sortable: false,
    copyable: true,
    style: { width: '20%' },
    render: (row) => row.api_key ? `${row.api_key.slice(0, 8)}••••••••` : '—'
  },
  {
    field: 'companies',
    header: 'Compañías',
    type: 'badge',
    sortable: false,
    style: { width: '12%', textAlign: 'center' },
    render: (row) => {
      const count = Array.isArray(row.companies) ? row.companies.length : 0;
      return { value: `${count} compañía${count !== 1 ? 's' : ''}`, severity: count > 0 ? 'info' : 'secondary' };
    }
  },
  {
    field: 'is_active',
    header: 'Estado',
    type: 'badge',
    sortable: true,
    style: { width: '10%', textAlign: 'center' },
    filterOptions: [{ label: 'Activo', value: true }, { label: 'Inactivo', value: false }],
    filterOptionLabel: 'label',
    render: (row) => ({
      value: row.is_active ? 'Activo' : 'Inactivo',
      severity: row.is_active ? 'success' : 'danger'
    })
  },
  {
    field: 'actions',
    header: 'Acciones',
    type: 'actions',
    style: { width: '13%', textAlign: 'center' }
  }
];

export const APPS_FORM_FIELDS: FormField[] = [
  // Identidad
  { name: 'name',   label: 'Nombre de la Aplicación',  type: 'text',   required: true,  icon: 'pi pi-th-large', placeholder: 'Ej. CRM Empresarial, Portal Clientes' },
  { name: 'slug',   label: 'Slug / Identificador único', type: 'text',  required: true,  icon: 'pi pi-tag', placeholder: 'Ej. crm-empresarial' },
  { name: 'is_active', label: '¿Está Activa?', type: 'select', required: true,
    options: [{ label: 'Activo', value: true }, { label: 'Inactivo', value: false }]
  },
  // Credenciales de API
  { name: 'api_key',    label: 'API Key',    type: 'text', required: true,  icon: 'pi pi-key', placeholder: 'Clave pública de integración' },
  { name: 'api_secret', label: 'API Secret', type: 'text', required: true,  icon: 'pi pi-lock', placeholder: 'Secreto de integración' },
  // Integración con Google (opcional)
  { name: 'google_client_id',     label: 'Google Client ID',     type: 'text', required: false, icon: 'pi pi-google', placeholder: 'ID de cliente OAuth 2.0 de Google' },
  { name: 'google_client_secret', label: 'Google Client Secret', type: 'text', required: false, icon: 'pi pi-shield', placeholder: 'Secreto de cliente OAuth 2.0' }
];
